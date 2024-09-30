import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ChainsService } from 'src/chains/chains.service';
import { LanguageDetectorService } from 'src/language-detector/language-detector.service';
import z from 'zod';
import {
  ClassificationItem,
  FlowAiModuleOptions,
  FlowTree,
} from './flow-ai.types';
import { DynamicFlowService } from './dynamic-flow.service';
import { Interaction } from '../schemas/interaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RelevanceCheckService } from './response-relevance.service';
import { FlowTreeDocument } from '../schemas/flowTree.schema';
import { Conversation } from '../schemas/creator-conversation.schema';
import { CounterService } from '../counter/counter.service';
import { IntentType } from './flow-ai.types';
import { v4 as uuidv4 } from 'uuid';
import { extractAllNodes } from '../utilis/treeTraversal/treeUtilis';
import { buildMessages } from '../utilis/Interaction/messageBuilder';
import { createConversation } from '../utilis/Conversation/conversationCreator';
import { createInteraction } from '../utilis/Interaction/interactionCreator';
import { getConversation } from '../utilis/Conversation/getConversation';

@Injectable()
export class FlowAiService {
  private flowTree: FlowTree;
  private model: any;
  private llama3: any;

  constructor(
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
    @InjectModel(FlowTreeDocument.name) private flowTreeModel: Model<FlowTreeDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private readonly languageDetectorService: LanguageDetectorService,
    private readonly chainsService: ChainsService,
    private readonly options: FlowAiModuleOptions,
    private readonly dynamicFlowService: DynamicFlowService,
    private readonly relevanceCheckService: RelevanceCheckService,
    private readonly counterService: CounterService

  ) {
    this.model = options.model;
  }

  async saveDynamicFlowTree(userId: string, description: string, flowTree: any): Promise<FlowTreeDocument> {
    try {
      const treeId = await this.counterService.getNextTreeId();
      if (!treeId) {
        throw new Error('Generated treeId is null or undefined');
      }
      const newFlowTree = new this.flowTreeModel({
        userId,
        treeId,
        description,
        flowTree
      });

      return await newFlowTree.save();
    } catch (error) {
      console.error('Error saving flow tree:', error);
      throw new InternalServerErrorException('Failed to save dynamic flow tree', error.message);
    }
  }

  async loadTree(treeId: string): Promise<FlowTree> {
    const flowTreeDocument = await this.flowTreeModel.findOne({treeId });

    if (!flowTreeDocument) {
      throw new NotFoundException(`FlowTree not found for treeId ${treeId}`);
    }

    let flowTreeObj;
    try {
      // Safely evaluate the flowTree string into an object
      const code = `return ${flowTreeDocument.flowTree};`;
      flowTreeObj = new Function('IntentType', 'z', code)(IntentType, z);
    } catch (e) {
      console.error('Error evaluating flowTree:', e);
      throw new Error('Invalid flowTree format in database.');
    }

    return flowTreeObj; // Return the actual tree object
  }

  async createDynamicChatbot(description: string, refinedDescription: string, userId: string, conversationId: string | undefined): Promise<any> {
    // Generate or use existing conversation ID
    const conversationIdResolved = conversationId || uuidv4(); // if not create
    const existingConversation = await getConversation(this.conversationModel, userId, conversationIdResolved); // fetch existing conversation
    let messages: { role: string, content: string }[] = []; // array for conversation history

    let finalRefinedDescription = description;

    if (existingConversation && existingConversation.length > 0) { // if conversation is existing
      // Build finalRefinedDescription from previous conversations
      existingConversation.forEach(conversation => {
        // Accumulate refinedDescriptions
        finalRefinedDescription += ' ' + conversation.refinedDescription;
        // Add individual user messages to the messages array
        messages.push({ role: 'user', content: conversation.refinedDescription });
        try {
          const aiResponseObj = JSON.parse(conversation.aiResponse);
          if (aiResponseObj.followUpPrompts && Array.isArray(aiResponseObj.followUpPrompts)) {
            aiResponseObj.followUpPrompts.forEach(prompt => {
              messages.push({ role: 'system', content: prompt });
            });
          } else {
            console.error('followUpPrompts is undefined or not an array');
          }
        } catch (error) {
          console.error('Error parsing AI response:', error);
        }
      });
    } else { // condition when conversation was starting
      messages.push({ role: 'user', content: description });
    }

    if (refinedDescription) {
      // Append current refinedDescription to finalRefinedDescription
      finalRefinedDescription += ' ' + refinedDescription;
      // Add the current user input to messages
      messages.push({ role: 'user', content: refinedDescription });
    }

    const userDone = await this.dynamicFlowService.checkIfUserIsDone(refinedDescription, messages);

    if (userDone == 'true') {
      const response = await this.dynamicFlowService.generateEnhancedPrompt(finalRefinedDescription, messages); //returns json that needs to be converted
      let descriptionObject: any;
      try {
        descriptionObject = JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing description JSON:', parseError);
        throw new InternalServerErrorException('Invalid JSON format in description');
      }
      const improvePrompt = descriptionObject.improvePrompt;
      const dynamicFlowTree = await this.dynamicFlowService.generateDynamicFlow(improvePrompt);

      const finalConversation = {
        userId,
        conversationId: conversationIdResolved,
        description,
        refinedDescription, // Store only the current input
        followUpPrompts: [],
        aiResponse: JSON.stringify(dynamicFlowTree)
      };
      await createConversation(this.conversationModel, finalConversation);
      const savedFlowTree= await this.saveDynamicFlowTree(userId, finalRefinedDescription, dynamicFlowTree);
      const treeId = savedFlowTree.treeId
      return {treeId,dynamicFlowTree};
    } else {
      const analysis = await this.dynamicFlowService.analyzeInput(finalRefinedDescription, messages);
      const ongoingConversation = {
        userId,
        conversationId: conversationIdResolved,
        description,
        refinedDescription, // Store only the current input
        followUpPrompts: analysis.followUpPrompts,
        aiResponse: JSON.stringify(analysis)
      };
      await createConversation(this.conversationModel, ongoingConversation);
      return {
        complete: false,
        conversationId: conversationIdResolved,
        followUpPrompts: analysis.followUpPrompts,
        refinedDescription: finalRefinedDescription,
        description
      };
    }
  }

  async classify(
    sessionId: string,
    userId: string,
    treeId: string,
    query: string,
    flow_start: string,
    followup_value: string = '',
    classifyFollowup: boolean = false,
    lang: string = '',
  ) {
    this.flowTree = await this.loadTree(treeId);

    if (typeof this.flowTree.name !== 'string') {
      throw new Error('Flow tree name property is missing or not a string');
    }

    const path: ClassificationItem[] = [];
    const result = {
      path: path,
    };
    let name = flow_start || this.flowTree.name;

    const allNodes = await extractAllNodes(this.flowTree);

    let lastUserInput = followup_value ? followup_value : query;

    const interactionData = {
      sessionId,
      userId,
      query,
      flowStart: flow_start,
      followupValue: lastUserInput,
      aiResponse: '',
      createdAt: new Date(),
    };

    const existingInteractions = await this.interactionModel.find({ userId, sessionId }).sort({ createdAt: 1 }).exec();
    let messages = buildMessages(existingInteractions, lastUserInput);

    while (true) {
      let node = this.findByName(this.flowTree, name); // searches node by name

      const endNodeCheck = await this.dynamicFlowService.logicalEnd(lastUserInput, allNodes, flow_start);
      if (endNodeCheck !== 'Null') {

        if (!flow_start) {
          // Attempt to find the most relevant node
          let mostRelevantNode = await this.relevanceCheckService.findMostRelevantNode(lastUserInput, allNodes, flow_start);
          // console.log('MostRelevantNodes:', JSON.stringify(mostRelevantNode, null, 2));

          if (mostRelevantNode) {
            node = mostRelevantNode;

            // Process the node based on its structure
            if (node.children || (node.child && !node.schema)) {
              const childrenArray = node.children || [node.child];

              if (childrenArray.length === 1 && (childrenArray[0].children || childrenArray[0].schema)) {
                // console.log('Only one child with further children or schema, proceeding to child node.');
                node = childrenArray[0];

                if (node.children) {
                  // Handle nodes with children
                  const refinedText = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, node.description);
                  let options = node.children.map(grandchild => ({
                    title: grandchild.name,
                    id: grandchild.name.replace(/ /g, '_')
                  }));
                  result['followup'] = {
                    text: refinedText,
                    followup_type: 'selection',
                    options: options,
                  };
                  result['intent'] = node.name;
                  interactionData.aiResponse = refinedText;
                  const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                  return result;
                } else if (node.schema) {
                  // Handle nodes with a schema
                  const options = node.schema._def.values.map(option => ({
                    title: option,
                    id: option.replace(/ /g, '_')
                  }));
                  result['followup'] = {
                    text: node.description,
                    followup_type: 'selection',
                    options: options,
                  };
                  result['intent'] = node.name;
                  interactionData.aiResponse = node.description;
                  const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                  return result;
                }
              } else {
                // Multiple children, list them as options
                const refinedText = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, node.description);
                let options = childrenArray.map(child => ({
                  title: child.name,
                  id: child.name.replace(/ /g, '_')
                }));
                result['followup'] = {
                  text: refinedText,
                  followup_type: 'selection',
                  options: options,
                };
                result['intent'] = node.name;
                interactionData.aiResponse = refinedText;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;
              }
            } else if (node.schema) {
              // Handle node with schema directly
              const options = node.schema._def.values.map(option => ({
                title: option,
                id: option.replace(/ /g, '_')
              }));
              result['followup'] = {
                text: node.description,
                followup_type: 'selection',
                options: options,
              };
              result['intent'] = node.name;
              interactionData.aiResponse = node.description;
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              return result;
            } else {
              // Leaf node
              const refinedText = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, node.description);
              result['followup'] = {
                text: refinedText,
                followup_type: node.type,
                options: [],
              };
              result['intent'] = node.name;
              interactionData.aiResponse = refinedText;
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              return result;
            }
          } else {
            // Default behavior: present initial options
            if (node.children || node.child) {
              const nodeDescription = node.description;
              const greetingMessage = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, nodeDescription);

              // Create an array that contains either the children or wraps the child node into an array
              const childrenArray = node.children || [node.child];

              // This assumes that the structure or ordering of children is consistent
              // where the first child is always the 'service_type' node or equivalent
              const serviceTypeNode = childrenArray[0];

              if (serviceTypeNode) {
                let options = [];
                if (serviceTypeNode.schema && serviceTypeNode.schema._def && serviceTypeNode.schema._def.values) {
                  options = serviceTypeNode.schema._def.values; // Extract enum values
                } else {
                  console.error('Schema values not found. Ensure the schema is correctly defined.');
                }
                result['followup'] = {
                  text: nodeDescription,  // Using the node description from above for consistency
                  followup_type: 'selection',
                  options: options.map(option => ({
                    title: option,
                    id: option.replace(/ /g, '_'),
                  })),
                };
                result['intent'] = serviceTypeNode.name;
                interactionData.aiResponse = nodeDescription;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;
              } else {
                console.error('Service type node not found among children.');
                // Handle the case where the expected service type node is not found
                return {
                  error: "Service type node not found. Check the node configuration."
                };
              }
            } else {
              // Handle error or unexpected node structure
              return {
                error: 'Expected node no children found'
              };
            }
          }
        }


        if (node.type === 'selection') // schecking if node is selection
        {
          const userInput = lastUserInput.toLowerCase(); // converting userinput to lower case
          const selectionMatch = node.children.find(child => child.name.toLowerCase() === userInput); // matching userinput with the options/selections
          if (selectionMatch) // if they are a match
          {
            // Handle the selection response directly
            name = selectionMatch.name;
            node = selectionMatch;

            if (node.children || (node.child && !node.schema)) // if the matched node has children or child with no schema itself
            {
              const childrenArray = node.children || [node.child]; // ensuring that whether it has a child or children, treat it as an array
              // console.log('111')
              if (childrenArray.length === 1 && childrenArray[0].children) // If there is only one child and it has further children, skip to displaying its children
              {
                node = childrenArray[0]; // Switching context to the single child allowing to display grand child
                const refinedText = await this.dynamicFlowService.refineFollowupText(userInput, node.description, flow_start, []); // fetching new description for new node context
                // mapping onto options basically ( YES NO )
                let options = node.children.map(grandchild => ({
                  title: grandchild.name,
                  id: grandchild.name.replace(/ /g, '_')
                }));
                result['followup'] = {
                  text: refinedText,
                  followup_type: 'selection',
                  options: options,  // Displaying grandchildren as options directly
                };
                result['intent'] = node.name;  // Update to the child's name
                interactionData.aiResponse = refinedText;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;
              }

              else // If there are multiple children, list them as options, remaining logic same as before
              {
                // console.log('222')
                const refinedText = await this.dynamicFlowService.refineFollowupText(userInput, node.description, flow_start, []); // Obtain refined text

                let options = childrenArray.map(child => ({
                  title: child.name,
                  id: child.name.replace(/ /g, '_')
                }));

                result['followup'] = {
                  text: refinedText,
                  followup_type: 'selection',
                  options: options,
                };
                result['intent'] = node.name;
                interactionData.aiResponse = refinedText;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;
              }
            }
            // console.log('333')
            // fallback block where above checks of child grandchild fail, for the last node in a specific path
            const refinedText = await this.dynamicFlowService.refineFollowupText(userInput, node.description, flow_start, []); //
            result['followup'] = {
              text: refinedText,
              followup_type: node.type,
              options: []
            };
            result['intent'] = node.name;
            interactionData.aiResponse = refinedText;
            const savedInteraction = await createInteraction(this.interactionModel, interactionData);
            return result;

          }
          else // this condtion is triggered when the user does not enter a completely similar response, originally selections are shown but if enters text instead of selection
          {
            let mostRelevantNode = await this.relevanceCheckService.findMostRelevantNode(lastUserInput, allNodes, flow_start);// checking relevent node to user input
            // console.log('MostRelevantNode:', JSON.stringify(mostRelevantNode, null, 2));
            // console.log('444')
            node = mostRelevantNode; // assigning value to current node

            if (node) // if node exists
            {
              if (node.children || (node.child && !node.schema)) // if node has child or children and no schema
              {
                const childrenArray = node.children || [node.child]; // ensuring that whether child or children treat as array
                // console.log('555')
                if (childrenArray.length === 1 && (childrenArray[0].children || childrenArray[0].schema)) // checking if only child, that child has children and schema
                {
                  node = childrenArray[0]; // update node to this child, moving deeper into tree
                  if (node.children) // checking if this node has children
                  {
                    // Handle children
                    const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, []);

                    //creating array for options
                    let options = node.children.map(grandchild => ({
                      title: grandchild.name,
                      id: grandchild.name.replace(/ /g, '_')
                    }));
                    result['followup'] = {
                      text: refinedText,
                      followup_type: 'selection',
                      options: options,
                    };
                    result['intent'] = node.name;
                    interactionData.aiResponse = refinedText;
                    const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                    return result;

                  } else if (node.schema) // if node doesnt have children but schema ( for decision point like Yes or No)
                  {
                    // console.log('666')
                    // Handle schema-based options
                    const options = node.schema._def.values.map(option => ({
                      title: option,
                      id: option.replace(/ /g, '_')
                    }));
                    result['followup'] = {
                      text: node.description,
                      followup_type: 'selection',
                      options: options,
                    };
                    result['intent'] = node.name;
                    interactionData.aiResponse = node.description;
                    const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                    return result;
                  }
                } else // Multiple children, list them as options
                {
                  // console.log('777')
                  let optionTitles = childrenArray.map(child => child.name);
                  // Attempt to match the last user input to one of the child node options
                  const bestMatchedOption = await this.dynamicFlowService.handleOption(lastUserInput, node.description, optionTitles);

                  if (bestMatchedOption) {
                    const selectedChild = childrenArray.find(child => child.name === bestMatchedOption);
                    if (selectedChild) {
                      const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, selectedChild.description, flow_start, []);
                      let options = selectedChild.children ? selectedChild.children.map(c => ({
                        title: c.name,
                        id: c.name.replace(/ /g, '_')
                      })) : [];

                      result['followup'] = {
                        text: refinedText,
                        followup_type: selectedChild.children ? 'selection' : 'message',
                        options: options
                      };
                      result['intent'] = selectedChild.name;
                      interactionData.aiResponse = refinedText;
                      const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                      return result;
                    }
                  }

                  // If no valid option is matched or bestMatchedOption is null
                  const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, []);
                  result['followup'] = {
                    text: refinedText || "I couldn't find a matching option. Could you please specify your question from the following?",
                    followup_type: 'selection',
                    options: childrenArray.map(child => ({
                      title: child.name,
                      id: child.name.replace(/ /g, '_')
                    }))
                  };
                  result['intent'] = node.name;
                  interactionData.aiResponse = refinedText;
                  const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                  return result;
                }
              }
              else if (node.schema) // Handle node with schema directly
              {
                // console.log('888')
                const options = node.schema._def.values.map(option => ({
                  title: option,
                  id: option.replace(/ /g, '_')
                }));
                result['followup'] = {
                  text: node.description,
                  followup_type: 'selection',
                  options: options,
                };
                result['intent'] = node.name;
                interactionData.aiResponse = node.description;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;

              } else // leaf node
              {
                // console.log('999')
                const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, []);
                result['followup'] = {
                  text: refinedText,
                  followup_type: node.type,
                };
                result['intent'] = node.name;
                interactionData.aiResponse = node.description;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;
              }
            }
            else {

              // No relevant node found, give a generic response or re-prompt
              result['followup'] = {
                text: "I donot posses information to your query. Please try again !!!",
                followup_type: 'error',
                options: []
              };
              // result['intent'] = node.name; // Keep the current intent, or you might want to route them to a help or main menu node
              interactionData.aiResponse = "I donot posses information to your query. Please try again !!!";
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              return result;
            }
          }
        }

        const mostRelevantNode = await this.relevanceCheckService.findMostRelevantNode(lastUserInput, allNodes, flow_start);
        if (mostRelevantNode && node.type !== 'intermediate' && mostRelevantNode.type !== 'selection') {
          // console.log('not intermediate or selection');
          // Redirect to the most relevant node
          name = mostRelevantNode.name;
          node = mostRelevantNode;
          followup_value = ''; // Reset followup_value
          path.push({
            intent: name,
            value: lastUserInput,
          });

          const options = node.children && node.children.length > 0 ? node.children.map(child => child.name) : [];
          const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, options);

          // Return the result for the current node
          result['followup'] = {
            text: refinedText,
            followup_type: node.type,
            options: node.children ? node.children.map(child => ({
              title: child.name,
              id: child.name,
            })) : [] // Provide current options if available
          };

          result['intent'] = node.name; // Set intent to the final node
          interactionData.aiResponse = refinedText;
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          return result;
        }
        else if (mostRelevantNode && node.type === 'intermediate') {
          // console.log('intermediate')
          // Handle intermediate node
          if (node.children) {
            name = mostRelevantNode.child.name;  // Move to the child node
            node = mostRelevantNode.child;  // Set the current node to the child
          } else {
            name = mostRelevantNode.name;  // Set the current node to the child
            node = mostRelevantNode;  // Set the current node to the child
          }
          path.push({
            intent: name,
            value: node.description,
          });

          const options = node.children && node.children.length > 0 ? node.children.map(child => child.name) : [];
          const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, options,);

          // Return the result for the current node
          result['followup'] = {
            text: refinedText,
            followup_type: node.type,
            options: node.children ? node.children.map(child => ({
              title: child.name,
              id: child.name,
            })) : [] // Provide current options if available
          };

          result['intent'] = node.name; // Set intent to the final node
          interactionData.aiResponse = refinedText;
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          return result;

        }
        else if (mostRelevantNode && mostRelevantNode.type === 'selection') {
          // console.log('Handling selection node:', mostRelevantNode.name);

          name = mostRelevantNode.name;  // Set the current node to the child
          node = mostRelevantNode;  // Set the current node to the child

          // console.log('Node children:', node.children);
          if (node.type === 'selection' && node.children && node.children.length > 0) {
            console.log("Handling selection node:", node.children);
          } else {
            console.log("Node children are missing or type is incorrect");
          }


          if (!path.some(p => p.intent === name)) {
            path.push({
              intent: name,
              value: node.description, // Use the last user input or node description
            });
          }

          const options = node.children && node.children.length > 0 ? node.children.map(child => child.name) : [];
          const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, options);

          if (node.children && node.children.length > 0) {
            interactionData.aiResponse = refinedText;
            const savedInteraction = await createInteraction(this.interactionModel, interactionData);
            result['followup'] = {
              text: refinedText,
              followup_type: node.type,
              options: node.children.map(child => ({
                title: child.name,
                id: child.name,
              }))
            };
          } else {
            result['followup'] = {
              text: node.description,
              followup_type: node.type,
              options: [] // No children available
            };
            interactionData.aiResponse = node.description;
            const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          }

          result['intent'] = node.name; // Set the intent to the current node
          return result;

        }
        else if (mostRelevantNode === null) {
          console.log('Null ')
          const endNodeCheck = await this.dynamicFlowService.logicalEnd(query, allNodes, flow_start);
          const refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start);
          if (endNodeCheck !== 'Null') {
          }
          
          interactionData.aiResponse = endNodeCheck;

          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          // No relevant node found
          result['followup'] = {
            text: endNodeCheck,
            followup_type: node.type, // Assuming node.type is the current node type
            options: node.children ? node.children.map(child => ({
              title: child.name,
              id: child.name,
            })) : [] // Provide current options if available
          };
          result['intent'] = node.name; // Keep user at the same node
          return result;
        }
        else {
          interactionData.aiResponse = endNodeCheck;
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          return {
            complete: true,
            message: endNodeCheck // Assuming this contains the final message to the user
          };
        }
      }
      else {
        interactionData.aiResponse = endNodeCheck;
        const savedInteraction = await createInteraction(this.interactionModel, interactionData);
        return {
          complete: true,
          message: endNodeCheck // Assuming this contains the final message to the user
        };

      }
    }
  }

  private findByName(node: FlowTree, name: string): FlowTree | undefined {
    // Base case: If the current node's name matches the target name
    if (node.name === name) {
      return node;
    }
    // Recursive case: Check if the node has 'children' and recurse into them
    if (node.children) {
      for (let child of node.children) {
        const result = this.findByName(child, name);
        if (result) return result;
      }
    }
    // Check for a singular 'child' property and recurse into it
    if (node.child) {
      return this.findByName(node.child, name);
    }
    return undefined;
  }
}
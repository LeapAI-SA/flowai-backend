import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import { ChainsService } from 'src/chains/chains.service';
import { LanguageDetectorService } from 'src/language-detector/language-detector.service';
import z from 'zod';
import {
  ClassificationItem,
  FlowAiModuleOptions,
  FlowTree,
} from './flow-ai.types';
import { DynamicFlowService } from './dynamic-flow.service';
import { FaqService } from '../faq/faq.service';
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
import * as fs from 'fs';


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
    //private readonly chainsService: ChainsService,
    private readonly options: FlowAiModuleOptions,
    private readonly dynamicFlowService: DynamicFlowService,
    private readonly relevanceCheckService: RelevanceCheckService,
    private readonly counterService: CounterService,
    private readonly faqService: FaqService,

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
    const flowTreeDocument = await this.flowTreeModel.findOne({ treeId });

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

  async handleDynamicFlowCreation(
    dynamicFlowService,
    conversationModel,
    faqService,
    userId,
    conversationIdResolved,
    description,
    refinedDescription,
    finalRefinedDescription,
    messages,
    pdfPath,
    fileExists
  ): Promise<{ treeId: string, dynamicFlowTree: any }> {
    const response = await dynamicFlowService.generateEnhancedPrompt(finalRefinedDescription, messages); //returns json that needs to be converted

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
      conversationStage: 'Completed',
      description,
      refinedDescription, // Store only the current input
      followUpPrompts: [],
      aiResponse: JSON.stringify(dynamicFlowTree)
    };
    await createConversation(this.conversationModel, finalConversation);
    const savedFlowTree = await this.saveDynamicFlowTree(userId, finalRefinedDescription, dynamicFlowTree);
    const treeId = savedFlowTree.treeId
    try {
      fileExists = fs.existsSync(pdfPath);
    } catch (error) {
      console.error('Error checking file existence:', error);
      throw new InternalServerErrorException('Error checking for file existence');
    }
    if (fileExists) {
      await this.faqService.processPDFandAddToCollection(pdfPath, treeId, userId);
    }
    return { treeId, dynamicFlowTree };
  }


  async createDynamicChatbot(description: string, refinedDescription: string, userId: string, conversationId: string | undefined, file: Express.Multer.File): Promise<any> {
    // Generate or use existing conversation ID
    const conversationIdResolved = conversationId || uuidv4(); // if not create
    const existingConversation = await getConversation(this.conversationModel, userId, conversationIdResolved); // fetch existing conversation
    let lang= await this.languageDetectorService.detectLanguage(description)
    const pdfPath = `./uploads/files-${userId}-${conversationId}-.pdf`;
    let fileExists = false;
    let fileUploaded = false;
    fileExists = fs.existsSync(pdfPath);
    if (fileExists) {
      fileUploaded = true
    }
    let messages: { role: string, content: string }[] = []; // array for conversation history

    let finalRefinedDescription = description;
    let conversationStage;
    if (existingConversation) {
      conversationStage = existingConversation[existingConversation.length - 1].conversationStage;
    }

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

    if (conversationStage === 'Awaiting PDF') {
      const { treeId, dynamicFlowTree } = await this.handleDynamicFlowCreation(
        this.dynamicFlowService,
        this.conversationModel,
        this.faqService,
        userId,
        conversationIdResolved,
        description,
        refinedDescription,
        finalRefinedDescription,
        messages,
        pdfPath,
        fileExists
      );
      return { treeId, dynamicFlowTree };
    }
    if (conversationStage === 'Awaiting Confirmation') {
      const endCheck = await this.dynamicFlowService.confirmUserisDone(finalRefinedDescription, messages,); //returns json that needs to be
      if (endCheck == 'true') {
        const { treeId, dynamicFlowTree } = await this.handleDynamicFlowCreation(
          this.dynamicFlowService,
          this.conversationModel,
          this.faqService,
          userId,
          conversationIdResolved,
          description,
          refinedDescription,
          finalRefinedDescription,
          messages,
          pdfPath,
          fileExists
        );
        return { treeId, dynamicFlowTree };
      }
      else {
        const analysis = await this.dynamicFlowService.analyzeInput(finalRefinedDescription, messages, fileUploaded);
        const ongoingConversation = {
          userId,
          conversationId: conversationIdResolved,
          description,
          conversationStage: 'collectingInfo',
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

    const userStatus = await this.dynamicFlowService.checkIfUserIsDone(refinedDescription, messages);
    if (userStatus == 'true') {
      if (fileUploaded) {
        let pdfUploadPrompt = 'Do you have any further information you would like to provide to help with building your chatbot?';
        if (lang.code=='ar'){ 
          pdfUploadPrompt ='هل لديك أي معلومات إضافية ترغب في تقديمها للمساعدة في بناء برنامج الدردشة الآلي الخاص بك؟';
        }
        const ongoingConversation = {
          userId,
          conversationId: conversationIdResolved,
          description,
          conversationStage: 'Awaiting Confirmation',
          refinedDescription,
          followUpPrompts: [pdfUploadPrompt],
          aiResponse: JSON.stringify({
            message: pdfUploadPrompt,
            fileUploaded: fileUploaded
          }),
        };
        await createConversation(this.conversationModel, ongoingConversation);
        return {
          complete: false,
          conversationId: conversationIdResolved,
          followUpPrompts: [pdfUploadPrompt],
          refinedDescription: finalRefinedDescription,
          description
        };
      }
      else {
        let pdfUploadPrompt = 'Do you have any PDF to share with me for additional information?';
        if (lang.code=='ar'){ 
          pdfUploadPrompt ='هل لديك أي ملف PDF لمشاركته معي للحصول على معلومات إضافية؟';
        }
        const ongoingConversation = {
          userId,
          conversationId: conversationIdResolved,
          description,
          conversationStage: 'Awaiting PDF',
          refinedDescription,
          followUpPrompts: [pdfUploadPrompt],
          aiResponse: JSON.stringify({
            message: pdfUploadPrompt,
            fileUploaded: fileUploaded
          }),
        };
        await createConversation(this.conversationModel, ongoingConversation);
        return {
          complete: false,
          conversationId: conversationIdResolved,
          followUpPrompts: [pdfUploadPrompt],
          refinedDescription: finalRefinedDescription,
          description
        };
      }
    }
    else {
      const analysis = await this.dynamicFlowService.analyzeInput(finalRefinedDescription, messages, fileUploaded);
      const ongoingConversation = {
        userId,
        conversationId: conversationIdResolved,
        description,
        conversationStage: 'collectingInfo',
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
    //lang: string = '',
  ) {
    try {
      this.flowTree = await this.loadTree(treeId);
    } catch (error) {
      console.error('Error loading flow tree:', error);
      // Handle the case where the flow tree does not exist
      this.flowTree = null;
    }

    const path: ClassificationItem[] = [];
    const result = {
      path: path,
    };
    let name = flow_start || this.flowTree.name;

    const allNodes = await extractAllNodes(this.flowTree);

    let lastUserInput = followup_value ? followup_value : query;

    let lang= await this.languageDetectorService.detectLanguage(lastUserInput)

    const interactionData = {
      sessionId,
      userId,
      query: query || "",
      flowStart: flow_start,
      followupValue: lastUserInput,
      aiResponse: '',
      createdAt: new Date(),
    };
    const existingInteractions = await this.interactionModel.find({ userId, sessionId }).sort({ createdAt: 1 }).exec();
    let messages = buildMessages(existingInteractions, lastUserInput);

    while (true) {
      let node = this.findByName(this.flowTree, name); // searches node by name

      const endNodeCheck = await this.dynamicFlowService.logicalEnd(lastUserInput, allNodes, flow_start, messages);
      if (endNodeCheck !== 'Null') {
        interactionData.aiResponse = endNodeCheck;
        const savedInteraction = await createInteraction(this.interactionModel, interactionData);
        result['followup'] = {
          text: endNodeCheck,
          followup_type: node.type,
        };
        return result;
      }

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
                let refinedText = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, node.description);
                refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
                let options = await Promise.all(node.children.map(async (grandchild) => ({
                  title: await this.dynamicFlowService.translateOption(this.formatTitle(grandchild.name), lang),
                  id: grandchild.name.replace(/ /g, '_')
                })));
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
                const options = await Promise.all(node.schema._def.values.map(async (option) => ({
                  title: await this.dynamicFlowService.translateOption(this.formatTitle(option), lang),
                  id: option.replace(/ /g, '_')
                })));
                result['followup'] = {
                  text: await this.dynamicFlowService.translateOption(node.description,lang),
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
              let refinedText = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, node.description);
              refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
              let options = await Promise.all(childrenArray.map(async (child) => ({
                title: await this.dynamicFlowService.translateOption(this.formatTitle(child.name), lang),
                id: child.name.replace(/ /g, '_')
              })));
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
            const options = await Promise.all(node.schema._def.values.map(async (option) => ({
              title: await this.dynamicFlowService.translateOption(this.formatTitle(option), lang),
              id: option.replace(/ /g, '_')
            })));
            result['followup'] = {
              text: await this.dynamicFlowService.translateOption(node.description,lang),
              followup_type: 'selection',
              options: options,
            };
            result['intent'] = node.name;
            interactionData.aiResponse = node.description;
            const savedInteraction = await createInteraction(this.interactionModel, interactionData);
            return result;
          } else {
            // Leaf node
            let refinedText = await this.dynamicFlowService.generateInitialGreeting(lastUserInput, node.description);
            refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
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
                options: await Promise.all(options.map(async (option) => ({
                  title: await this.dynamicFlowService.translateOption(this.formatTitle(option), lang),
                  id: option.replace(/ /g, '_'),
                }))),
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

      if (node.type === 'selection') {
        const userInput = lastUserInput.toLowerCase(); // converting user input to lower case
        const selectionMatch = node.children.find(child => child.name.toLowerCase() === userInput); // matching user input with the options/selections
        if (selectionMatch) {
          // Direct handling of the selection response
          let name = selectionMatch.name; // Ensure `name` is declared
          node = selectionMatch;
          if (node.children || (node.child && !node.schema)) {
            try {
              // Use the processChildren function to handle child nodes
              const { refinedText, options } = await this.processChildren(node, userInput, flow_start, this.interactionModel, lang);
              result['followup'] = {
                text: refinedText,
                followup_type: 'selection',
                options: options,
              };
              result['intent'] = node.name;
              interactionData.aiResponse = refinedText;
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              return result;
            } catch (error) {
              console.error("Error processing children: ", error);
              // Handle errors here
            }
          } else {
            // Handle the fallback where the node has no children or schema
            let refinedText = await this.dynamicFlowService.refineFollowupText(userInput, node.description, flow_start, []);
            refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
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
        } else { // handling when user input is string format rather than selection options being chosen.
          let flowStartNode: FlowTree;
          flowStartNode = this.findByName(this.flowTree, flow_start);
          // Handling when user input doesn't directly match any children's names
          let mostRelevantNode = await this.relevanceCheckService.findMostRelevantNode(lastUserInput, allNodes, flow_start);
          node = mostRelevantNode; // Update current node to the most relevant one
          if (node) {
            if (node.children || (node.child && !node.schema)) {
              try {
                // Reuse processChildren to handle the node and its children
                const { refinedText, options } = await this.processChildren(node, lastUserInput, flow_start, this.interactionModel,lang);
                result['followup'] = {
                  text: refinedText,
                  followup_type: 'selection',
                  options: options,
                };
                result['intent'] = node.name;
                interactionData.aiResponse = refinedText;
                const savedInteraction = await createInteraction(this.interactionModel, interactionData);
                return result;
              } catch (error) {
                console.error("Error processing children: ", error);
                // Handle errors here
              }
            } else if (node.schema) {
              // Handle node with schema directly
              const options = await Promise.all(node.schema._def.values.map(async (option) => ({
                title: await this.dynamicFlowService.translateOption(this.formatTitle(option), lang),
                id: option.replace(/ /g, '_')
              })));
              result['followup'] = {
                text: await this.dynamicFlowService.translateOption(node.description,lang),
                followup_type: 'selection',
                options: options,
              };
              result['intent'] = node.name;
              interactionData.aiResponse = node.description;
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              return result;
            } else {
              // Leaf node handling
              let refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, []);
              refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
              result['followup'] = {
                text: refinedText,
                followup_type: node.type,
              };
              result['intent'] = node.name;
              interactionData.aiResponse = refinedText;
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              return result;
            }
          } else {
            node = flowStartNode;
            // let translatedRag = lastUserInput
            // if (lang.code !='en')
            // {
            //   translatedRag = await this.dynamicFlowService.ragTranslation(lastUserInput)
            // }
            // console.log('translated rag',translatedRag)
            const answer = await this.faqService.ragChain(lastUserInput, treeId);
            if (answer !== "I'm sorry, but I cannot answer questions that are not relevant to the provided context.") {
              interactionData.aiResponse = answer;
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              result['followup'] = {
                text: answer,
                followup_type: 'text', // Assuming node.type is the current node type
              };
              result['intent'] = node.name; // Keep user at the same node
              return result;
            }
            else {
              interactionData.aiResponse = "I'm sorry, but I cannot answer questions that are not relevant to the provided context.";
              const savedInteraction = await createInteraction(this.interactionModel, interactionData);
              // No relevant node found
              result['followup'] = {
                text: "I'm sorry, but I cannot answer questions that are not relevant to the provided context.",
                followup_type: node.type, // Assuming node.type is the current node type
                options: await Promise.all(node.children ? node.children.map(async (child) => ({
                  title: await this.dynamicFlowService.translateOption(this.formatTitle(child.name), lang),
                  id: child.name,
                })) : [] // Provide current options if available
              )};
              result['intent'] = node.name; // Keep user at the same node
              return result;
            }
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
        let refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, options);
        refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
        // Return the result for the current node
        result['followup'] = {
          text: refinedText,
          followup_type: node.type,
          options: await Promise.all(node.children ? node.children.map(async (child) => ({
            title: await this.dynamicFlowService.translateOption(this.formatTitle(child.name), lang),
            id: child.name,
          })) : [] // Provide current options if available
        )};

        result['intent'] = node.name; // Set intent to the final node
        interactionData.aiResponse = refinedText;
        const savedInteraction = await createInteraction(this.interactionModel, interactionData);
        return result;
      }
      else if (mostRelevantNode && node.type === 'intermediate') {
        // Check if the node has children or if it is a selection type with a schema

        if (node.child) {
          // Move to the child node
          name = node.child.name;
          node = node.child;
        }
        else if (node.children) {
          // Move to the child node
          name = mostRelevantNode.child.name;
          node = mostRelevantNode.child;
        }
        else if (node.schema) {
          // Handle schema options (for selection-type nodes)
          const options = await Promise.all(node.schema._def.values.map(async (option) => ({
            title: await this.dynamicFlowService.translateOption(this.formatTitle(option), lang),
            id: option.replace(/ /g, '_')
          })));
          console.log('4 ',node.description)
          result['followup'] = {
            text: await this.dynamicFlowService.translateOption(node.description,lang),
            followup_type: 'selection',
            options: options,
          };
          return result;
        } else {
          name = mostRelevantNode.name;
          node = mostRelevantNode;
        }
        // Continue with existing logic for setting the followup response
        path.push({
          intent: name,
          value: node.description,
        });
        // Handle final node (text type)
        let refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start);
        refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
        result['followup'] = {
          text: refinedText,
          followup_type: node.type,
          options: await Promise.all(node.children ? node.children.map(async (child) => ({
            title: await this.dynamicFlowService.translateOption(this.formatTitle(child.name), lang),
            id: child.name,
          })) : []
       ) };

        result['intent'] = node.name;
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
          // console.log("Handling selection node:", node.children);
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
        let refinedText = await this.dynamicFlowService.refineFollowupText(lastUserInput, node.description, flow_start, options);
        refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
        if (node.children && node.children.length > 0) {
          interactionData.aiResponse = refinedText;
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          result['followup'] = {
            text: refinedText,
            followup_type: node.type,
            options: await Promise.all(node.children.map(async (child) => ({
              title: await this.dynamicFlowService.translateOption(this.formatTitle(child.name), lang),
              id: child.name,
            }))
          )};
        } else {
          console.log('5 ',node.description)
          result['followup'] = {
            text: await this.dynamicFlowService.translateOption(node.description,lang),
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

        if (endNodeCheck !== 'Null') {
          interactionData.aiResponse = endNodeCheck;
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          return {
            complete: true,
            text: endNodeCheck
          };
        }
        // let translatedRag = lastUserInput
        // if (lang.code !='en')
        //   {
        //     translatedRag = await this.dynamicFlowService.ragTranslation(lastUserInput)
        //   }
        // console.log('translated rag',translatedRag)
        const answer = await this.faqService.ragChain(lastUserInput, treeId);
        if (answer !== "I'm sorry, but I cannot answer questions that are not relevant to the provided context.") {
          interactionData.aiResponse = answer;
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);

          result['followup'] = {
            text: answer,
            followup_type: 'text', // Assuming node.type is the current node type
          };
          result['intent'] = node.name; // Keep user at the same node
          return result;
        }
        else {
          interactionData.aiResponse = "I'm sorry, but I cannot answer questions that are not relevant to the provided context.";
          const savedInteraction = await createInteraction(this.interactionModel, interactionData);
          // No relevant node found
          result['followup'] = {
            text: "I'm sorry, but I cannot answer questions that are not relevant to the provided context.",
            followup_type: node.type, // Assuming node.type is the current node type
            options: await Promise.all(node.children ? node.children.map(async (child) => ({
              title: await this.dynamicFlowService.translateOption(this.formatTitle(child.name), lang),
              id: child.name,
            })) : [] // Provide current options if available
          )};
          result['intent'] = node.name; // Keep user at the same node
          return result;
        }
      }
    }
  }

  formatTitle(title) {
    // Replace underscores with spaces
    let result = title.replace(/_/g, ' ');
    // Capitalize the first letter of each word
    result = result.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
    return result.trim();
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

  async processChildren(node, userInput, flow_start, interactionModel,lang) {
    const childrenArray = node.children || [node.child];
    if (childrenArray.length === 1 && childrenArray[0].children) {
      return await this.handleSingleChild(childrenArray[0], userInput, flow_start, interactionModel,lang)
    }
    else {
      return await this.handleMultipleChildren(node, childrenArray, userInput, flow_start, interactionModel,lang)
    }
  }

  async handleSingleChild(node, userInput, flow_start, interactionModel, lang) {
    let refinedText = await this.dynamicFlowService.refineFollowupText(userInput, node.description, flow_start, []); // fetching new description for new node context
    refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
    let options = await Promise.all(node.children.map(async (grandchild) => ({
      title: await this.dynamicFlowService.translateOption (this.formatTitle(grandchild.name), lang),
      id: grandchild.name.replace(/ /g, '_')
    })));
    return { refinedText, options }
  }

  async handleMultipleChildren(node, childrenArray, userInput, flow_start, interactionModel, lang) {
    let refinedText = await this.dynamicFlowService.refineFollowupText(userInput, node.description, flow_start, []); // fetching new description for new node context
    refinedText=await this.dynamicFlowService.translateOption(refinedText,lang);
    let options = await Promise.all(childrenArray.map(async(child) => ({
      title: await this.dynamicFlowService.translateOption (this.formatTitle(child.name), lang),
      id: child.name.replace(/ /g, '_')
    })));
    return { refinedText, options }
  }
}
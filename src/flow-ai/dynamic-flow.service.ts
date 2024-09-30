import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { FlowTree } from './flow-ai.types';
import { flowPrompt } from '../assets/prompts/flow-prompt';
import { improvePrompt } from '../assets/prompts/improvement-prompt';
import { userDonePrompt } from '../assets/prompts/userDone-prompt';
import { analyzeInputPrompt } from '../assets/prompts/analyzeInput-prompt';

@Injectable()
export class DynamicFlowService {
  constructor(private aiModel: OpenAI) { }

  // Format JSON function to remove quotes from keys and specific values
  private formatJSON(obj: any, indent: number = 0): string {
    const indentation = '    '.repeat(indent); // match current level of indentation
    const nextIndent = '    '.repeat(indent + 1); // match next level of indentation

    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'; // checking if object is empty
      let arrayItems = obj.map(item => this.formatJSON(item, indent + 1)); // recursively romatting each item at deep indentation levels
      return `[\n${nextIndent}${arrayItems.join(`,\n${nextIndent}`)}\n${indentation}]`;
    }

    let entries = Object.entries(obj).map(([key, value]) => {
      // Remove quotes from keys if they are valid identifiers
      const isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
      const formattedKey = isValidIdentifier ? key : `"${key}"`; // removing apostrophes from keys of json

      // Check if the key is 'type' or 'schema' to remove quotes from values
      if (key === 'type' || key === 'schema') {
        if (typeof value === 'string') {
          return `${nextIndent}${formattedKey}: ${value}`;
        }
      }
      // Recursively format other keys/values
      return `${nextIndent}${formattedKey}: ${this.formatJSON(value, indent + 1)}`;
    });

    return `{\n${entries.join(',\n')}\n${indentation}}`;
  }


  async analyzeInput(description: string, messages: { role: string, content: string }[]): Promise<{ message: string, followUpPrompts: string[] }> {
    let conversationHistory = messages.map(msg => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`).join('\n');
    messages.push({
      role: 'user',
      content: description
    });
    const prompt = analyzeInputPrompt(description, conversationHistory);
    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: description
          }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = response.choices[0].message.content.trim();
      let parsedResponse = JSON.parse(aiResponse); // Parse the JSON response

      const message = parsedResponse.message || "No response generated.";
      const followUpPrompts = [message];

      return { message, followUpPrompts };
    } catch (error) {
      console.error('Error analyzing user input:', error);
      throw new Error('Failed to analyze user input');
    }
  }


  async generateInitialGreeting(userInput: string, nodeDescription: string): Promise<string> {
    const prompt = `You are an AI assistant for an information based chatbot. 
    The user has just started a conversation and their input is: "${userInput}". 
    Your task is to respond in a friendly and helpful way by introducing the services available. 
    **Extract the company information from "${nodeDescription}" and use it to introduce yourself
    Use the following description to help shape your response: "${nodeDescription}".
    Return a personalized and relevant greeting that acknowledges the user's input and introduces the services in a natural way.
    
    Your response should be in JSON format and only contain a single object named greeting with the value for the greeting.
    `;

    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = response.choices[0].message.content;
      const parsedResponse = JSON.parse(aiResponse);

      if (!parsedResponse.greeting) {
        console.error('text not found in response:', parsedResponse);
        throw new Error("text is missing from the AI response.");
      }

      return parsedResponse.greeting;

    } catch (error) {
      console.error('Error generating initial greeting:', error);
      throw error;
    }
  }

  async logicalEnd(userInput, nodesPromise, flow_start): Promise<string> {
    const nodes = await nodesPromise;
    const options = nodes.map(node => `${node.name}: ${node.description}`);
    const prompt = `
        Given the "${userInput}", please check if the user's input indicates that they are done providing information or do not need more help and are wanting the conversation to end. 

        Analyze whether the "${userInput}" contains explicit language that strongly suggests the user wants to **end the conversation**, such as phrases like "I am done," "That will be all," or "I don’t need any more help." Refer to the "${userInput}" and "${flow_start}" and do not interpret partial statements (e.g., "I think that is enough for **particular section**") or statements related to a specific part of the process as a request to stop the conversation. 

        Once that has been established, return with a generic concluding message thanking the user for contacting.

        If the user intends to keep the conversation going, respond with 'No relevant node found'.

        Answer with the name of the relevant ending message or 'Null', if user intends to keep the conversation going.
      
        Respond with a JSON object in the following format:
            {"endMessage": "message"}
        
        Replace "message" with the relevant concluding remark or 'Null', if user intends to keep the conversation going.
        `;

    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: "json_object" },
      });

      const AIresponse = response.choices[0].message.content;
      const parsedResponse = JSON.parse(AIresponse);

      if (!parsedResponse.endMessage) {
        console.error('endMessage not found in response:', parsedResponse);
        throw new Error("endMessage is missing from the AI response.");
      }

      const endMessage = parsedResponse.endMessage.toLowerCase();

      return endMessage
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw new Error("An error occurred while processing the AI response.");
    }
  }

  async refineFollowupText(userInput: string, nodeDescription: string, flow_start: string, options?: string[]): Promise<string> {

    const prompt = `You are a helpful AI assistant. The user asked: "${userInput}". 
    Based on the node description "${nodeDescription}" and "${flow_start}", respond to the user in a conversational manner.
    
    **Your response should be accurate and consistent with the "${nodeDescription}", donot diverge from that.** 

    **Also ask if user is interested in any more information relevant to the "${nodeDescription}" or any other thing.**

    Return a minimalistic conversational response to the user incorporating the node description.


    Your response should be in JSON format and only contain a single object named text with the value for the conversation.
    `;

    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = response.choices[0].message.content;
      const parsedResponse = JSON.parse(aiResponse);

      if (!parsedResponse.text) {
        console.error('text not found in response:', parsedResponse);
        throw new Error("text is missing from the AI response.");
      }

      return parsedResponse.text;

    } catch (error) {
      console.error('Error refining followup text:', error);
      throw error;
    }
  }

  async handleOption(userInput: string, nodeDescription: string, options: string[]): Promise<string> {
    const prompt = `

    Question: ${nodeDescription}\nOptions: ${options}\nUser Input: ${userInput}\nWhich option does this input best match? Simply return the option. Donot add any sentence etc before or after. 

    It is possible that best match is not found, return 'Null' in that case.
    
    Respond with a JSON object in the following format:
      {"bestMatch": "match"}
        
    Replace "match" with the matched option or 'Null' if no option is accurately matched.
    `;

    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = response.choices[0].message.content;
      const parsedResponse = JSON.parse(aiResponse);

      if (!parsedResponse.bestMatch) {
        console.error('bestMatch not found in response:', parsedResponse);
        throw new Error("bestMatch is missing from the AI response.");
      }
      console.log('bm', parsedResponse.bestMatch);
      return parsedResponse.bestMatch;

    } catch (error) {
      console.error('Error refining followup text:', error);
      throw error;
    }
  }


  async checkIfUserIsDone(description: string, messages: { role: string, content: string }[]): Promise<string> {
    let conversationHistory = messages.map(msg => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`).join('\n');
    const prompt = userDonePrompt(description, conversationHistory);
    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: description
          }
        ],
        response_format: { type: "json_object" },
      });
      const aiResponse = response.choices[0].message.content.trim();
      let parsedResponse = JSON.parse(aiResponse);
      const isDone = parsedResponse.isDone.trim().toLowerCase();
      return isDone;
    } catch (error) {
      throw new Error('Failed to determine if user is done');
    }
  }

  async generateEnhancedPrompt(finalRefinedDescription: string, messages: { role: string, content: string }[]): Promise<string> {
    let conversationPrompt = messages.map(msg => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`).join('\n');
    const prompt = improvePrompt(finalRefinedDescription, conversationPrompt);

    try {
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });
      const enhancedPrompt = response.choices[0].message.content.trim();
      return enhancedPrompt;

    } catch (error) {
      console.error('Error while generating prompt:', error);
      throw new Error('Failed to generate enhanced prompt.');
    }
  }

  async generateDynamicFlow(description: string): Promise<FlowTree> {
    const aiResponse = await this.getAIResponse(description);
    // Parse the AI response JSON string into an object
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response JSON:', parseError);
      throw new InternalServerErrorException('Invalid JSON format from AI response');
    }

    // Format the JSON as per your requirements
    const formattedJSON = this.formatJSON(parsedResponse);

    return formattedJSON as unknown as FlowTree;  // Adjust the type casting as per your FlowTree definition
  }
  private async getAIResponse(description: string): Promise<string> {
    try {
      const prompt = flowPrompt(description);
      const response = await this.aiModel.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });
      // Returning the entire message content for debugging
      return response.choices[0]?.message?.content.trim() || '{}';
    } catch (error) {
      console.error('Error in getAIResponse:', error);
      throw new InternalServerErrorException('Failed to get AI response');
    }
  }


}

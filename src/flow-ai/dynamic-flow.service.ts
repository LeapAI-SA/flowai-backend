import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { FlowTree } from './flow-ai.types';
import { flowPrompt } from '../assets/prompts/flow-prompt';
import { improvePrompt } from '../assets/prompts/improvement-prompt';
import { userDonePrompt } from '../assets/prompts/userDone-prompt';
import { analyzeInputPrompt } from '../assets/prompts/analyzeInput-prompt';
import { initialGreetingPrompt } from '../assets/prompts/initalGreeting-prompt';
import { logicalEndPrompt } from '../assets/prompts/logicalEnd-prompt';
import { refineTextPrompt } from '../assets/prompts/refineText-prompt';
import { handleOptionPrompt } from '../assets/prompts/handleOption-prompt';
// import { checkInfoPrompt } from '../assets/prompts/checkInfo-prompt';

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
      const message = parsedResponse.message;

      const followUpPrompts = [message];

      return { message, followUpPrompts };
    } catch (error) {
      console.error('Error analyzing user input:', error);
      throw new Error('Failed to analyze user input');
    }
  }


  async generateInitialGreeting(userInput: string, nodeDescription: string): Promise<string> {
    const prompt = initialGreetingPrompt(userInput, nodeDescription);
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

  async logicalEnd(userInput, nodesPromise, flow_start, messages): Promise<string> {
    const nodes = await nodesPromise;
    const options = nodes.map(node => `${node.name}: ${node.description}`);
    const prompt = logicalEndPrompt(userInput, nodesPromise,flow_start,messages);
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
      const endMessage = parsedResponse.endMessage;
      return endMessage
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw new Error("An error occurred while processing the AI response.");
    }
  }

  async refineFollowupText(userInput: string, nodeDescription: string, flow_start: string, options?: string[]): Promise<string> {
    const prompt = refineTextPrompt(userInput, nodeDescription,flow_start,options);
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
    const prompt = handleOptionPrompt(userInput, nodeDescription,options);
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
      return parsedResponse.bestMatch;

    } catch (error) {
      console.error('Error refining followup text:', error);
      throw error;
    }
  }

  // async checkInfo(description: string, messages: { role: string, content: string }[]): Promise<string> {
  //   let conversationHistory = messages.map(msg => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`).join('\n');
  //   const prompt = checkInfoPrompt(description, conversationHistory);
  //   try {
  //     const response = await this.aiModel.chat.completions.create({
  //       model: "gpt-4o-mini",
  //       messages: [
  //         {
  //           role: 'system',
  //           content: prompt
  //         },
  //         {
  //           role: 'user',
  //           content: description
  //         }
  //       ],
  //       response_format: { type: "json_object" },
  //     });
  //     const aiResponse = response.choices[0].message.content.trim();
  //     let parsedResponse = JSON.parse(aiResponse);
  //     const info = parsedResponse.info.trim().toLowerCase();
  //     return info;
  //   } catch (error) {
  //     throw new Error('Failed to determine if user is done');
  //   }
  // }


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

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
import { confirmEndOrContinuePrompt } from '../assets/prompts/confirmUserExit-prompt';
import { checkInfoPrompt } from '../assets/prompts/checkInfo-prompt';
import { LanguageDetectorService } from 'src/language-detector/language-detector.service';
// import { generateMermaidDiagram } from '../utilis/treeTraversal/treeImage';

@Injectable()
export class DynamicFlowService {
  constructor(private aiModel: OpenAI,
    private readonly languageDetectorService: LanguageDetectorService
  ) { }

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


  async analyzeInput(description: string, messages: { role: string, content: string }[], fileUploaded: boolean, retries: number = 2, delay: number = 5000): Promise<{ message: string, followUpPrompts: string[], fileUploaded: boolean }> {
    let conversationHistory = messages.map(msg => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`).join('\n');
    messages.push({
      role: 'user',
      content: description
    });
    const prompt = analyzeInputPrompt(description, conversationHistory,fileUploaded );
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

      return { message, followUpPrompts, fileUploaded };
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.analyzeInput(description, messages, fileUploaded, retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }

  async translateOption(
    text: string,
    lang: { code: string; name: string } = { code: 'en', name: 'English' },
    retries: number = 2,
    delay: number = 5000
  ): Promise<string> {
    try {
      // Detect the language of the input text
      let detectedLanguage = await this.languageDetectorService.detectLanguage(text);
  
      // If the text is already in the target language, return it as is
      if (detectedLanguage.code === lang.code) {
        return text;
      }
  
      // Determine the translation direction based on lang.code
      let systemMessage = '';
      if (lang.code === 'ar') {
        systemMessage = 'You are a helpful assistant that translates text into Arabic. Return in JSON format with an object named "text".';
      } else if (lang.code === 'en') {
        systemMessage = 'You are a helpful assistant that translates text into English. Return in JSON format with an object named "text".';
      } else {
        // Handle other languages or default behavior
        systemMessage = `You are a helpful assistant that translates text into ${lang.name}. Return in JSON format with an object named "text".`;
      }
  
      // Adjust the user message to instruct the AI to translate into the target language
      const userMessage = `Translate the following text into ${lang.name}: "${text}"`;

      const response = await this.aiModel.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        response_format: { type: 'json_object' },
      });
  
      const aiResponse = response.choices[0].message.content.trim();
      let parsedResponse = JSON.parse(aiResponse); // Parse the JSON response
      const message = parsedResponse.text;
      return message;
  
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await this.translateOption(text, lang, retries - 1, delay);
      } else {
        throw new Error(`Original error: ${error.message}`);
      }
    }
  }

  async generateInitialGreeting(userInput: string, nodeDescription: string, retries: number = 2, delay: number = 5000): Promise<string> {
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.generateInitialGreeting(userInput, nodeDescription, retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }

  async logicalEnd(userInput, nodesPromise, flow_start, messages, language, retries: number = 2, delay: number = 5000): Promise<string> {
    const nodes = await nodesPromise;
    const options = nodes.map(node => `${node.name}: ${node.description}`);
    const prompt = logicalEndPrompt(userInput, nodesPromise,flow_start,messages, language);
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.logicalEnd(userInput, nodesPromise,flow_start,messages, retries - 1, delay);
    }
    else{
      throw new Error(`Failed to generate refined text. Original error: ${error.message}`);
    }
  }
}

  async refineFollowupText(userInput: string, nodeDescription: string, flow_start: string, options?: string[], retries: number = 2, delay: number = 5000): Promise<string> {
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.refineFollowupText(userInput, nodeDescription,flow_start,options, retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }

  async handleOption(userInput: string, nodeDescription: string, options: string[], retries: number = 2, delay: number = 5000): Promise<string> {
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.handleOption(userInput, nodeDescription,options, retries - 1, delay);
    } else {
      throw new Error(`Original error: ${error.message}`);
    }
    }
  }

  async checkIfUserIsDone(description: string, messages: { role: string, content: string }[], retries: number = 2, delay: number = 5000): Promise<string> {
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.checkIfUserIsDone(description, messages, retries - 1, delay);
    } else {
      throw new Error(`Original error: ${error.message}`);
    }
    }
  }

  async confirmUserisDone(
    description: string,
    messages: { role: string, content: string }[],
    retries: number = 2,
    delay: number = 3000
  ): Promise<string> 
  {
    let conversationHistory = messages
      .map((msg) => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`)
      .join('\n');
    const prompt = confirmEndOrContinuePrompt(description,conversationHistory);
    
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
      const parsedResponse = JSON.parse(aiResponse);
      const isDone = parsedResponse.end.trim().toLowerCase();
      return isDone;
      
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await this.confirmUserisDone(description, messages, retries - 1, delay);
      } else {
        throw new Error(`Original error: ${error.message}`);
      }
    }
  }
  

  // async checkInfo(description: string, messages: { role: string, content: string }[], retries: number = 2, delay: number = 5000): Promise<string> {
  //   let conversationPrompt = messages.map(msg => `${msg.role === 'user' ? 'User:' : 'System:'} ${msg.content}`).join('\n');
  //   const prompt = checkInfoPrompt(description, conversationPrompt);

  //   try {
  //     const response = await this.aiModel.chat.completions.create({
  //       model: "gpt-4o-mini",
  //       messages: [
  //         {
  //           role: 'system',
  //           content: prompt
  //         }
  //       ],
  //       response_format: { type: "json_object" },
  //     });
  //     const enhancedPrompt = response.choices[0].message.content.trim();
  //     return enhancedPrompt;

  //   } catch (error) {
  //     if (retries > 0) {
  //       await new Promise(resolve => setTimeout(resolve, delay));
  //       return await this.generateEnhancedPrompt(description, messages, retries - 1, delay);
  //   }
  //   else{
  //     throw new Error(`Original error: ${error.message}`);
  //   }
  // }
  // }

  async generateEnhancedPrompt(finalRefinedDescription: string, messages: { role: string, content: string }[], retries: number = 2, delay: number = 5000): Promise<string> {
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.generateEnhancedPrompt(finalRefinedDescription, messages, retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }


  async generateDynamicFlow(description: string, language): Promise<{ formattedJSON: any}> {
    const aiResponse = await this.getAIResponse(description, language);
    
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
  
    return { formattedJSON };  // Return formatted JSON
  }
  
  private async getAIResponse(description: string, language, retries: number = 2, delay: number = 5000): Promise<string> {
    try {
      const prompt = flowPrompt(description, language);
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
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.getAIResponse(description, language, retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }
}

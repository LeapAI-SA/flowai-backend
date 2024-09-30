import { Injectable } from '@nestjs/common';
import { BaseTracer } from 'langchain/callbacks';
import { OpenAI } from 'openai';

@Injectable()
export class RelevanceCheckService {
    constructor(private aiModel: OpenAI) { }

    async findMostRelevantNode(userInput, nodesPromise, flow_start) {
        const nodes = await nodesPromise;
        const options = nodes.map(node => `${node.name}: ${node.description}`);
        const prompt = `
        Use the following steps below to find the most relevant node:
        Step 1: Compare "${userInput}" with "${flow_start}" first. Try to find a relevant node within the flow or branches that match the flow start. If none, then move on to other branches and flows. 
        Step 2: Compare all selection nodes with the user input, check child and children nodes sequentially and select the most relevant option which fulfills the query of the user in the input.
        Step 3: Given the user's input: "${userInput}", select the most relevant option from the following list:\n${options.join('\n')}
        Step 4: Answer with the name of the most relevant node. 
    
        If none of the options are relevant to the user's input, respond with 'No relevant node found'.
        Answer with the name of the most relevant node or 'No relevant node found'
      
        Respond with a JSON object in the following format:
            {"MostRelevantNode": "node name"}
        
        Replace "node name" with the most relevant node name or 'No relevant node found'
        `;

        try {
            const response = await this.aiModel.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: 'system', content: prompt }],
                response_format: { type: "json_object" },
            });

            const AIresponse = response.choices[0].message.content;
            const parsedResponse = JSON.parse(AIresponse);

            if (!parsedResponse.MostRelevantNode) {
                console.error('MostRelevantNode not found in response:', parsedResponse);
                throw new Error("MostRelevantNode is missing from the AI response.");
            }

            const MostRelevantNode = parsedResponse.MostRelevantNode.toLowerCase();

            if (MostRelevantNode === 'no relevant node found') {
                return null;
            }

            // Find and return the matching node
            return nodes.find(node => node.name.toLowerCase() === MostRelevantNode);
        } catch (error) {
            console.error('Error processing AI response:', error);
            throw new Error("An error occurred while processing the AI response.");
        }
    }


    async classifyInput(question: string, userInput: string, options: string[]): Promise<string> {
        const optionsText = options.join(", ");
        const prompt = `Question: ${question}\nOptions: ${optionsText}\nUser Input: ${userInput}\nWhich option does this input best match? Simply return the option. Donot add any sentence etc before or after.

        Your response should be in JSON format and only contain a single object named bestMatch.
        
        `;
        try {

            const response = await this.aiModel.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: 'system', content: prompt }
                ],
                response_format: { type: "json_object" }
            });
            const aiResponse = response.choices[0].message.content;
            const parsedResponse = JSON.parse(aiResponse);

            if (!parsedResponse.bestMatch) {
                console.error('bestMatch not found in response:', parsedResponse);
                throw new Error("bestMatch is missing from the AI response.");
            }
            return parsedResponse.bestMatch; // Return just the value of bestMatch
        } catch (error) {
            console.error('Error processing AI response:', error);
            throw error; // Re-throw to handle upstream or log more contextually specific errors
        }
    }


    async checkRelevance(question: string, userInput: string): Promise<string> {
        const prompt = `Question: ${question}\nUser Input: ${userInput}\nIs the input relevant to the question? Answer only with "true" or "false".

    Your response should be in JSON format and only contain a single object named isRelevant with values "true" or "false".`;

        try {
            const response = await this.aiModel.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: 'system', content: prompt }
                ],
                response_format: { type: "json_object" }
            });
            const aiResponse = response.choices[0].message.content;

            const parsedResponse = JSON.parse(aiResponse);

            if (!parsedResponse.isRelevant) {
                throw new Error("isRelevant is missing from the AI response.");
            }

            return parsedResponse.isRelevant.trim().toLowerCase();
        } catch (error) {
            console.error('Error processing AI response:', error);
            throw error;  // Re-throw the error for upstream error handling
        }
    }


}

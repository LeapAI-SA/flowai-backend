// //                     ChainsService class provides methods for generating follow-up responses using OpenAI and LLama3 models.                                               //


// import { Injectable } from '@nestjs/common';
// import { RunnableSequence } from '@langchain/core/runnables';
// import { PromptTemplate } from '@langchain/core/prompts';
// import { ChatOpenAI, OpenAI } from '@langchain/openai';
// import { StringOutputParser } from '@langchain/core/output_parsers';
// import { z } from 'zod';
// import { StructuredOutputParser } from 'langchain/output_parsers';
// import { Llama3 } from 'src/llms/llama.llm';

// @Injectable()
// export class ChainsService {
//   generateFollowupResponseChain(model: OpenAI) { // generates a FollowUp response if user query is missing data 
//     const prompt = `
//       You are a customer support agent. Generate a response asking for missing data if applicable, based on the request below.
  
//       If no data is missing, provide a relevant follow-up based on the user's intent.
  
//       IMPORTANT: 
//       - Respond in {language}.
//       - Be polite, professional, and concise.
//       - If missing data is provided, ask specifically for it without additional details.
  
//       <request>
//       {request}
//       </request>
  
//       Missing data: {missing_data}
  
//       Response:`;
      
//     const promptTemplate = PromptTemplate.fromTemplate(prompt);
  
//     const followupResponseChain = RunnableSequence.from([
//       promptTemplate,
//       model,
//       new StringOutputParser(),
//     ]);
  
//     return followupResponseChain;
//   }
//   generateSentimentalFollowupResponseChain(model: OpenAI) {  // responds based on the sentiment of the user
//     console.log('sentimental followup response chain')
//     const prompt = `
//     You're a customer support agent for MOHRE (Ministry of Human Resources and Emiratisation) in UAE.

//         The user has sent the request below, 
        

//         always apologize and mention the user concern in your response.
        
//         i want you to generate a response according to the sentiment of the user.
//         if the sentiment is positive, respond with a positive message and we will try to assist you as soon as possible.
//         if the sentiment is negative, respond with an apology message to calm the user down and we will try to assist you as soon as possible.
//         IMPORTANT: your response must be in a single language which is: {language}.
        
//         <request>
//         {request}
//         </request>


//         response: 
//         `;

//     // console.log(prompt);
//     const promptTemplate = PromptTemplate.fromTemplate(prompt);

//     const followupResponseChain = RunnableSequence.from([
//       promptTemplate,
//       model,
//       new StringOutputParser(),
//     ]);

//     return followupResponseChain;
//   }

//   generateRewriteDetailsChain(model: OpenAI, language: string) {
//     const prompt = `act as a customer and rewrite the request details in a clear and professional manner, dont be biased or subjective, be clear and concise, remove cusses and offensive language, keep in mind that the request will be sent back to the customer for confirmation, so make sure the details are correct and clear. rewrite it in {language}
//     request details: {request_details}
    
//     ${
//       language === 'ar'
//         ? 'تفاصيل الطلب المعاد كتابتها: '
//         : 'rewritten request details:'
//     }`;

//     // console.log(prompt);
//     const promptTemplate = PromptTemplate.fromTemplate(prompt);

//     const rewriteDetailsChain = RunnableSequence.from([
//       promptTemplate,
//       model,
//       new StringOutputParser(),
//     ]);

//     return rewriteDetailsChain;
//   }

//   generateClassificationChain( // classifies the user query into one of the predefined options. car --> car1,car2,car3 etc
//     classes: any[],
//     model: OpenAI | Llama3,
//     levels = '',
//   ) {
//     const classesString = this.generateClassesString(classes);
//     console.log(classesString)

//     const prompt = `Given the user question below, classify it as either being about strictly one of the following classes:
// ${classesString}

// If the question is vague or does not specify a dish, respond with ${classesString}. Do not guess.

// Do not respond with more than one word.

// <question>
// {question}
// </question>

// Classification:`;
    
//     const promptTemplate = PromptTemplate.fromTemplate(prompt);

//     const classificationChain = RunnableSequence.from([
//       promptTemplate,
//       model,
//       new StringOutputParser(),
//     ]);
//     return classificationChain;
//   }

//   async generateEditChain(model: OpenAI, query, data) {
//     console.log('edit chain')
//     const schema = z.object({
//       request_type: z.enum([
//         'contact_support',
//         'complaints',
//         'suggestions',
//         'thanks_or_feedback',
//       ]),
//       customer_name: z.string(),
//       customer_email: z.string(),
//       customer_phone_number: z.string(),
//       request_subject: z
//         .string()
//         .describe(
//           'What is the subject of the request? just the short subject descriping the user request',
//         ),
//       request_details: z
//         .string()
//         .describe(
//           'act as a customer and rewrite the request details in a clear and professional manner, dont be biased or subjective, be clear and concise, remove cusses and offensive language, keep in mind that the request will be sent back to the customer for confirmation, so make sure the details are correct and clear. rewrite it in the same language as the user request',
//         ),
//     });

//     const parser = StructuredOutputParser.fromZodSchema(schema);

//     const prompt = `Your a customer support agent for MOHRE (Ministry of Human Resources and Emiratisation) in UAE.
//     The customer has initiated a customer support ticket with the following data:
//     <ticket_data>
//     {ticket_data}
//     </ticket_data>
//     The customer has requested the following changes:
//     <changes>
//     {changes}
//     </changes>

//     Your job is to return the updated ticket data with the changes applied.

//     {format_instructions}

//     response: 
//     `;

//     const promptTemplate = PromptTemplate.fromTemplate(prompt);

//     const editChain = RunnableSequence.from([promptTemplate, model, parser]);
//     const promptString = await promptTemplate.format({
//       ticket_data: data,
//       changes: query,
//       format_instructions: parser.getFormatInstructions(),
//     });

//     // console.log(promptString);
//     const response = await editChain.invoke({
//       ticket_data: data,
//       changes: query,
//       format_instructions: parser.getFormatInstructions(),
//     });
//     // console.log(response);
//     return response;
//   }

//   generateActionClassificationChain(model: OpenAI) {
//     console.log('action classification chain')
//     const prompt = `Given the user query below, return the name of the section the user wants to go to. The possible sections are as follows:
//     'main_menu' - The user wants to go to the main menu.
//     'inquiries' - The user wants to go the inquiries section or has an inquiry.
//     'complaints' - The user wants to go to the complaints section.
//     'id-renwal' - The user wants to go to the ID renewal section.
//     'none' - The user does not want to go to any section.
    
//     if the user is asking a question then return 'none'.

//   Do not respond with more than one word.

//   <query>
//   {query}
//   </query>


//   Classification:`;
//     // console.log(prompt);
//     const promptTemplate = PromptTemplate.fromTemplate(prompt);

//     const classificationChain = RunnableSequence.from([
//       promptTemplate,
//       model,
//       new StringOutputParser(),
//     ]);

//     return classificationChain;
//   }

//   generateClassesString(classes: any[]) {
//     return classes.map((classObj) => {
//       if (classObj.description) {
//         return `'${classObj.name}' - ${classObj.description}\n`;
//       } else {
//         return `'${classObj.name}'\n`;
//       }
//     });
//   }
// }

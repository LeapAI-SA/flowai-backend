// // Chitchat-agent.service.ts
// import { Injectable, Inject } from '@nestjs/common';
// import { ChatPromptTemplate } from '@langchain/core/prompts';
// import { StringOutputParser } from '@langchain/core/output_parsers';
// import { ChatOpenAI } from '@langchain/openai';

// @Injectable()
// export class ChitchatAgentService {
//   constructor() {}

//   private detectLanguage(input: string): string {
//     // Regular expression to match Arabic script characters
//     const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

//     // Test the input string against the Arabic regex
//     if (arabicRegex.test(input)) {
//       return 'ar';
//     } else {
//       return 'en';
//     }
//   }

//   async invoke(query: string) {
//     const chatModel = new ChatOpenAI({
//       modelName: 'gpt-4o',
//       temperature: 0,
//       openAIApiKey: process.env.OPENAI_API_KEY,
//     });
//     const lang = this.detectLanguage(query);
//     const messagesArray = [
//       [
//         'system',
//         `You are an AI Chitchat agent for The Ministerial Agency of Civil Affairs in Saudi Arabia.`,
//       ],
//     ];
//     messagesArray.push([
//       'system',
//       `Vision
//       To be a leading administration in the Kingdom that provides e-government services efficiently and with high quality.
      
//       Mission
//       Registration of citizens and residents; and recording their various civil affairs events and make such events available to them and to authorities relating to their interests, in all appropriate, available and required methods and tools.`,
//     ]);

//     messagesArray.push([
//       'system',
//       `* Try to be polite and professional.
// * Never apologize, just answer the user inquiry in a general way, you don't have to be specific.
// * Don't be biased.`,
//     ]);
//     if (true) {
//       messagesArray.push([
//         'system',
//         `You must respond in ${lang == 'ar' ? 'Arabic' : 'English'}.`,
//       ]);
//       messagesArray.push([
//         'system',
//         `if the user query is greeting then at the end of the message, you can say ${
//           lang == 'ar' ? 'كيف يمكنني مساعدتك؟' : 'How can I help you?'
//         }.`,
//       ]);

//       messagesArray.push([
//         'system',
//         `at the end of the message, if the user inquiry is not related to Civil Affairs, you can answer in a general way, and then remind the user that he is talking to Civil Affairs.`,
//       ]);

//       // messagesArray.push([
//       //   'system',
//       //   `* if the user inquiry is not related to MOHRE, you can answer in a general way, and then redirect the user to MOHRE Services.`,
//       // ]);
//     }
//     messagesArray.push(['user', '{input}']);
//     const prompt = ChatPromptTemplate.fromMessages(messagesArray as any);
//     const chain = prompt.pipe(chatModel).pipe(new StringOutputParser());
//     const response = await chain.invoke({
//       input: query,
//     });

//     return {
//       data: response,
//     };
//   }
// }

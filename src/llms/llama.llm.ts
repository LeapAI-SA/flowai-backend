// import { LLM, type BaseLLMParams } from '@langchain/core/language_models/llms';
// import type { CallbackManagerForLLMRun } from 'langchain/callbacks';
// import { GenerationChunk } from 'langchain/schema';
// import axios from 'axios';
// export interface CustomLLMInput extends BaseLLMParams {
//   apiKey: string;
//   temperature: number;
// }

// export class Llama3 extends LLM {
//   apiKey: string;
//   temperature: number;

//   constructor(fields: CustomLLMInput) {
//     super(fields);
//     this.apiKey = fields.apiKey;
//     this.temperature = fields.temperature;
//   }

//   _llmType() {
//     return 'Llama3';
//   }

//   async _call(
//     prompt: string,
//     options: this['ParsedCallOptions'],
//     runManager: CallbackManagerForLLMRun,
//   ): Promise<string> {
//     // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
//     // await subRunnable.invoke(params, runManager?.getChild());
//     const result = axios
//       .post(
//         'https://genai-connector-develop-fxudoqoheq-ww.a.run.app/predict',
//         {
//           query: {
//             model: 'meta-llama/Llama-3-70b-chat-hf',
//             temperature: this.temperature || 0,
//             prompt: prompt,
//           },
//           user_id: 'test',
//           client_id: 'Yusef',
//           conversation_id: '00000',
//           platform: 'Web',
//           genAiProvider: 'togetherai',
//         },
//         {
//           headers: {
//             'x-api-key': this.apiKey,
//             'Content-Type': 'application/json',
//           },
//         },
//       )
//       .then((response) => {
//         return response.data.result.text;
//       });

//     return result;
//   }

//   async *_streamResponseChunks(
//     prompt: string,
//     options: this['ParsedCallOptions'],
//     runManager?: CallbackManagerForLLMRun,
//   ): AsyncGenerator<GenerationChunk> {
//     // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
//     // await subRunnable.invoke(params, runManager?.getChild());
//     // for (const letter of prompt.slice(0, this.n)) {
//     //   yield new GenerationChunk({
//     //     text: letter,
//     //   });
//     //   // Trigger the appropriate callback
//     //   await runManager?.handleLLMNewToken(letter);
//     // }
//   }
// }

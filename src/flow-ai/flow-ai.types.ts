import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { Llama3 } from 'src/llms/llama.llm';
import z from 'zod';

export interface FlowAiModuleOptions {
  isGlobal?: boolean;
  flowTree: FlowTree; // structure of the flow tree
  model: OpenAI | ChatOpenAI | Llama3; // use of different language models.
}

export enum IntentType {
  SELECTION = 'selection', // choices and options
  TEXT = 'text',  // plain text interactions
  INTERMEDIATE = 'intermediate', // transitions within the dialoge flow
}

export type FlowTree = {
  name: string;
  type: IntentType;
  description: string;
  children?: FlowTree[]; // optional array for branching
  classifiable?: boolean; // optional whether node is classifiable
  child?: FlowTree; // optional for linear flows
  schema?: z.ZodType<any, any, any>; // optional schema for validation
};

export interface ClassificationItem {
  intent: string; // classified intent
  value: any; // value associtated with the intent
}




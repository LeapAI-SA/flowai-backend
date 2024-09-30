import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // Property, sCHEMA
import { Document } from 'mongoose'; // representing a mongodb document

@Schema({ timestamps: true })
export class Conversation extends Document { // inherit methods from Document for document manipulation

  @Prop({ required: true }) // ALWAYS REQUIRED
  userId: string; // string format

  @Prop({ required: true }) // ALWAYS REQUIRED
  conversationId: string; // string format

  @Prop({ required: true }) // ALWAYS REQUIRED
  description: string; // string format

  @Prop()
  refinedDescription: string; // string format 

  @Prop([String]) // Array of strings for storing follow-up prompts
  followUpPrompts: string[];

  @Prop()
  aiResponse: string; // Store AI's response (as a stringified JSON)

} 

export const ConversationSchema = SchemaFactory.createForClass(Conversation); // generates a schema

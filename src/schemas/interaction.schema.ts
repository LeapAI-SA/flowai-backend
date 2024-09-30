// src/schemas/interaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // Property, sCHEMA
import { Document } from 'mongoose'; // representing a mongodb document

@Schema() // decorator to mark class as a Schema
export class Interaction extends Document { // inherit methods from Document for document manipulation

  @Prop({ required: true }) // ALWAYS REQUIRED
  sessionId: string; // string format

  @Prop({ required: true }) // ALWAYS REQUIRED
  userId: string; // string format

  @Prop({ required: true }) // ALWAYS REQUIRED
  query: string; // string format

  @Prop()
  flowStart: string; // string format 

  @Prop()
  followupValue: string; // string format

  @Prop()
  aiResponse: string; // AI's response

  @Prop({ default: Date.now }) // defaulted to when created
  createdAt: Date; // datetime format
} 

export const InteractionSchema = SchemaFactory.createForClass(Interaction); // generates a schema

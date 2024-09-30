// src/schemas/flow-tree.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FlowTreeDocument extends Document {
  @Prop({ required: true })
  description: string; // Description of the flow tree

  @Prop({ required: true }) // Ensure `userId` is unique
  userId: string;

  @Prop({ required: true, unique: true }) // Ensure `treeId` is unique
  treeId: string;

  @Prop({ required: true, type: Object })
  flowTree: any; // Store the flow tree as a generic object

}

export const FlowTreeSchema = SchemaFactory.createForClass(FlowTreeDocument);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Counter extends Document {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
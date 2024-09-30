
import { InternalServerErrorException} from '@nestjs/common';
import { Interaction } from '../../schemas/interaction.schema';
import { Model } from 'mongoose';


export async function createInteraction(interactionModel: Model<Interaction>, data: any): Promise<Interaction> {
    const newInteraction = new interactionModel(data);
    try {
      return await newInteraction.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to save interaction', error.message);
    }
  }
  
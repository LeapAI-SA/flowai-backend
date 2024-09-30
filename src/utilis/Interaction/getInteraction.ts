import { InternalServerErrorException } from '@nestjs/common';
import { Interaction } from '../../schemas/interaction.schema';
import { Model } from 'mongoose';

export async function getInteractionsBySession(interactionModel: Model<Interaction>, sessionId: string): Promise<Interaction[]> {
    try {
      return await interactionModel.find({ sessionId }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch interactions', error.message);
    }
}

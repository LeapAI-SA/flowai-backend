import { InternalServerErrorException } from '@nestjs/common';
import { Conversation } from '../../schemas/creator-conversation.schema';
import { Model } from 'mongoose';

export async function getConversation(
    conversationModel: Model<Conversation>,
    userId: string,
    conversationId: string
  ): Promise<any> {
    try {
      // Find the conversation by userId and conversationId
      const conversation = await conversationModel
        .find({ userId, conversationId })
        .select(' conversationStage description refinedDescription aiResponse')
        .sort({ createdAt: 1 })
        .exec();
  
      if (!conversation || conversation.length === 0) {
        return null;
      }
  
      return conversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw new InternalServerErrorException('Error fetching conversation', error.message);
    }
  }
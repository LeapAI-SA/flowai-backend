import { InternalServerErrorException} from '@nestjs/common';
import { Conversation } from '../../schemas/creator-conversation.schema';
import { Model } from 'mongoose';

export async function createConversation(  conversationModel: Model<Conversation>, data: any): Promise<Conversation> {
    const newConversation = new conversationModel(data);
    try {
        return await newConversation.save();
    } catch (error) {
        throw new InternalServerErrorException('Failed to save conversation', error.message);
    }
}

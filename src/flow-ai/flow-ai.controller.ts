import { Body, Controller, Post, Get, Param } from '@nestjs/common';  // providing core decorators
import { FlowAiService } from './flow-ai.service'; // service that contains the business logic
import { DynamicFlowService } from './dynamic-flow.service';
import { getInteractionsBySession } from '../utilis/Interaction/getInteraction';
import { InjectModel } from '@nestjs/mongoose';
import { Interaction } from '../schemas/interaction.schema';
import { Model } from 'mongoose';
import { Conversation } from '../schemas/creator-conversation.schema';  // Adjust the path if needed
import { getConversation } from '../utilis/Conversation/getConversation'; // retrieve

@Controller('flow-ai') // decorates Flow AiController class handling  /flow-ai routes
export class FlowAiController {
  constructor(private readonly flowAiService: FlowAiService,
    private readonly dynamicFlowService: DynamicFlowService,
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,

  ) { }

  @Post() // handle POST requests to /flow-ai
  invokeFlowAI(@Body() body: any): any {
    console.log(body);
    return this.flowAiService.classify( // extraction of parameters
      body.sessionId,
      body.userId,
      body.treeId,
      body.query,
      body.flow_start,
      body.followup_value,
      body.classifyFollowup ?? false, // optional with default values
      body.lang ?? '', // optional with default values
    );
  }

  @Post('create-chatbot') // Handle POST request to /flow-ai/create-chatbot
  async createDynamicChatbot(@Body() body: { description: string, refinedDescription?: string, userId: string, conversationId?: string }): Promise<any> {
    return await this.flowAiService.createDynamicChatbot(body.description, body.refinedDescription || '', body.userId, body.conversationId);
  }

  @Get(':sessionId')
  getInteractionsBySession(@Param('sessionId') sessionId: string) {
    return getInteractionsBySession(this.interactionModel, sessionId);
  }

  @Get('conversation/:userId/:conversationId')
  async getConversation(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string
  ) {
    return getConversation(this.conversationModel, userId, conversationId);  // Call the external function directly
  }
}

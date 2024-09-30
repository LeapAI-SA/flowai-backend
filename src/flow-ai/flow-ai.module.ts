import { Module, DynamicModule } from '@nestjs/common';
import { FlowAiService } from './flow-ai.service';
import { LanguageDetectorModule } from 'src/language-detector/language-detector.module';
import { LanguageDetectorService } from 'src/language-detector/language-detector.service';
import { ChainsService } from 'src/chains/chains.service';
import { ChainsModule } from 'src/chains/chains.module';
import { FlowAiModuleOptions } from './flow-ai.types';
import { FlowAiController } from './flow-ai.controller';
import { DynamicFlowService } from './dynamic-flow.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose'; // Import getModelToken
import { Interaction, InteractionSchema } from '../schemas/interaction.schema';
import { FlowTreeDocument, FlowTreeSchema } from '../schemas/flowTree.schema';
import { Conversation, ConversationSchema } from '../schemas/creator-conversation.schema';
import { CounterService } from '../counter/counter.service'; // Correct path as necessary
import { CounterModule } from '../counter/counter.module'; // Correct path as necessary

import { Model } from 'mongoose';
import OpenAI from 'openai';
import { RelevanceCheckService } from './response-relevance.service';

@Module({
  controllers: [FlowAiController],
  providers: [
    {
      provide: OpenAI,
      useFactory: () => {
        return new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      },
    },
    DynamicFlowService,
    FlowAiService,
    RelevanceCheckService,
  ],
  imports: [
    MongooseModule.forFeature([{ name: Interaction.name, schema: InteractionSchema },
    { name: FlowTreeDocument.name, schema: FlowTreeSchema },
    { name: Conversation.name, schema: ConversationSchema }

    ]),
    LanguageDetectorModule,
    ChainsModule,
    CounterModule
  ],
  exports: [FlowAiService],
})
export class FlowAiModule {
  static forRoot(options: FlowAiModuleOptions): DynamicModule {
    const flowAiServiceProvider = {
      provide: FlowAiService,
      useFactory: (
        interactionModel: Model<Interaction>,
        flowTreeModel: Model<FlowTreeDocument>,
        conversationModel: Model<Conversation>,
        languageDetectorService: LanguageDetectorService,
        chainsService: ChainsService,
        dynamicFlowService: DynamicFlowService,
        relevanceCheckService: RelevanceCheckService,

        counterService: CounterService
      ) => {
        return new FlowAiService(
          interactionModel,
          flowTreeModel,
          conversationModel,
          languageDetectorService,
          chainsService,
          options,
          dynamicFlowService,
          relevanceCheckService,
          counterService
        );
      },
      inject: [
        getModelToken(Interaction.name), // Use getModelToken for injecting the model
        getModelToken(FlowTreeDocument.name),
        getModelToken(Conversation.name),
        LanguageDetectorService,
        ChainsService,
        DynamicFlowService,
        RelevanceCheckService,
        CounterService
      ],
    };

    return {
      module: FlowAiModule,
      providers: [flowAiServiceProvider],
      imports: [LanguageDetectorModule, ChainsModule, MongooseModule.forFeature([{ name: Interaction.name, schema: InteractionSchema },
      { name: FlowTreeDocument.name, schema: FlowTreeSchema },
      { name: Conversation.name, schema: ConversationSchema }
      ])],
      exports: [flowAiServiceProvider],
      global: options.isGlobal ?? false,
    };
  }
}

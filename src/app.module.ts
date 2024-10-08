import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlowAiModule } from './flow-ai/flow-ai.module';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { LanguageDetectorModule } from './language-detector/language-detector.module';
// import { ChainsModule } from './chains/chains.module';
import { ElectronicStore } from './flows/main-tree';
//import { ChitchatAgentModule } from './chitchat-agent/chitchat-agent.module';
import { ConfigModule } from '@nestjs/config';
// import { Llama3 } from './llms/llama.llm';
import { FaqModule } from './faq/faq.module';
import { MongooseModule } from '@nestjs/mongoose';

let dbName: string;

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI //,
      // {dbName: 'FlowAI'}
    ),
    FlowAiModule.forRoot({
      flowTree: ElectronicStore,
      // model: new Llama3({
      //   apiKey: process.env.GENAI_CONNECTOR_API_KEY || '',
      //   temperature: 0,
      // }),
      model: new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY || '',
        temperature: 0,
        model: 'gpt-4o-mini',
      }),
    }),
    LanguageDetectorModule,
    //ChainsModule,
    //ChitchatAgentModule,
    FaqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

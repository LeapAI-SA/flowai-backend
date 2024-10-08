import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { LanguageDetectorModule } from 'src/language-detector/language-detector.module';
import { OpenAI } from 'openai';

@Module({
  imports: [LanguageDetectorModule],
  providers: [
    FaqService,
    {
      provide: OpenAI,
      useFactory: () => {
        return new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      },
    },
  ],
  controllers: [FaqController],
})
export class FaqModule {}

import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { LanguageDetectorModule } from 'src/language-detector/language-detector.module';

@Module({
  imports: [LanguageDetectorModule],
  providers: [FaqService],
  controllers: [FaqController],
})
export class FaqModule {}

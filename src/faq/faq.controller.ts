import { Body, Controller, Post } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  async queryFAQ(@Body() body: { question: string; collection: string }) {
    const { question, collection } = body;
    return this.faqService.queryFAQ(question, collection);
  }
}

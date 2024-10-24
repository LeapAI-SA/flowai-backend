import { Controller, Get, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Post } from '@nestjs/common/decorators';
import { FlowAiService } from './flow-ai/flow-ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly flowAiService: FlowAiService,
  ) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}

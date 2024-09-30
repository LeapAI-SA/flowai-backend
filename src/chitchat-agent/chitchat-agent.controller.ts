import { Controller, Post, Body } from '@nestjs/common';
import { ChitchatAgentService } from './chitchat-agent.service';

@Controller('chitchat')
export class ChitchatAgentController {
  constructor(private readonly chitchatAgentService: ChitchatAgentService) {}

  @Post()
  queryChitchatAgent(@Body() body: any) {
    return this.chitchatAgentService.invoke(body.query);
  }
}

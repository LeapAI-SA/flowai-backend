import { Controller, Post, Body } from '@nestjs/common';
import { ChainsService } from './chains.service';

@Controller('chains')
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Post('sentimental')
  async generateSentimentalFollowupResponseChain(@Body() body: any) {
    return 'sentimental response generated';
  }
}

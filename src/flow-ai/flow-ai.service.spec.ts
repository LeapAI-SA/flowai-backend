import { Test, TestingModule } from '@nestjs/testing';
import { FlowAiService } from './flow-ai.service';

describe('FlowAiService', () => {
  let service: FlowAiService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlowAiService],
    }).compile();
    service = module.get<FlowAiService>(FlowAiService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

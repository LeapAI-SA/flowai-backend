import { Test, TestingModule } from '@nestjs/testing';
import { FlowAiController } from './flow-ai.controller';

describe('FlowAiController', () => {
  let controller: FlowAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowAiController],
    }).compile();

    controller = module.get<FlowAiController>(FlowAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

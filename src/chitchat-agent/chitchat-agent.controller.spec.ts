import { Test, TestingModule } from '@nestjs/testing';
import { ChitchatAgentController } from './chitchat-agent.controller';

describe('ChitchatAgentController', () => {
  let controller: ChitchatAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChitchatAgentController],
    }).compile();

    controller = module.get<ChitchatAgentController>(ChitchatAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

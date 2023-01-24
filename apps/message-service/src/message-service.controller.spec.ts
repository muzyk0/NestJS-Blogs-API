import { Test, TestingModule } from '@nestjs/testing';
import { MessageServiceController } from './message-service.controller';
import { MessageServiceService } from './message-service.service';

describe('MessageServiceController', () => {
  let messageServiceController: MessageServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageServiceController],
      providers: [MessageServiceService],
    }).compile();

    messageServiceController = app.get<MessageServiceController>(MessageServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(messageServiceController.getHello()).toBe('Hello World!');
    });
  });
});

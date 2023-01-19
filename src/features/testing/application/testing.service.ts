import { Injectable } from '@nestjs/common';

import { EmailService } from '../../email/application/email.service';
import { TestingRepository } from '../infrastructure/testing.repository';

interface ITestingService {
  clearDatabase(): Promise<boolean>;
}

@Injectable()
export class TestingService implements ITestingService {
  constructor(
    private readonly testingRepository: TestingRepository,
    private readonly emailService: EmailService,
  ) {}

  clearDatabase(): Promise<boolean> {
    return this.testingRepository.clearDatabase();
  }

  async sendTestEmail(): Promise<boolean> {
    await this.emailService.sendTestEmail({
      email: 'ru9art@gmail.com',
      userName: 'muzyk0',
    });

    return true;
  }

  async healthCheckMessageService() {
    return await this.emailService.healthCheck();
  }
}

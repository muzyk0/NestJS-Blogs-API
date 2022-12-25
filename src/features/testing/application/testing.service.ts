import { Injectable } from '@nestjs/common';

import { TestingRepository } from '../infrastructure/testing.repository';

interface ITestingService {
  clearDatabase(): Promise<boolean>;
}

@Injectable()
export class TestingService implements ITestingService {
  constructor(private readonly testingRepository: TestingRepository) {}

  clearDatabase(): Promise<boolean> {
    return this.testingRepository.clearDatabase();
  }
}

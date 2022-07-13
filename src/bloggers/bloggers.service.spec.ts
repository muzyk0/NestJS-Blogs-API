import { Test, TestingModule } from '@nestjs/testing';
import { BloggersService } from './bloggers.service';
import { BloggersRepository } from './bloggers.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Blogger } from './schemas/bloggers.schema';

describe('BloggersService', () => {
  let service: BloggersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloggersService,
        BloggersRepository,
        { provide: getModelToken(Blogger.name), useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<BloggersService>(BloggersService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });
});

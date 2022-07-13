import { Module } from '@nestjs/common';
import { BloggersService } from './bloggers.service';
import { BloggersController } from './bloggers.controller';
import { BloggersRepository } from './bloggers.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blogger, BloggerSchema } from './schemas/bloggers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
  ],
  controllers: [BloggersController],
  providers: [BloggersService, BloggersRepository],
})
export class BloggersModule {}

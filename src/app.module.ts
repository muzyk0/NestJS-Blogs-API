import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test-users/test-users.module';
import { BloggersModule } from './bloggers/bloggers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    TestModule,
    BloggersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

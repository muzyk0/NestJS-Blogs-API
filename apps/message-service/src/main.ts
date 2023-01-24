import { NestFactory } from '@nestjs/core';
import { MessageServiceModule } from './message-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MessageServiceModule);
  await app.listen(3000);
}
bootstrap();

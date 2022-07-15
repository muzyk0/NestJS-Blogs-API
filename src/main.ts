import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters';
import { ErrorExceptionFilter } from './common/filters';

(async function bootstrap() {
  console.log(process.env.MONGO_URI);
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (options) => {
        const errors = options.map((option) =>
          Object.values(option.constraints ?? []).map((message) => ({
            field: option.property,
            message,
          })),
        );
        return new BadRequestException(errors);
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());

  await app.listen(5000);
})();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(8080);
  } catch (e) {
    Logger.error(e.message, e.stack);
    process.exit(1); // Exit the application with a failure code
  }
}
bootstrap();

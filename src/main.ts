import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    // Enable CORS for all routes and origins
    app.enableCors({
      origin: 'http://localhost:3000', // Allow requests from your React frontend
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization',
    });
    await app.listen(8080);
  } catch (e) {
    Logger.error(e.message, e.stack);
    process.exit(1); // Exit the application with a failure code
  }
}
bootstrap();

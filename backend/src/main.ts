import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so Angular can talk to NestJS
  app.enableCors({
    origin: 'http://192.168.29.131:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable validation for our DTOs
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
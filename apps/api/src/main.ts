import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({ origin: true, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Computicket Nigeria API')
    .setDescription('Multi-vendor ticketing and booking platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API ready on http://localhost:${port}/v1 (docs: /docs)`);
}

bootstrap();

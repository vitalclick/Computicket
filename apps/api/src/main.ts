import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Refuse to start in production if any of the secrets that protect real
 * money or real identities are missing. In dev/test the upstream
 * services fall back to JWT_SECRET / `dev_unsafe` so local work keeps
 * flowing — but those fallbacks must never reach prod.
 */
function requireProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return;
  const required = [
    'JWT_SECRET',
    'APP_KEY',
    'STREAMING_SECRET',
    'NFT_SIGNING_KEY',
    'PAYSTACK_SECRET_KEY',
    'CORS_ALLOWED_ORIGINS',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Refusing to start in production with unset secrets: ${missing.join(', ')}`,
    );
  }
}

function corsOriginRule(): string[] | boolean {
  // Prod must declare an allowlist. Dev defaults to any localhost so
  // the Next.js dev server and tooling Just Work.
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (raw) return raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CORS_ALLOWED_ORIGINS must be set in production');
  }
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.0.2.2:3000',
    // Playwright suites (a11y + functional) spin `next start` on 3100
    // so they can coexist with a developer's `next dev` on 3000.
    'http://localhost:3100',
    'http://127.0.0.1:3100',
  ];
}

async function bootstrap() {
  requireProductionSecrets();

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({ origin: corsOriginRule(), credentials: true });

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

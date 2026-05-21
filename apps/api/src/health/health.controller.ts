import { Controller, Get, HttpCode, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@SkipThrottle()
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // Liveness: process is up and responding. Used by k8s/Docker.
  @Get('health')
  @HttpCode(200)
  live() {
    return { status: 'ok', uptimeSeconds: Math.floor(process.uptime()) };
  }

  // Readiness: also verifies downstream dependencies (DB). 503 if not ready.
  @Get('ready')
  async ready() {
    const dbOk = await this.prisma
      .$queryRaw`SELECT 1`.then(() => true)
      .catch(() => false);
    if (!dbOk) throw new ServiceUnavailableException({ status: 'degraded', db: false });
    return { status: 'ok', db: true };
  }
}

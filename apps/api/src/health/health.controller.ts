import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const dbOk = await this.prisma
      .$queryRaw`SELECT 1`.then(() => true)
      .catch(() => false);
    return { status: dbOk ? 'ok' : 'degraded', db: dbOk };
  }
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

const BCRYPT_ROUNDS = 12;

interface SignupInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

interface SigninInput {
  email: string;
  password: string;
}

export interface AuthedUser {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(input: SignupInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing?.passwordHash) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash, name: input.name ?? existing.name, phone: input.phone ?? existing.phone },
        })
      : await this.prisma.user.create({
          data: { email: input.email, passwordHash, name: input.name, phone: input.phone },
        });
    return this.issueToken(user);
  }

  async signin(input: SigninInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return this.issueToken(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organizer: { select: { id: true, slug: true, name: true, status: true } },
          },
        },
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      memberships: user.memberships.map((m) => ({
        role: m.role,
        organizer: m.organizer,
      })),
    };
  }

  async verifyToken(token: string): Promise<AuthedUser> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(token);
      return { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async issueToken(user: { id: string; email: string; name: string | null }) {
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}

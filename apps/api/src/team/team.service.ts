import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizerRole } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizerSlug: string) {
    const members = await this.prisma.organizerMember.findMany({
      where: { organizer: { slug: organizerSlug } },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { email: true, name: true } } },
    });
    return members.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    }));
  }

  async invite(
    organizerSlug: string,
    inviterId: string,
    input: { email: string; role: OrganizerRole },
  ) {
    await this.assertOwner(organizerSlug, inviterId);

    const organizer = await this.prisma.organizer.findUniqueOrThrow({
      where: { slug: organizerSlug },
    });

    const invitee = await this.prisma.user.upsert({
      where: { email: input.email },
      update: {},
      create: { email: input.email },
    });

    const existing = await this.prisma.organizerMember.findUnique({
      where: { organizerId_userId: { organizerId: organizer.id, userId: invitee.id } },
    });
    if (existing) {
      throw new BadRequestException(`${input.email} is already a member`);
    }

    const created = await this.prisma.organizerMember.create({
      data: { organizerId: organizer.id, userId: invitee.id, role: input.role },
      include: { user: { select: { email: true, name: true } } },
    });

    return {
      id: created.id,
      role: created.role,
      user: created.user,
      newAccount: !invitee.passwordHash,
    };
  }

  async updateRole(
    organizerSlug: string,
    callerId: string,
    memberId: string,
    role: OrganizerRole,
  ) {
    await this.assertOwner(organizerSlug, callerId);
    const member = await this.prisma.organizerMember.findUnique({
      where: { id: memberId },
      include: { organizer: { select: { slug: true } } },
    });
    if (!member || member.organizer.slug !== organizerSlug) {
      throw new NotFoundException('Member not found');
    }
    if (member.userId === callerId && role !== 'OWNER') {
      throw new BadRequestException("Owners can't demote themselves");
    }
    return this.prisma.organizerMember.update({
      where: { id: memberId },
      data: { role },
      select: { id: true, role: true },
    });
  }

  async remove(organizerSlug: string, callerId: string, memberId: string) {
    await this.assertOwner(organizerSlug, callerId);
    const member = await this.prisma.organizerMember.findUnique({
      where: { id: memberId },
      include: { organizer: { select: { slug: true, id: true } } },
    });
    if (!member || member.organizer.slug !== organizerSlug) {
      throw new NotFoundException('Member not found');
    }
    if (member.userId === callerId) {
      throw new BadRequestException("Owners can't remove themselves; transfer ownership first");
    }
    // Don't allow removing the last OWNER (UI shouldn't ever produce this, defensive)
    if (member.role === 'OWNER') {
      const ownerCount = await this.prisma.organizerMember.count({
        where: { organizerId: member.organizer.id, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('At least one owner is required');
      }
    }
    await this.prisma.organizerMember.delete({ where: { id: memberId } });
    return { id: memberId, removed: true };
  }

  private async assertOwner(organizerSlug: string, userId: string) {
    const m = await this.prisma.organizerMember.findFirst({
      where: { organizer: { slug: organizerSlug }, userId, role: 'OWNER' },
    });
    if (!m) throw new ForbiddenException('Only owners can manage team members');
  }
}

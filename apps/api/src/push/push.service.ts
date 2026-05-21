import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { DevicePlatform } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';

interface PushPayload {
  title: string;
  body: string;
  // Stable deep-link target the mobile client navigates to on tap.
  // Format: /tickets/<code> or /account/orders/<id> etc.
  deepLink?: string;
  // Extra key/value pairs delivered as FCM `data` payload.
  data?: Record<string, string>;
}

interface FcmMessage {
  message: {
    token: string;
    notification: { title: string; body: string };
    data?: Record<string, string>;
    // APNs-specific options. Default sound + thread-id grouping by deep-link family.
    apns?: {
      payload: {
        aps: { sound: string; 'thread-id'?: string };
      };
    };
    // Android channel mapping. The mobile client declares a "default"
    // channel for transactional messages.
    android?: {
      notification: { channel_id: string; priority: 'HIGH' | 'NORMAL' };
    };
  };
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private jwt: JWT | null = null;
  private projectId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_JSON unset — push notifications will log to stdout only.',
      );
      return;
    }
    try {
      // Accept either a raw JSON string or a base64-encoded one. Helm
      // operators tend to base64-pack secrets to dodge YAML escaping.
      const json = raw.trim().startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf8');
      const credentials = JSON.parse(json) as {
        project_id: string;
        client_email: string;
        private_key: string;
      };
      this.projectId = credentials.project_id;
      this.jwt = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
      });
      this.logger.log(`Firebase Messaging initialised for project ${this.projectId}`);
    } catch (err) {
      this.logger.error(
        `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // ---------- Device-token lifecycle ----------

  async register(userId: string, token: string, platform: DevicePlatform) {
    // The unique constraint on `token` means upsert handles "same
    // device, new user" cleanly — the row migrates to the new userId
    // and the old session loses notifications, which is the correct
    // behaviour after a sign-out / re-sign-in dance.
    await this.prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform, lastUsedAt: new Date() },
      create: { userId, token, platform },
    });
    return { registered: true };
  }

  async unregister(userId: string, token: string) {
    const res = await this.prisma.deviceToken.deleteMany({
      where: { userId, token },
    });
    return { removed: res.count > 0 };
  }

  // ---------- Sending ----------

  /**
   * Fan a push out to every active device belonging to the user.
   * Best-effort: a single bad token doesn't fail the call. Stale tokens
   * (`registration-token-not-registered`) are deleted so they don't
   * waste retries forever.
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<{ delivered: number }> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
      orderBy: { lastUsedAt: 'desc' },
    });
    if (tokens.length === 0) return { delivered: 0 };

    if (!this.jwt || !this.projectId) {
      this.logger.log(
        `[dev push] user=${userId} title="${payload.title}" body="${payload.body}" tokens=${tokens.length}`,
      );
      return { delivered: tokens.length };
    }

    let delivered = 0;
    for (const t of tokens) {
      const ok = await this.sendOne(t.token, payload);
      if (ok) delivered += 1;
    }
    return { delivered };
  }

  private async sendOne(token: string, payload: PushPayload): Promise<boolean> {
    try {
      const access = await this.jwt!.getAccessToken();
      if (!access.token) return false;
      const message: FcmMessage = {
        message: {
          token,
          notification: { title: payload.title, body: payload.body },
          data: {
            ...(payload.deepLink ? { deepLink: payload.deepLink } : {}),
            ...(payload.data ?? {}),
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                ...(payload.deepLink ? { 'thread-id': payload.deepLink.split('/')[1] ?? '' } : {}),
              },
            },
          },
          android: {
            notification: { channel_id: 'default', priority: 'HIGH' },
          },
        },
      };
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${access.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(message),
        },
      );
      if (res.ok) return true;
      const body = await res.text();
      // FCM uses specific error codes to mean "delete this token"; honour
      // them so we stop retrying forever.
      if (
        res.status === 404 ||
        body.includes('UNREGISTERED') ||
        body.includes('INVALID_ARGUMENT')
      ) {
        this.logger.warn(`Token rejected, deleting: ${token.slice(0, 12)}…`);
        await this.prisma.deviceToken.deleteMany({ where: { token } });
        return false;
      }
      this.logger.error(`FCM send failed (${res.status}): ${body.slice(0, 200)}`);
      return false;
    } catch (err) {
      this.logger.error(
        `FCM send threw: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }
}

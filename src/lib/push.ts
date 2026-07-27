import "server-only";
import webpush from "web-push";
import { prisma } from "./prisma";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

export const pushEnabled = Boolean(publicKey && privateKey);

if (publicKey && privateKey) {
  webpush.setVapidDetails("mailto:care@kavilcure.com", publicKey, privateKey);
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// Best-effort fan-out to every device the user enabled notifications on.
// Never throws: notification failures must not break the action that
// triggered them. Dead subscriptions (endpoint gone) are pruned.
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!pushEnabled) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);
  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: subscription.id } })
            .catch(() => {});
        }
      }
    })
  );
}

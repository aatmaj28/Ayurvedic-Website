import "server-only";
import { Resend } from "resend";
import { prisma } from "./prisma";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const emailEnabled = Boolean(resend);

const FROM = process.env.EMAIL_FROM ?? "Kavil-Cure <onboarding@resend.dev>";

function siteUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "https://ayurvedic-website-ten.vercel.app";
}

export type EmailContent = {
  subject: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaPath?: string;
};

function renderHtml(content: EmailContent): string {
  const cta =
    content.ctaLabel && content.ctaPath
      ? `<a href="${siteUrl()}${content.ctaPath}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#337a4d;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">${content.ctaLabel}</a>`
      : "";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f2ea;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="background:#337a4d;border-radius:12px 12px 0 0;padding:20px 28px;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;">🌿 Kavil-Cure</span>
      </div>
      <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#20402c;">${content.heading}</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#3d4a41;">${content.body}</p>
        ${cta}
      </div>
      <p style="margin:20px 8px 0;font-size:12px;line-height:1.5;color:#8a938c;">
        Kavil-Cure offers traditional Ayurvedic support and is not a substitute
        for professional medical advice. Jaundice can indicate a serious
        condition — always consult a qualified physician.
      </p>
    </div>
  </body>
</html>`;
}

// Best-effort: email failures must never break the action that triggered
// them (e.g. unverified domain, rate limits, bad address).
export async function sendEmailToUser(userId: string, content: EmailContent) {
  if (!resend) return;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return;
    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: content.subject,
      html: renderHtml(content),
    });
  } catch {
    // swallow — notifications are best-effort
  }
}

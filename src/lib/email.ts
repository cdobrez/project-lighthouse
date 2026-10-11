import "server-only";
import { Resend } from "resend";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "Gig Kitchens <orders@gigkitchens.com>";

/** Sends a transactional email through Resend. Silently skipped (with a log line) until RESEND_API_KEY is set. */
export async function sendEmail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!isEmailConfigured()) {
    console.info(`[gigkitchens] email skipped (no RESEND_API_KEY): "${input.subject}" -> ${input.to}`);
    return { ok: false as const, skipped: true as const };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM, to: input.to, subject: input.subject, html: input.html, text: input.text });
    if (error) {
      console.error("[gigkitchens] email failed:", error);
      return { ok: false as const, skipped: false as const };
    }
    return { ok: true as const };
  } catch (err) {
    console.error("[gigkitchens] email failed:", err);
    return { ok: false as const, skipped: false as const };
  }
}

export function siteUrl(): string {
  return process.env.SITE_URL ?? "https://gigkitchens.com";
}

export function emailLayout(title: string, body: string, cta?: { href: string; label: string }) {
  const button = cta
    ? `<p style="margin:24px 0"><a href="${cta.href}" style="background:#c8502f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;display:inline-block">${cta.label}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#fbf6ee;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2b2118">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <p style="font-size:20px;font-weight:800;margin:0 0 20px"><span style="color:#2b2118">Gig</span><span style="color:#c8502f">Kitchens</span></p>
    <div style="background:#fffdf8;border:1px solid #e6dccb;border-radius:20px;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#5c4d40">${body}</div>
      ${button}
    </div>
    <p style="font-size:12px;color:#8a7a6b;margin-top:20px">Home-cooked meals from your neighbors. <a href="${siteUrl()}" style="color:#8a7a6b">${siteUrl().replace("https://", "")}</a></p>
  </div></body></html>`;
}

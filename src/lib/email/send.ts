import nodemailer from "nodemailer";

/**
 * GrowthSpace application email transport.
 * Customer mailboxes are provider-agnostic; app email uses Resend or Gmail SMTP.
 */
export interface OutboundEmail {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  inReplyTo?: string;
  references?: string | string[];
}

function env(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function plainTextEmail(text: string) {
  const safeBody = escapeHtml(text).replace(/\r?\n/g, "<br>");
  return '<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033"><div style="max-width:620px;margin:32px auto;padding:0 16px"><div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;background:#fff"><div style="padding:22px 28px;background:#0f172a;color:#fff;font-size:17px;font-weight:700">GrowthSpace</div><div style="padding:30px 28px;font-size:15px;line-height:1.7">' + safeBody + '</div></div><div style="padding:16px;text-align:center;color:#64748b;font-size:12px">Sent by your GrowthSpace team</div></div></body></html>';
}

export function emailTransport(): "resend" | "gmail" | "none" {
  if (env("RESEND_API_KEY") && env("EMAIL_FROM")) return "resend";
  if (env("GMAIL_USER") && env("GMAIL_APP_PASSWORD")) return "gmail";
  return "none";
}

/** Resolves true only when the configured mail provider accepts the message. */
export async function sendEmail(mail: OutboundEmail): Promise<boolean> {
  const to = mail.to.trim();
  const subject = mail.subject.trim();
  if (!to || !subject || (!mail.text && !mail.html)) throw new Error("Application email requires a recipient, subject, and body.");

  const transport = emailTransport();
  if (transport === "none") {
    throw new Error("Application email is not configured. Add a verified Resend sender or Gmail SMTP credentials.");
  }

  if (transport === "gmail") {
    const user = env("GMAIL_USER")!;
    const password = env("GMAIL_APP_PASSWORD")!;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: password },
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await transporter.sendMail({
      from: { name: "GrowthSpace", address: user },
      to,
      subject,
      html: mail.html ?? (mail.text ? plainTextEmail(mail.text) : undefined),
      text: mail.text,
      inReplyTo: mail.inReplyTo,
      references: mail.references,
    });
    return true;
  }

  const from = env("EMAIL_FROM")!;
  const apiKey = env("RESEND_API_KEY")!;
  const headers: Record<string, string> = {};
  if (mail.inReplyTo) headers["In-Reply-To"] = mail.inReplyTo;
  if (mail.references) headers.References = Array.isArray(mail.references) ? mail.references.join(" ") : mail.references;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: mail.html ?? (mail.text ? plainTextEmail(mail.text) : undefined),
      ...(mail.text ? { text: mail.text } : {}),
      ...(Object.keys(headers).length ? { headers } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    let message = "HTTP " + response.status;
    try { const data = (await response.json()) as { message?: string; error?: string }; message = data.message || data.error || message; }
    catch { /* Keep the HTTP status when Resend does not return JSON. */ }
    throw new Error("Resend rejected the email: " + message);
  }
  return true;
}

/**
 * Growth Inspector application email transport.
 * Customer mailboxes are provider-agnostic; application email is sent through Resend.
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
  return '<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033"><div style="max-width:620px;margin:32px auto;padding:0 16px"><div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;background:#fff"><div style="padding:22px 28px;background:#0f172a;color:#fff;font-size:17px;font-weight:700">Growth Inspector</div><div style="padding:30px 28px;font-size:15px;line-height:1.7">' + safeBody + '</div></div><div style="padding:16px;text-align:center;color:#64748b;font-size:12px">Sent by your Growth Inspector team</div></div></body></html>';
}

export function emailTransport(): "resend" | "none" {
  return env("RESEND_API_KEY") && env("EMAIL_FROM") ? "resend" : "none";
}

/** Resolves true only when Resend accepted the message. */
export async function sendEmail(mail: OutboundEmail): Promise<boolean> {
  const to = mail.to.trim();
  const subject = mail.subject.trim();
  const from = env("EMAIL_FROM");
  const apiKey = env("RESEND_API_KEY");

  if (!to || !subject || (!mail.text && !mail.html)) throw new Error("Application email requires a recipient, subject, and body.");
  if (!apiKey) throw new Error("Growth Inspector application email is not configured. Add RESEND_API_KEY to the server environment.");
  if (!from) throw new Error("EMAIL_FROM is required and must use a verified Resend sender domain.");

  const headers: Record<string, string> = {};
  if (mail.inReplyTo) headers["In-Reply-To"] = mail.inReplyTo;
  if (mail.references) headers.References = Array.isArray(mail.references) ? mail.references.join(" ") : mail.references;

  const payload = {
    from,
    to: [to],
    subject,
    html: mail.html ?? (mail.text ? plainTextEmail(mail.text) : undefined),
    ...(mail.text ? { text: mail.text } : {}),
    ...(Object.keys(headers).length ? { headers } : {}),
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "HTTP " + response.status;
    try { const data = (await response.json()) as { message?: string; error?: string }; message = data.message || data.error || message; }
    catch { /* Keep the HTTP status when Resend does not return JSON. */ }
    throw new Error("Resend rejected the email: " + message);
  }
  return true;
}

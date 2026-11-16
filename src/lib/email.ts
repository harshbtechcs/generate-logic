import "server-only";

/**
 * Sends transactional emails (verification, password reset) through Resend's REST API.
 * No SDK needed — one fetch call. In development without a key, the link is printed
 * to the terminal instead so you can still test the flow.
 */

type Mail = { to: string; subject: string; html: string; text: string };

async function send({ to, subject, html, text }: Mail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Generate Logic <onboarding@resend.dev>";

  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[email] RESEND_API_KEY not set — would send to ${to}:\n  ${subject}\n  ${text}\n`);
      return;
    }
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Resend's testing sender can only deliver to the account owner's address.
    console.error(`[email] Resend error ${res.status}: ${body}`);
    throw new Error("Could not send email");
  }
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(title: string, intro: string, button: string, url: string, footer: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#060B19;font-family:Arial,Helvetica,sans-serif;color:#E6EDF7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0A1A2C;border:1px solid #1f3b4d;border-radius:16px;padding:32px">
        <tr><td style="font-size:13px;letter-spacing:3px;color:#5EEAD4;font-weight:bold">GENERATE LOGIC</td></tr>
        <tr><td style="padding-top:18px;font-size:24px;font-weight:bold;color:#E6EDF7">${title}</td></tr>
        <tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#A9B6CA">${intro}</td></tr>
        <tr><td style="padding-top:24px">
          <a href="${url}" style="display:inline-block;background:#5EEAD4;color:#04121A;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:10px">${button}</a>
        </td></tr>
        <tr><td style="padding-top:24px;font-size:13px;line-height:1.6;color:#8A99AF">${footer}<br><br>
          If the button does not work, copy this link into your browser:<br>
          <span style="color:#7DD3FC;word-break:break-all">${url}</span>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#64748B;margin-top:16px">Learn. Build. Automate. Deploy.</p>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const first = escape(name.split(" ")[0] || "there");
  await send({
    to,
    subject: "Verify your email — Generate Logic",
    html: layout(
      `Welcome, ${first}!`,
      "Please confirm your email address to activate your Generate Logic account.",
      "Verify email",
      url,
      "This link expires in 1 hour. If you did not create an account, you can ignore this email.",
    ),
    text: `Welcome to Generate Logic! Verify your email: ${url} (expires in 1 hour)`,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, url: string) {
  const first = escape(name.split(" ")[0] || "there");
  await send({
    to,
    subject: "Reset your password — Generate Logic",
    html: layout(
      `Hi ${first},`,
      "We received a request to reset your Generate Logic password.",
      "Reset password",
      url,
      "This link expires in 1 hour. If you did not ask for this, ignore this email — your password stays the same.",
    ),
    text: `Reset your Generate Logic password: ${url} (expires in 1 hour)`,
  });
}

import "server-only";

/**
 * Email-notification hook for new enquiries/bookings.
 * Wire this to any provider (Resend, SendGrid, Postmark, SMTP) by setting NOTIFY_WEBHOOK_URL
 * (e.g. a Zapier/Make/GHL webhook) — no provider SDK is bundled by default.
 * Failures never block the customer's submission.
 */
export async function notifyTeam(kind: "contact" | "booking" | "order", payload: Record<string, unknown>) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload, at: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("[notify] failed", (e as Error).message);
  }
}

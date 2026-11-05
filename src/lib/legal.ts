import "server-only";
import { connectDB, hasDb } from "./db";
import { Page } from "@/models";

/** Default legal copy. Admin can override any of these from Admin → Pages (same slug). */
export const LEGAL_DEFAULTS: Record<string, { title: string; content: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    content: `This Privacy Policy explains how SeeknPurchase (operated by US SALES LLC) collects, uses and protects your information when you visit seeknpurchase.com or place an order.

## Information we collect
- Contact details you provide, such as your name, email address, phone number and shipping address.
- Order details, including products purchased and order history.
- Technical data such as browser type and pages visited, used to keep the site working and improve it.

Payment card details are processed directly by our payment provider, Stripe. We do not store full card numbers on our servers.

## How we use information
- To process and deliver orders and send order updates.
- To respond to questions and support requests.
- To send marketing emails if you have subscribed. You can unsubscribe at any time.

## Sharing
We share information only with service providers that help us operate the store (for example payment processing, shipping and email delivery), or when required by law. We do not sell your personal information.

## Cookies
We use essential cookies to keep your cart, language preference and account session working. You can control cookies through your browser settings; disabling essential cookies may affect site functionality.

## Your choices
You may request access to, correction of, or deletion of your personal information by contacting info@seeknpurchase.com.

## Contact
Questions about this policy: info@seeknpurchase.com or 213-259-3140.`,
  },
  terms: {
    title: "Terms of Service",
    content: `By using seeknpurchase.com you agree to these Terms of Service.

## Orders and pricing
All orders are subject to availability and acceptance. Prices are listed in US dollars and may change without notice. If a product is listed at an incorrect price due to an error, we may cancel the order and refund any payment.

## Payment
Payments are processed securely by Stripe. Your order is confirmed once payment has been successfully authorized.

## Shipping, returns and exchanges
Please review our Shipping Policy and Return Policy for details.

## Accounts
You are responsible for keeping your account password confidential and for activity that occurs under your account.

## Limitation of liability
To the fullest extent permitted by law, SeeknPurchase is not liable for indirect or consequential damages arising from use of the site or products.

## Contact
info@seeknpurchase.com · 213-259-3140`,
  },
  "shipping-policy": {
    title: "Shipping Policy",
    content: `## Processing time
Orders are typically processed within 1–2 business days.

## Delivery times
- Standard shipping: 3–7 business days.
- Express shipping: 1–3 business days.

Delivery times are estimates and may vary during peak periods.

## Free shipping
Free standard shipping applies to qualifying orders that meet the free-shipping threshold shown at checkout.

## Tracking
Once your order ships, you will receive an email with tracking details. You can also view order status in your account.

## Questions
Contact info@seeknpurchase.com or call 213-259-3140.`,
  },
  "return-policy": {
    title: "Return Policy",
    content: `We want you to love your purchase. If something isn't right, we're here to help.

## Returns and exchanges
Unused items in their original condition and packaging may be returned or exchanged within 30 days of delivery.

## How to start a return
Email info@seeknpurchase.com with your order number and the item(s) you would like to return or exchange. Our team will reply with instructions.

## Refunds
Approved refunds are issued to the original payment method. Please allow 5–10 business days for the refund to appear, depending on your bank.

## Non-returnable items
For hygiene reasons, certain items (such as opened fragrances) may not be eligible for return unless they arrive damaged or defective.

## Damaged or incorrect items
If your order arrives damaged or incorrect, contact us within 7 days of delivery and we will make it right.`,
  },
};

export async function getLegalPage(slug: string) {
  const fallback = LEGAL_DEFAULTS[slug];
  if (!hasDb()) return { ...fallback, titleEs: undefined as string | undefined, contentEs: undefined as string | undefined };
  try {
    await connectDB();
    const p = await Page.findOne({ slug }).lean();
    return {
      title: p?.titleEn || fallback.title,
      content: p?.contentEn || fallback.content,
      titleEs: p?.titleEs || undefined,
      contentEs: p?.contentEs || undefined,
    };
  } catch {
    return { ...fallback, titleEs: undefined, contentEs: undefined };
  }
}

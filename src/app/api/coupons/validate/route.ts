import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { cartLines } from "@/lib/validation";
import { priceCart } from "@/lib/pricing";

export const runtime = "nodejs";

export const POST = handle(async (req: Request) => {
  const body = z.object({ code: z.string().trim().min(1).max(40), items: cartLines }).parse(await req.json());
  const priced = await priceCart(body.items, { couponCode: body.code });
  return ok({ success: true, code: priced.coupon?.code, discount: priced.discount, subtotal: priced.subtotal });
});

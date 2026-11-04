import { z } from "zod";
import { handle, ok, requireCustomer } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models";

export const runtime = "nodejs";

const slugList = z.array(z.string().trim().min(1).max(160)).max(200);

/** PUT { wishlist } replaces; PUT { merge } unions with the stored list. Returns the result. */
export const PUT = handle(async (req: Request) => {
  const s = await requireCustomer();
  const body = z.object({ wishlist: slugList.optional(), merge: slugList.optional() }).parse(await req.json());
  await connectDB();
  const c = await Customer.findById(s.sub);
  if (!c) return ok({ wishlist: [] });
  const next = body.wishlist ?? [...new Set([...(c.wishlist || []), ...(body.merge || [])])];
  c.wishlist = next.slice(0, 200);
  await c.save();
  return ok({ wishlist: c.wishlist });
});

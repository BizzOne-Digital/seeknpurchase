import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ClipArt } from "@/models";

export const revalidate = 300;

/** Active clip art for the product designer. */
export async function GET() {
  if (!process.env.MONGODB_URI) return NextResponse.json({ items: [] });
  try {
    await connectDB();
    const items = await ClipArt.find({ active: true }).sort({ category: 1, sortOrder: 1, createdAt: -1 }).limit(500).select("title category image").lean();
    return NextResponse.json({ items: items.map((c) => ({ id: String(c._id), title: c.title, category: c.category || "General", image: c.image })) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

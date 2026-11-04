import {
  ShoppingCart, ShoppingBag, Search, Headphones, Layers, Store, Glasses, Package, Gift, Truck, Sparkles, Heart, Gem, Star,
  ShieldCheck, Tag, Clock, Smile, type LucideProps,
} from "lucide-react";

/** Whitelisted icon names that admins can choose for services and similar content. */
export const ICONS = {
  ShoppingCart, ShoppingBag, Search, Headphones, Layers, Store, Glasses, Package, Gift, Truck, Sparkles, Heart, Gem, Star,
  ShieldCheck, Tag, Clock, Smile,
};
export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function Icon({ name, ...props }: { name?: string } & LucideProps) {
  const C = ICONS[(name as IconName) || "ShoppingBag"] ?? ShoppingBag;
  return <C strokeWidth={1.5} {...props} />;
}

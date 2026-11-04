import { getDictionary } from "@/lib/i18n/server";
import { WishlistGrid } from "@/components/account/WishlistGrid";

export default async function AccountWishlistPage() {
  const { t } = await getDictionary();
  return (
    <section>
      <h2 className="mb-6 text-2xl">{t.account.wishlist}</h2>
      <WishlistGrid columns={3} />
    </section>
  );
}

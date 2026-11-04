import { getLegalPage } from "@/lib/legal";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";
import { RichText } from "@/components/ui/RichText";

export async function LegalPage({ slug }: { slug: string }) {
  const [page, { locale }] = await Promise.all([getLegalPage(slug), getDictionary()]);
  const es = locale === "es";
  return (
    <>
      <PageHero title={(es && page.titleEs) || page.title} />
      <div className="container max-w-3xl py-12 md:py-16" id="cookies">
        <RichText text={(es && page.contentEs) || page.content} />
      </div>
    </>
  );
}

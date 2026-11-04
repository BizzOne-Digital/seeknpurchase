import { Facebook, Instagram, Youtube } from "lucide-react";

function Pinterest(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M10.2 20.5 12 13.2m0 0c.4 1 1.3 1.6 2.4 1.6 2 0 3.4-2 3.4-4.6 0-2.8-2.4-4.7-5.4-4.7-3.3 0-5.4 2.3-5.4 4.9 0 1 .4 2.1 1.2 2.6" />
      <path d="M12 13.2c-.3-1.2-.2-2.7.6-3.4" />
    </svg>
  );
}

function TikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
    </svg>
  );
}

type Social = { instagram?: string; facebook?: string; pinterest?: string; youtube?: string; tiktok?: string };

export function SocialIcons({ social }: { social: Social }) {
  const items = [
    { key: "instagram", label: "Instagram", Icon: Instagram },
    { key: "facebook", label: "Facebook", Icon: Facebook },
    { key: "pinterest", label: "Pinterest", Icon: Pinterest },
    { key: "youtube", label: "YouTube", Icon: Youtube },
    { key: "tiktok", label: "TikTok", Icon: TikTok },
  ] as const;
  return (
    <ul className="flex items-center gap-3">
      {items.map(({ key, label, Icon }) => {
        const href = social[key] || "#";
        return (
          <li key={key}>
            <a
              href={href}
              aria-label={label}
              target={social[key] ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-gold hover:bg-gold hover:text-white"
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

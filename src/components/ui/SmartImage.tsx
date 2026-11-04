import Image, { type ImageProps } from "next/image";
import { normalizeImageUrl } from "@/lib/utils";

/** next/image wrapper: normalizes legacy URLs and skips optimization for SVG placeholders. */
export function SmartImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src?: string | null }) {
  const url = normalizeImageUrl(src);
  return <Image src={url} alt={alt} unoptimized={url.endsWith(".svg") || url.endsWith(".gif")} {...rest} />;
}

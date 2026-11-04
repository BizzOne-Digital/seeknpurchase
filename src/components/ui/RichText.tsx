import { Fragment } from "react";

/**
 * Minimal, XSS-safe text formatter for admin-authored content.
 * Supports: blank-line paragraphs, "## " / "### " headings, "- " bullet lists, **bold**.
 * Produces React elements only — never injects raw HTML.
 */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function RichText({ text, className = "prose-sp" }: { text?: string; className?: string }) {
  if (!text) return null;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-*] /.test(l))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*] /, ""))}</li>)}</ul>;
        }
        return (
          <Fragment key={i}>
            {lines.map((l, j) => {
              if (l.startsWith("### ")) return <h3 key={j}>{inline(l.slice(4))}</h3>;
              if (l.startsWith("## ")) return <h2 key={j}>{inline(l.slice(3))}</h2>;
              return null;
            })}
            {lines.some((l) => !l.startsWith("## ") && !l.startsWith("### ") && l.trim()) && (
              <p>{inline(lines.filter((l) => !l.startsWith("## ") && !l.startsWith("### ")).join(" "))}</p>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

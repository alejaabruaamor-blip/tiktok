import { useEffect, useRef } from "react";

export function MirrorPage({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const videos = Array.from(ref.current?.querySelectorAll("video") ?? []);
    const handlers = videos.map((v) => {
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.play().catch(() => {});
      const onClick = () => {
        if (v.paused) v.play().catch(() => {});
        else v.muted = !v.muted;
      };
      v.addEventListener("click", onClick);
      return () => v.removeEventListener("click", onClick);
    });
    return () => handlers.forEach((h) => h());
  }, [html]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}

export const mirrorHead = (title: string, description: string) => () => ({
  meta: [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  links: [
    { rel: "stylesheet", href: "/mirror/styles.css" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
    },
  ],
});

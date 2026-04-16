import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Font = Quill.import("formats/font");
// @ts-ignore
Font.whitelist = ["crimson", "baskerville", "playfair", "caveat", "patrick", "inter", "garamond", "spectral"];
// @ts-ignore
Quill.register(Font, true);

type Props = {
  content: string; // raw delta JSON string from DB
};

export default function LetterViewer({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const q = new Quill(containerRef.current, {
      theme: "snow",
      readOnly: true,
      modules: { toolbar: false },
    });

    try {
      const delta = JSON.parse(content);
      q.setContents(delta);
    } catch {
      // fallback if content isn't valid delta
      q.setText(content);
    }
  }, [content]);

  return <div ref={containerRef} className="min-h-[40vh] bg-[var(--wheat)]" />;
}
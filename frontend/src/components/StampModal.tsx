import { useEffect, useState } from "react";

type Stamp = {
  id: number;
  label: string;
  image_url: string;
  category?: string;
  description?: string;
  author?: string;
  author_source_link?: string;
};

export default function StampModal({ stamps }: { stamps: Stamp[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Stamp | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest(
        "[data-stamp-id]"
      ) as HTMLElement | null;

      if (!el) return;

      const id = Number(el.dataset.stampId);
      const stamp = stamps.find((s) => s.id === id);

      if (!stamp) return;

      setSelected(stamp);
      setOpen(true);
    }

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [stamps]);

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !selected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setOpen(false)}
      />

      <div className="relative bg-[var(--paper-bg)] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--wheat)] text-[var(--onyx)]"
        >
          ✕
        </button>

        <div className="p-6 flex items-center justify-center bg-white/40">
          <img src={selected.image_url} className="w-28 h-40 object-contain" />
        </div>

        <div className="p-5 flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{selected.label}</h2>

          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            {selected.category}
          </p>

          <p className="text-sm text-gray-600">
            {selected.description || "No description available."}
          </p>

          <div>
            <span className="text-xs text-gray-400">Artist</span>
            <p className="text-sm text-gray-700">
              {selected.author || "Unknown"}
            </p>
          </div>

          {selected.author_source_link && (
            <a
              href={selected.author_source_link}
              target="_blank"
              className="mt-3 bg-[var(--blue-energy)] text-white text-xs py-2 rounded-xl text-center"
            >
              View Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
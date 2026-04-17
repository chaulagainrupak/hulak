import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../utilities/constants";

type Stamp = {
  id: number;
  label: string;
  image_url: string;
  category?: string;
  description?: string;
  author?: string;
  author_source_link?: string;
};

type Props = {
  selectedStampId: number | null;
  onSelect: (id: number) => void;
};

export default function StampPicker({ selectedStampId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/stamps`);
        const data = await res.json();

        const arr: Stamp[] = Object.values(data);

        setStamps(arr);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, []);

  const stampMap = useMemo(() => {
    const map = new Map<number, Stamp>();
    stamps.forEach((s) => map.set(Number(s.id), s));
    return map;
  }, [stamps]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    stamps.forEach((s) => set.add(s.category || "other"));
    return ["all", ...Array.from(set)];
  }, [stamps]);

  const filteredStamps = useMemo(() => {
    if (activeCategory === "all") return stamps;
    return stamps.filter((s) => (s.category || "other") === activeCategory);
  }, [stamps, activeCategory]);

  const selected =
    selectedStampId != null ? stampMap.get(selectedStampId) : null;

  return (
    <>
      <div className="flex flex-col h-full gap-1.5">
        <div
          className="relative group cursor-pointer rounded-lg overflow-hidden border border-black/10 bg-[var(--paper-bg)] hover:border-[var(--blue-energy)]/40 transition"
          style={{ aspectRatio: "1 / 1.3" }}
          onClick={() => setOpen(true)}
        >
          {selected ? (
            <>
              <img
                src={selected.image_url}
                className="absolute inset-0 w-full h-full object-contain"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-[10px] uppercase font-semibold">
                  Change
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4/5 h-4/5 border-2 border-dashed border-black/10 rounded flex items-center justify-center">
                <span className="text-[9px] text-gray-300 uppercase">
                  Stamp
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-full py-1.5 text-[10px] uppercase font-semibold border border-black/10 rounded-md"
        >
          {selected ? "Change" : "Choose"}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Choose stamp</h3>

              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-gray-400"
                />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-[10px] whitespace-nowrap rounded-full border transition ${
                    activeCategory === cat
                      ? "bg-[var(--blue-energy)] text-white border-[var(--blue-energy)]"
                      : "border-black/10 text-gray-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-xs text-gray-400 text-center py-6">
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
                {filteredStamps.map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => {
                      onSelect(Number(stamp.id));
                      setOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border hover:border-black/10"
                  >
                    <div
                      className="w-full overflow-hidden rounded"
                      style={{ aspectRatio: "1 / 1.3" }}
                    >
                      <img
                        src={stamp.image_url}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="text-[10px] text-gray-500">
                      {stamp.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
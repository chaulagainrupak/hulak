import { useEffect, useMemo, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faStamp } from "@fortawesome/free-solid-svg-icons";
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
  const [visible, setVisible] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [pendingSelect, setPendingSelect] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      document.body.style.overflow = "";
      setVisible(false);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(() => setOpen(false), 250);
  }

  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/stamps`);
        const data = await res.json();
        setStamps(Object.values(data));
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

  const pendingStamp =
    pendingSelect != null ? stampMap.get(pendingSelect) : null;

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function handleSelect(stamp: Stamp) {
    setPendingSelect(Number(stamp.id));
  }

  function confirmSelection() {
    if (pendingSelect != null) onSelect(pendingSelect);
    handleClose();
  }

  return (
    <>
      <div className="flex flex-col h-full gap-2">
        <div
          onClick={() => setOpen(true)}
          style={{ aspectRatio: "1 / 1.3" }}
          className="
            relative overflow-hidden rounded-2xl cursor-pointer group
            border-2 transition-all duration-300
            border-dashed border-[var(--onyx)]/15
            bg-[var(--paper-bg)]
          "
        >
          {selected ? (
            <img
              src={selected.image_url}
              className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faStamp}
                className="text-3xl text-[var(--blue-energy)]/30"
              />
            </div>
          )}
        </div>

        <button
          data-umami-event="Open Stamp Picker"
          onClick={() => setOpen(true)}
          className="
            w-full py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest
            border border-[var(--blue-energy)]/20
            bg-[var(--paper-bg)]
          "
        >
          {selected ? "Change" : "Choose"}
        </button>
      </div>

      {open && (
        <div
          onClick={handleClose}
          className={`
            fixed inset-0 z-50 flex items-center justify-center px-4
            transition-all duration-300
            ${visible ? "bg-black/45 backdrop-blur-sm" : "bg-black/0"}
          `}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`
              w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden
              bg-[var(--paper-bg)]
              shadow-2xl
              transition-all duration-300
              ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            `}
          >
            <div className="flex justify-between px-6 pt-6 pb-4 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold">Choose a Stamp</h3>
                <p className="text-[11px] text-gray-400">
                  {filteredStamps.length} available
                </p>
              </div>

              <button
                data-umami-event="Close Stamp Picker"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-gray-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto px-6 py-3 border-b border-black/5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  data-umami-event="Stamp Category Click"
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap rounded-full
                    transition-all duration-200
                    ${
                      activeCategory === cat
                        ? "bg-[var(--blue-energy)] text-white"
                        : "bg-[var(--wheat)]/40 text-[var(--onyx)]/60 hover:bg-[var(--wheat)]/70"
                    }
                  `}
                >
                  {capitalize(cat)}
                </button>
              ))}
            </div>

            <div className="p-5">
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto">
                {filteredStamps.map((stamp) => {
                  const isSelected = pendingSelect === Number(stamp.id);

                  return (
                    <button
                      key={stamp.id}
                      data-umami-event="Stamp Selected"
                      onClick={() => handleSelect(stamp)}
                      className={`
                        aspect-square p-1 rounded-lg border transition-all flex flex-col items-center justify-center
                        ${
                          isSelected
                            ? "border-[var(--blue-energy)] bg-blue-50"
                            : "border-transparent hover:border-gray-200"
                        }
                      `}
                    >
                      <img
                        src={stamp.image_url}
                        className="w-full h-full object-contain"
                      />
                      <span className="text-[9px] mt-1 truncate w-full text-center">
                        {capitalize(stamp.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                data-umami-event="Confirm Stamp Selection"
                onClick={confirmSelection}
                className="
                  w-full py-2 rounded-xl
                  bg-[var(--blue-energy)] text-white
                  text-xs font-bold
                  flex items-center justify-center gap-2
                "
              >
                {pendingStamp ? (
                  <>
                    <img
                      src={pendingStamp.image_url}
                      className="w-5 h-5 object-contain rounded"
                    />
                    <span className="truncate max-w-[140px]">
                      Done — {capitalize(pendingStamp.label)}
                    </span>
                  </>
                ) : (
                  <span>Done</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
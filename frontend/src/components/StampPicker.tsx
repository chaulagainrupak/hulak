import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { STAMPS } from "../utilities/constants";

type Props = {
  selectedStampId: string;
  onSelect: (id: string) => void;
};

export default function StampPicker({ selectedStampId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const selected = STAMPS.find((s) => s.id === selectedStampId);

  return (
    <>
      <div className="flex flex-col h-full gap-1.5">

        {/* Fixed aspect-ratio box — never shifts regardless of selection state */}
        <div
          className="relative group cursor-pointer rounded-lg overflow-hidden border border-black/10 bg-[var(--paper-bg)] hover:border-[var(--blue-energy)]/40 transition"
          style={{ aspectRatio: "1 / 1.3" }}
          onClick={() => setOpen(true)}
        >
          {selected ? (
            <>
              <img
                src={selected.url}
                alt={selected.label}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-[9px] font-semibold tracking-wide uppercase">Change</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4/5 h-4/5 rounded border-2 border-dashed border-black/10 group-hover:border-[var(--blue-energy)]/30 transition flex flex-col items-center justify-center gap-1">
                <svg className="w-4 h-4 text-gray-300 group-hover:text-[var(--blue-energy)]/40 transition" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[9px] text-gray-300 group-hover:text-[var(--blue-energy)]/50 transition text-center leading-tight font-medium uppercase tracking-wide">
                  Stamp
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fixed-height button */}
        <button
          onClick={() => setOpen(true)}
          className={`
            w-full py-1.5 rounded-md text-[10px] font-semibold
            tracking-wide uppercase transition flex-shrink-0
            ${selected
              ? "border border-[var(--blue-energy)]/30 bg-[var(--blue-energy)]/5 text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/10"
              : "border border-black/10 bg-white text-gray-400 hover:border-[var(--blue-energy)]/40 hover:text-[var(--blue-energy)]"
            }
          `}
        >
          {selected ? "Change" : "Choose"}
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">Choose a stamp</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {STAMPS.map((stamp) => (
                <button
                  key={stamp.id}
                  onClick={() => { onSelect(stamp.id); setOpen(false); }}
                  className={`
                    flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition
                    ${selectedStampId === stamp.id
                      ? "border-[var(--blue-energy)] bg-[var(--blue-energy)]/5"
                      : "border-transparent hover:border-black/10 bg-[var(--paper-bg)]"
                    }
                  `}
                >
                  <div className="w-full overflow-hidden rounded" style={{ aspectRatio: "1 / 1.3" }}>
                    <img src={stamp.url} alt={stamp.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-gray-500">{stamp.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

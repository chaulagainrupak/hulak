import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faXmark,
  faPaperPlane,
  faPenNib,
} from "@fortawesome/free-solid-svg-icons";

// ─── Label ────────────────────────────────────────────────────────────────────
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
      {children}
    </span>
  );
}

// ─── Sender Email ─────────────────────────────────────────────────────────────
export function SenderEmail({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-1.5">
      <div className="flex items-baseline gap-1 mb-1">
        <FieldLabel>Email</FieldLabel>
        <span className="text-[9px] text-gray-300 font-normal italic normal-case tracking-normal">
          optional
        </span>
      </div>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@example.com"
          type="email"
          className="
            w-full border border-black/10 rounded-md pl-7 pr-2.5 py-1.5 text-xs
            focus:outline-none focus:ring-2 focus:ring-[var(--blue-energy)]/20
            bg-[var(--paper-bg)] placeholder:text-gray-300 transition
          "
        />
        <FontAwesomeIcon
          icon={faEnvelope}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 pointer-events-none"
        />
      </div>
    </div>
  );
}

// ─── Receiver Email ───────────────────────────────────────────────────────────
// Fixed min-height so the row never collapses and causes layout shift
export function ReceiverEmail({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1.5" style={{ minHeight: "2rem" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="
            flex items-center justify-center gap-1.5 w-full
            text-[10px] px-2 py-1 rounded-md
            border border-dashed border-black/10
            text-gray-400 hover:text-[var(--blue-energy)]
            hover:border-[var(--blue-energy)]/30 hover:bg-[var(--blue-energy)]/5
            transition font-medium
          "
        >
          <FontAwesomeIcon icon={faEnvelope} className="w-2.5 h-2.5" />
          <span>Notify by email</span>
          <span className="text-[9px] text-gray-300">(optional)</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="them@example.com"
            type="email"
            className="
              flex-1 border border-black/10 rounded-md px-2.5 py-1.5 text-xs
              focus:outline-none focus:ring-2 focus:ring-[var(--blue-energy)]/20
              bg-[var(--paper-bg)] placeholder:text-gray-300 transition
            "
          />
          {!value && (
            <button
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-gray-500 transition flex-shrink-0"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function SendButton({
  canSend,
  hasLetter,
  onSend,
  onNeedLetter,
}: {
  canSend: boolean;
  hasLetter: boolean;
  onSend: () => void;
  onNeedLetter: () => void;
}) {
  const ready = canSend && hasLetter;

  const handleClick = () => {
    if (!hasLetter) {
      onNeedLetter();
      return;
    }
    if (canSend) onSend();
  };

  return (
    <div className="p-3 border-t border-black/[0.05]">
      <button
        onClick={handleClick}
        disabled={
          canSend && hasLetter === false ? false : !ready && canSend === false
        }
        className={`
  flex items-center justify-center gap-2 w-full py-3.5 rounded-md
  font-semibold text-sm transition-all duration-150 select-none

  ${
    ready
      ? `
        bg-gradient-to-b
        from-[var(--blue-energy)]
        to-[var(--blue-energy)]/90
        text-white
        shadow-md
        hover:shadow-lg
        hover:-translate-y-[1px]
        active:translate-y-[1px]
        active:shadow-sm
        animate-[pulse_0.8s_ease-in-out]
      `
      : `
        bg-amber-50
        text-amber-500
        border border-amber-200
        hover:bg-amber-100
      `
  }
`}
      >
        {ready ? (
          <>
            <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
            Send Letter
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faPenNib} className="w-3.5 h-3.5" />
            Finish writing
          </>
        )}
      </button>

      {!canSend && (
        <p className="text-center text-[10px] text-gray-300 mt-1.5">
          Fill in sender &amp; recipient names above
        </p>
      )}
    </div>
  );
}

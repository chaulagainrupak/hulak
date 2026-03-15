import { useRef, useState, useEffect } from "react";
import type Quill from "quill";
import { LetterOutline } from "./AirMailBorder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import EnvelopePreview from "./EnvelopeTheme";

const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
const API_ENDPOINT = "https://api.hulak.app/send";
const SHARE_BASE_URL = "https://hulak.app/letter";
const DEV_MODE = true;

const OCCASIONS = [
  "Just because",
  "Love letter",
  "Confession",
  "Surprise",
  "Miss you",
  "Thank you",
  "Happy birthday",
  "Congratulations",
  "Apology",
  "Good luck",
];

const STAMPS = [
  { id: "pulp", label: "Pulp Fiction", url: "/stamps/pulp.png" },
  { id: "nepal", label: "नेपाल", url: "/stamps/nepal.png" },
  { id: "floral", label: "Floral", url: "/stamps/floral.png" },
  { id: "chiya", label: "Chi-Ya", url: "/stamps/chiya.png" },
  { id: "umbrella", label: "Umbrella", url: "/stamps/umbrella.png" },
];

declare global {
  interface Window {
    turnstile: any;
  }
}

type EnvelopeData = {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  occasion: string;
  customOccasionLabel: string;
  customSlug: string;
  notifyReceiver: boolean;
  joinMailingList: boolean;
  stampId: string;
};

// ─── STAMP PICKER ─────────────────────────────────────────────────────────────
function StampPicker({
  selectedStampId,
  onSelect,
}: {
  selectedStampId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = STAMPS.find((s) => s.id === selectedStampId);

  return (
    <>
      <div className="flex flex-col gap-1.5 h-full">
        <button
          onClick={() => setOpen(true)}
          className="flex-1 min-h-0 w-full overflow-hidden rounded-lg border border-black/10 bg-[var(--paper-bg)] hover:border-[var(--blue-energy)]/40 transition group"
        >
          {selected ? (
            <img
              src={selected.url}
              alt={selected.label}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2/3 h-2/3 rounded border-2 border-dashed border-black/10 group-hover:border-[var(--blue-energy)]/30 transition" />
            </div>
          )}
        </button>

        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 w-full py-1 rounded-md border border-black/10 bg-white hover:border-[var(--blue-energy)]/40 hover:bg-[var(--blue-energy)]/5 transition text-[10px] font-medium text-gray-400 hover:text-[var(--blue-energy)]"
        >
          {selected ? "Change" : "Choose"}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {STAMPS.map((stamp) => (
                <button
                  key={stamp.id}
                  onClick={() => {
                    onSelect(stamp.id);
                    setOpen(false);
                  }}
                  className="p-2 rounded-xl border-2 border-transparent hover:border-black/10 bg-[var(--paper-bg)]"
                >
                  <img
                    src={stamp.url}
                    alt={stamp.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function L({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        {children}
      </span>
      {optional && (
        <span className="text-[9px] text-gray-300 font-normal normal-case tracking-normal">
          optional
        </span>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
type Props = {
  quillRef: React.MutableRefObject<Quill | null>;
  onNeedLetter: () => void;
};

export default function EnvelopePanel({ quillRef, onNeedLetter }: Props) {
  const [envelope, setEnvelope] = useState<EnvelopeData>({
    senderName: "",
    senderEmail: "",
    receiverName: "",
    receiverEmail: "",
    occasion: "Just because",
    customOccasionLabel: "",
    customSlug: "",
    notifyReceiver: true,
    joinMailingList: true,
    stampId: "",
  });

  const set = (k: keyof EnvelopeData, v: any) =>
    setEnvelope((prev) => ({ ...prev, [k]: v }));

  const selectedStamp = STAMPS.find((s) => s.id === envelope.stampId);

  const inp =
    "w-full border border-black/10 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue-energy)]/20 bg-[var(--paper-bg)] placeholder:text-gray-300 transition";

  const canSend =
    !!envelope.senderName.trim() && !!envelope.receiverName.trim();

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── ENVELOPE PREVIEW ── */}
      <div className="px-1 w-full">
        <LetterOutline
          className="w-full"
          paperClassName="w-full aspect-[2.4/1] rounded-xl overflow-hidden"
        >
          <EnvelopePreview
            senderName={envelope.senderName}
            receiverName={envelope.receiverName}
            occasion={envelope.occasion}
            customOccasionLabel={envelope.customOccasionLabel}
            stampUrl={selectedStamp?.url}
            stampLabel={selectedStamp?.label}
          />
        </LetterOutline>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-[3fr_1fr] sm:items-stretch">
          <div className="divide-y divide-black/[0.05] sm:border-r sm:border-black/[0.05]">
            <div className="p-3 flex flex-col gap-1.5">
              <L>From</L>
              <input
                value={envelope.senderName}
                onChange={(e) => set("senderName", e.target.value.slice(0, 40))}
                placeholder="Your name"
                className={inp}
              />
              <div>
                <L optional>Email</L>
                <input
                  value={envelope.senderEmail}
                  onChange={(e) => set("senderEmail", e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className={inp}
                />
              </div>
            </div>

            <div className="p-3 flex flex-col gap-1.5">
              <L>To</L>
              <input
                value={envelope.receiverName}
                onChange={(e) =>
                  set("receiverName", e.target.value.slice(0, 40))
                }
                placeholder="Their name"
                className={inp}
              />
              <div>
                <L optional>Email</L>
                <input
                  value={envelope.receiverEmail}
                  onChange={(e) => set("receiverEmail", e.target.value)}
                  placeholder="them@example.com"
                  type="email"
                  className={inp}
                />
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-black/[0.05] sm:border-t-0 flex flex-col">
            <L>Stamp</L>
            <div className="flex-1 h-full">
              <StampPicker
                selectedStampId={envelope.stampId}
                onSelect={(id) => set("stampId", id)}
              />
            </div>
          </div>
        </div>

        {/* OCCASION */}
        <div className="p-4 border-t">
          <L>Occasion</L>

          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => set("occasion", o)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  envelope.occasion === o
                    ? "bg-[var(--blue-energy)] text-white border-[var(--blue-energy)]"
                    : "border-black/10 text-gray-500"
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          {envelope.occasion === "Just because" && (
            <input
              className={`${inp} mt-3`}
              placeholder="Give it a name…"
              value={envelope.customOccasionLabel}
              onChange={(e) => set("customOccasionLabel", e.target.value)}
            />
          )}
        </div>

        {/* CHECKBOXES */}
        <div className="p-4 border-t flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={envelope.notifyReceiver}
              onChange={() => set("notifyReceiver", !envelope.notifyReceiver)}
            />
            Notify recipient when opened
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={envelope.joinMailingList}
              onChange={() => set("joinMailingList", !envelope.joinMailingList)}
            />
            Keep me posted about हुलाक
          </label>
        </div>
        {/* SEND */}
        <div className="p-4 border-t">
          <button
            disabled={!canSend}
            className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${
              canSend
                ? "bg-[var(--blue-energy)] hover:brightness-110"
                : "bg-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Send Letter
          </button>
        </div>
      </div>
    </div>
  );
}

{
  /* CUSTOM LINK */
}
//   <div className="p-4 border-t">
//     <L optional>Custom link</L>

//     <div className="flex border rounded-lg overflow-hidden">
//       <span className="px-3 py-2 text-xs bg-gray-50 border-r">
//         hulak.app/letter/
//       </span>

//       <input
//         value={envelope.customSlug}
//         onChange={(e) =>
//           set("customSlug", e.target.value.replace(/[^a-z0-9-_]/gi, ""))
//         }
//         className="flex-1 px-3 py-2 text-sm focus:outline-none"
//         placeholder="my-slug"
//       />
//     </div>
//   </div>

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LetterOutline } from "./AirMailBorder";
import EnvelopePreview from "./EnvelopeTheme";
import { useState } from "react";

const PUBLIC_SHARE_BASE_URL = "https://hulak.app/open";

type SuccessDialogProps = {
  onClose: () => void;
  slug: string;
  senderName: string;
  receiverName: string;
  occasion: string;
  customOccasionLabel: string;
  stampUrl?: string;
  stampLabel?: string;
};

export default function SuccessDialog({
  onClose,
  slug,
  senderName,
  receiverName,
  occasion,
  customOccasionLabel,
  stampUrl,
  stampLabel,
}: SuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${PUBLIC_SHARE_BASE_URL}/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: "rgba(44,44,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{
          background: "var(--paper-bg)",
          border: "1px solid color-mix(in srgb, var(--onyx) 10%, transparent)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — success green tint */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: "var(--wheat)",
            borderBottom:
              "1px solid color-mix(in srgb, var(--onyx) 8%, transparent)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <i
              className="ph-fill ph-check-circle text-xl"
              style={{ color: "#16a34a" }}
            />
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--onyx)", opacity: 0.55 }}
            >
              Letter Posted!
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition text-gray-400 hover:text-gray-600 hover:bg-black/5"
          >
            <i className="ph ph-x text-base" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {/* Envelope preview */}
          <LetterOutline
            className="w-full"
            paperClassName="w-full aspect-[2.4/1] rounded-xl overflow-hidden"
          >
            <EnvelopePreview
              senderName={senderName}
              receiverName={receiverName}
              occasion={occasion}
              customOccasionLabel={customOccasionLabel}
              stampUrl={stampUrl}
              stampLabel={stampLabel}
            />
          </LetterOutline>

          {/* Success message */}
          <div
            className="rounded-lg px-4 py-3 flex items-start gap-3"
            style={{
              background: "color-mix(in srgb, #16a34a 6%, transparent)",
              border: "1px solid color-mix(in srgb, #16a34a 18%, transparent)",
            }}
          >
            <i
              className="ph ph-envelope-open text-lg mt-0.5 flex-shrink-0"
              style={{ color: "#16a34a" }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Your letter is on its way to {receiverName || "them"}.
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Share the link below so they can open it.
              </p>
            </div>
          </div>

          {/* Share link */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <i
                className="ph ph-link text-sm"
                style={{ color: "var(--blue-energy)", opacity: 0.8 }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Share link
              </span>
            </div>

            <div
              className="flex items-stretch rounded-md border overflow-hidden"
              style={{
                background: "var(--paper-bg)",
                border:
                  "1px solid color-mix(in srgb, var(--onyx) 10%, transparent)",
              }}
            >
              <span className="pl-3 pr-1 text-xs whitespace-nowrap select-none font-mono text-gray-400 flex items-center">
                hulak.app/open/
              </span>

              <div className="flex-1 overflow-x-auto">
                <div className="whitespace-nowrap py-2.5 pr-3 text-sm font-mono text-gray-700">
                  {slug}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className={`
      flex items-center justify-center w-16 text-xs py-2.5 font-semibold transition-all flex-shrink-0 border-l
      ${
        copied
          ? "bg-green-50 text-green-600 border-green-200"
          : "text-gray-500 border-black/10 hover:text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/5"
      }
    `}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Done button */}
          <button
            onClick={onClose}
            className="
              w-full flex items-center justify-center gap-2
              py-3.5 rounded-md font-semibold text-sm
              transition-all duration-150 select-none
              bg-gradient-to-b from-[var(--blue-energy)] to-[var(--blue-energy)]/90
              text-white shadow-md hover:shadow-lg hover:-translate-y-[1px]
              active:translate-y-[1px] active:shadow-sm
            "
          >
            <i className="ph ph-check text-sm" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

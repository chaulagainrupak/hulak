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

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    const range = document.createRange();
    range.selectNodeContents(ta);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    ok ? resolve() : reject(new Error("execCommand copy failed"));
  });
}

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
    copyToClipboard(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        if (navigator.share) {
          navigator.share({ url: shareUrl }).catch(() => {});
        }
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

          <div
            className="rounded-lg px-4 py-3 flex items-start gap-3"
            style={{
              background: "color-mix(in srgb, #16a34a 6%, transparent)",
              border:
                "1px solid color-mix(in srgb, #16a34a 18%, transparent)",
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
              className="rounded-md"
              style={{
                background: "var(--paper-bg)",
                border:
                  "1px solid color-mix(in srgb, var(--onyx) 10%, transparent)",
              }}
            >
              <div className="px-3 py-2.5">
                <span
                  className="text-sm font-mono text-gray-700 break-all select-all"
                >
                  {shareUrl}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className={`
                  w-full flex items-center justify-center gap-2
                  text-xs px-3 py-2.5 font-semibold transition-all
                  rounded-b-md border-t
                  ${
                    copied
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "text-gray-500 border-black/10 hover:text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/5 active:bg-[var(--blue-energy)]/10"
                  }
                `}
              >
                <i
                  className={`ph ${copied ? "ph-check" : "ph-copy"} text-sm`}
                />
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>

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
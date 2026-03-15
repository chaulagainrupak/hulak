import { useEffect, useRef, useState } from "react";
import type Quill from "quill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import { LetterOutline } from "./AirMailBorder";
import EnvelopePreview from "./EnvelopeTheme";
import StampPicker from "./StampPicker";
import {
  FieldLabel,
  SenderEmail,
  ReceiverEmail,
  SendButton,
} from "./FieldComponents";
import {
  OCCASIONS,
  STAMPS,
  defaultEnvelope,
  inputCls,
  type EnvelopeData,
  API_URL,
  TURNSTILE_SITE_KEY,
  SHARE_BASE_URL,
} from "../utilities/constants";

declare global {
  interface Window {
    turnstile: any;
  }
}

type Props = {
  quillRef: React.MutableRefObject<Quill | null>;
  onNeedLetter: () => void;
};

export default function EnvelopePanel({ quillRef, onNeedLetter }: Props) {
  const [envelope, setEnvelope] = useState<EnvelopeData>(defaultEnvelope);
  const [showConfirm, setShowConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof EnvelopeData>(k: K, v: EnvelopeData[K]) =>
    setEnvelope((prev) => ({ ...prev, [k]: v }));

  const hasLetter = !!quillRef.current?.getText().trim();

  // Load Turnstile script once
  useEffect(() => {
    if (document.getElementById("cf-turnstile-script")) return;
    const s = document.createElement("script");
    s.id = "cf-turnstile-script";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // Render Turnstile widget when confirm dialog opens
  useEffect(() => {
    if (!showConfirm || !turnstileRef.current) return;
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: "flexible",
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          theme: "light",
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [showConfirm]);

  const handleSendClick = () => {
    if (!envelope.senderName || !envelope.receiverName) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!turnstileToken) return;
    setSending(true);
    const letterHtml = quillRef.current?.root.innerHTML ?? "";
    const slug = envelope.customSlug || Math.random().toString(36).slice(2, 8);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envelope, letterHtml, turnstileToken, slug }),
      });
    } catch (_) {}
    setSending(false);
    setShareUrl(`${SHARE_BASE_URL}/${slug}`);
    setSent(true);
  };

  const selectedStamp = STAMPS.find((s) => s.id === envelope.stampId);
  const canSend =
    !!envelope.senderName.trim() && !!envelope.receiverName.trim();
  const shareText = `I sent you a letter on हुलाक`;
  const occasionLabel =
    envelope.occasion === "Just because" && envelope.customOccasionLabel
      ? envelope.customOccasionLabel
      : envelope.occasion;

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
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
        <LetterOutline>
                  <div className="bg-white rounded-md border border-black/10 shadow-sm overflow-hidden">
          {/* FROM + TO | STAMP */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px" }}>
            <div className="divide-y divide-black/[0.05] border-r border-black/[0.05]">
              <div className="p-3 flex flex-col gap-1">
                <FieldLabel>From</FieldLabel>
                <input
                  value={envelope.senderName}
                  onChange={(e) =>
                    set("senderName", e.target.value.slice(0, 40))
                  }
                  placeholder="Your name"
                  className={inputCls}
                  maxLength={40}
                />
                <SenderEmail
                  value={envelope.senderEmail}
                  onChange={(v) => set("senderEmail", v)}
                />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <FieldLabel>To</FieldLabel>
                <input
                  value={envelope.receiverName}
                  onChange={(e) =>
                    set("receiverName", e.target.value.slice(0, 40))
                  }
                  placeholder="Their name"
                  className={inputCls}
                  maxLength={40}
                />
                <ReceiverEmail
                  value={envelope.receiverEmail}
                  onChange={(v) => set("receiverEmail", v)}
                />
              </div>
            </div>

            <div className="p-3 flex flex-col">
              <FieldLabel>Stamp</FieldLabel>
              <div className="mt-1.5 flex-1">
                <StampPicker
                  selectedStampId={envelope.stampId}
                  onSelect={(id) => set("stampId", id)}
                />
              </div>
            </div>
          </div>

          {/* ── OCCASION ── */}
          <div className="p-3 border-t border-black/[0.05]">
            <FieldLabel>Occasion</FieldLabel>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => set("occasion", o)}
                  className={`
                    px-2 py-0.5 rounded-md text-[11px] font-medium border transition
                    ${
                      envelope.occasion === o
                        ? "bg-[var(--blue-energy)] text-white border-[var(--blue-energy)]"
                        : "border-black/10 text-gray-500 hover:border-[var(--blue-energy)]/40"
                    }
                  `}
                >
                  {o}
                </button>
              ))}
            </div>
            <div
              className="overflow-hidden transition-all duration-150"
              style={{
                maxHeight:
                  envelope.occasion === "Just because" ? "48px" : "0px",
                opacity: envelope.occasion === "Just because" ? 1 : 0,
                marginTop: envelope.occasion === "Just because" ? "8px" : "0px",
              }}
            >
              <input
                value={envelope.customOccasionLabel}
                onChange={(e) =>
                  set("customOccasionLabel", e.target.value.slice(0, 30))
                }
                placeholder="Give it a name… (optional)"
                className={inputCls}
                maxLength={30}
                tabIndex={envelope.occasion === "Just because" ? 0 : -1}
              />
            </div>
          </div>

          {/* ── CHECKBOXES ── */}
          <div className="px-3 py-2 border-t border-black/[0.05] flex flex-col gap-1.5">
            {(
              [
                {
                  key: "notifyReceiver" as const,
                  label: "Notify recipient when letter is opened",
                },
                {
                  key: "joinMailingList" as const,
                  label: "Keep me posted about हुलाक",
                },
              ] as const
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => set(key, !envelope[key])}
              >
                <div
                  className={`
                  w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition
                  ${envelope[key] ? "bg-[var(--blue-energy)] border-[var(--blue-energy)]" : "border-black/20 bg-white"}
                `}
                >
                  {envelope[key] && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="w-2 h-2 text-white"
                    />
                  )}
                </div>
                <span className="text-[11px] text-gray-400">{label}</span>
              </label>
            ))}
          </div>

          <SendButton
            canSend={canSend}
            hasLetter={hasLetter}
            onSend={handleSendClick}
            onNeedLetter={onNeedLetter}
          />
        </div>
        </LetterOutline>
      </div>

      {/* ── CONFIRM DIALOG ── */}
      {showConfirm && !sent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/25 px-4 pb-4 sm:pb-0"
          onClick={() => {
            if (!sending) setShowConfirm(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {!sending ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    Ready to send?
                  </h3>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
                  >
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="w-3.5 h-3.5 text-gray-400"
                    />
                  </button>
                </div>

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

                <div className="bg-[var(--paper-bg)] rounded-xl p-3 text-xs flex flex-col gap-1.5 border border-black/5">
                  {[
                    { label: "From", value: envelope.senderName },
                    { label: "To", value: envelope.receiverName },
                    { label: "Occasion", value: occasionLabel },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center gap-4 min-w-0"
                    >
                      <span className="text-gray-400 flex-shrink-0">
                        {label}
                      </span>
                      <span
                        className="text-gray-700 font-medium text-right truncate"
                        style={{ maxWidth: "65%" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Custom slug + Turnstile */}
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-baseline gap-1 mb-1.5">
                      <FieldLabel>Custom link</FieldLabel>
                      <span className="text-[9px] text-gray-300 font-normal italic normal-case tracking-normal">
                        optional
                      </span>
                    </div>
                    <div className="flex items-center border border-black/10 rounded-md overflow-hidden bg-[var(--paper-bg)] focus-within:ring-2 focus-within:ring-[var(--blue-energy)]/20 transition">
                      <span className="px-2.5 py-1.5 text-[14px] text-gray-600 bg-black/[0.025] border-r border-black/[0.07] whitespace-nowrap select-none">
                        hulak.app/letter/
                      </span>
                      <input
                        value={envelope.customSlug}
                        onChange={(e) =>
                          set(
                            "customSlug",
                            e.target.value
                              .replace(/[^a-z0-9-_]/gi, "")
                              .slice(0, 40),
                          )
                        }
                        placeholder="my-slug"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-transparent focus:outline-none"
                        maxLength={40}
                      />
                    </div>
                    <p className="text-[9px] text-gray-300 mt-1 leading-snug">
                      Leave blank for a random link.
                    </p>
                  </div>
                  <div className="" ref={turnstileRef} />
                </div>

                <button
                  onClick={handleConfirmSend}
                  disabled={!turnstileToken}
                  className={`
                    flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition
                    ${
                      turnstileToken
                        ? "bg-[var(--blue-energy)] text-white hover:brightness-110 shadow-sm active:scale-[0.98]"
                        : "bg-black/[0.04] text-gray-300 cursor-not-allowed"
                    }
                  `}
                >
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="w-3.5 h-3.5"
                  />
                  Confirm & Send
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="text-4xl animate-bounce">✉️</div>
                <p className="text-gray-500 text-sm">Sending your letter…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {sent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4 text-center">
            <div className="flex justify-end -mb-2">
              <button
                onClick={() => {
                  setSent(false);
                  setShowConfirm(false);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="w-3.5 h-3.5 text-gray-400"
                />
              </button>
            </div>
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="font-semibold text-gray-800">Letter sent!</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Share this with {envelope.receiverName}
              </p>
            </div>
            <div
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="bg-[var(--paper-bg)] rounded-xl px-4 py-3 text-sm text-[var(--blue-energy)] font-mono border border-black/5 break-all cursor-pointer hover:bg-[var(--blue-energy)]/5 transition"
              title="Click to copy"
            >
              {shareUrl}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="flex-1 py-2.5 rounded-xl border border-black/10 text-xs text-gray-600 hover:bg-gray-50 transition"
                >
                  Copy
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText}: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-medium hover:brightness-110 transition text-center"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-medium text-center"
                >
                  𝕏
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    window.open("https://instagram.com", "_blank");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-medium transition"
                  style={{
                    background:
                      "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                  }}
                >
                  Instagram
                </button>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#229ED9] text-white text-xs font-medium text-center"
                >
                  Telegram
                </a>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
                  }
                  className="flex-1 py-2.5 rounded-xl bg-[#5865F2] text-white text-xs font-medium"
                >
                  Discord
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

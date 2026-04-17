import type Quill from "quill";
import { LetterOutline } from "./AirMailBorder";
import EnvelopePreview from "./EnvelopeTheme";
import { useEffect, useState } from "react";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_URL, TURNSTILE_SITE_KEY } from "../utilities/constants";

const PUBLIC_SHARE_BASE_URL = "https://hulak.app/open";
const SLUG_MAX = 32;

const sendingMessages = [
  "Sending…",
  "Really sending…",
  "Holding tight…",
  "Brewing carrier pigeons…",
  "Convincing servers to behave…",
  "Talking to the API…",
  "Negotiating with latency…",
  "Uploading emotional damage…",
  "Faxing it to 1998…",
  "Mailman is on the way…",
  "Still thinking about it…",
  "Please don’t close this tab…",
  "Making sure it exists…",
  "Asking DNS nicely…",
  "Assembling packets…",
  "Wrapping feelings into JSON…",
  "Charging internet crystals…",
  "Reticulating splines…",
  "Probably fine…",
  "Definitely maybe sending…",
  "Almost there…",
  "This is taking longer than expected…",
  "Server is shy…",
  "Deploying emotional payload…",
  "Sending vibes first…",
  "Bribing the backend…",
  "Waking up the database…",
  "Convincing CORS to cooperate…",
  "Aligning pixels and destiny…",
  "Polishing HTTP request…",
  "Tuning cosmic routers…",
  "Asking the cloud for permission…",
  "Unpacking existential packets…",
  "Routing through emotional CDN…",
  "Checking if reality is online…",
  "Making sure bits didn’t get lost…",
  "Rechecking everything twice…",
  "Applying final coat of bytes…",
  "Still loading… emotionally too…",
  "Almost there, seriously this time…",
  "If this fails, blame latency…",
  "We are so back…",
  "We were never back, but trying…",

  "✉️ Drafting envelope…",
  "📨 Folding paper into digital form…",
  "🖋️ Writing address carefully…",
  "📬 Sticking stamps…",
  "💌 Sealing envelope with hope…",
  "📮 Dropping letter into mailbox…",
  "🚚 Handing off to postal service…",
  "🐦 Summoning carrier pigeons…",
  "🐦 Pigeon #42 is on duty…",
  "🐦 Training pigeons for better uptime…",
  "🌧️ Waiting for weather clearance…",
  "🛰️ Syncing with orbital mail relay…",
  "📡 Broadcasting letter into void…",
  "🧾 Printing emotional receipt…",
  "🧠 Encoding feelings into packets…",
  "🧵 Stitching envelope edges…",
  "🪶 Feathering pigeon flight path…",
  "🧭 Calibrating delivery direction…",
  "🛤️ Routing through postal rails…",
  "🏤 Visiting local post office…",
  "🧳 Packing letter for travel…",
  "🛫 Preparing for takeoff…",
  "✈️ In transit through cloud layers…",
  "🌍 Crossing digital borders…",
  "⏳ Delivery ETA recalculating…",
  "📦 Boxing emotions securely…",
  "🔐 Locking envelope contents…",
  "🧿 Adding protective charm…",
  "🧹 Cleaning up trailing commas…",
  "🧃 Hydrating pigeons…",
  "🧾 Filing paperwork in bureaucracy…",
  "🏁 Finalizing delivery route…",
  "💨 Speeding through fiber optics…",
  "🪐 Delivering across space-time…",
];

type ConfirmDialogProps = {
  onClose: () => void;
  onConfirm: (slug: string) => void;
  quillRef: React.RefObject<Quill | null>;
  senderName: string;
  senderEmail?: string;
  receiverName: string;
  receiverEmail?: string;
  occasion: string;
  customOccasionLabel: string;
  stampUrl?: string;
  stampLabel?: string;
  notifyReceiver?: boolean;
  joinMailingList?: boolean;
};

export default function ConfirmDialog({
  onClose,
  onConfirm,
  quillRef,
  senderName,
  senderEmail,
  receiverName,
  receiverEmail,
  occasion,
  customOccasionLabel,
  stampUrl,
  stampLabel,
  notifyReceiver,
  joinMailingList,
}: ConfirmDialogProps) {
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [sendText, setSendText] = useState(sendingMessages[0]);

  const slugError = slug && slug.length < 3 ? "Too short — min 3 chars" : "";
  const shareUrl = slug ? `${PUBLIC_SHARE_BASE_URL}/${slug}` : null;

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, SLUG_MAX);
    setSlug(clean);
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConfirm = async () => {
    if (slugError) return;
    if (!quillRef.current) return;

    const delta = quillRef.current.getContents();

    const body = {
      slug: slug || null,
      content: delta,
      sender_name: senderName,
      sender_email: senderEmail || null,
      receiver_name: receiverName,
      receiver_email: receiverEmail || null,
      occasion,
      custom_occasion_label: customOccasionLabel,
      stamp_url: stampUrl ?? null,
      stamp_label: stampLabel ?? null,
      notify_receiver: notifyReceiver ?? false,
      join_mailing_list: joinMailingList ?? false,
      turnstileToken,
    };

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }

      const data = await res.json();
      const returnedSlug: string = data.slug;
      onConfirm(returnedSlug);
    } catch {
      setError(
        "Couldn't post your message. Report this to the webmaster or try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // @ts-ignore
    turnstile.render("#widget-container", {
      sitekey: TURNSTILE_SITE_KEY,
      size: "flexible",
      callback: (token: string) => {
        setTurnstileToken(token);
        setDisabled(false);
      },
    });
  }, []);

  useEffect(() => {
  if (!loading) return;

  let lastIndex = -1;

  const interval = setInterval(() => {
    let randomIndex = Math.floor(Math.random() * sendingMessages.length);

    while (randomIndex === lastIndex && sendingMessages.length > 1) {
      randomIndex = Math.floor(Math.random() * sendingMessages.length);
    }

    lastIndex = randomIndex;
    setSendText(sendingMessages[randomIndex]);
  }, 2000);

  return () => clearInterval(interval);
}, [loading]);

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
              className="ph ph-paper-plane-tilt text-xl"
              style={{ color: "var(--blue-energy)" }}
            />
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--onyx)", opacity: 0.55 }}
            >
              Confirm & Post
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition text-gray-400 hover:text-gray-600 hover:bg-black/5 disabled:opacity-40"
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

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <i
                  className="ph ph-link text-sm"
                  style={{ color: "var(--blue-energy)", opacity: 0.8 }}
                />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Share link
                </span>
                <span className="text-xs italic normal-case tracking-normal font-normal text-gray-300">
                  — optional
                </span>
              </div>
              {slug && (
                <span className="text-xs tabular-nums text-gray-300">
                  {slug.length}/{SLUG_MAX}
                </span>
              )}
            </div>

            <div className="flex items-center rounded-md border overflow-hidden transition bg-[var(--paper-bg)] border-black/10">
              <span className="pl-3 pr-0.5 text-xs whitespace-nowrap select-none font-mono text-gray-400">
                hulak.app/open/
              </span>
              <input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="leave blank to auto-generate"
                spellCheck={false}
                maxLength={SLUG_MAX}
                disabled={loading}
                className="flex-1 py-2.5 pr-3 text-sm font-mono bg-transparent outline-none min-w-0 text-gray-700 placeholder:text-gray-300 disabled:opacity-50"
              />
            </div>

            {slugError ? (
              <div className="flex items-center gap-1.5">
                <i
                  className="ph ph-warning text-sm"
                  style={{ color: "var(--red-stamp)" }}
                />
                <p className="text-xs" style={{ color: "var(--red-stamp)" }}>
                  {slugError}
                </p>
              </div>
            ) : shareUrl ? (
              <div className="flex items-center gap-2">
                <p className="text-xs truncate flex-1 font-mono text-gray-400">
                  {shareUrl}
                </p>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-all flex-shrink-0 ${
                    copied
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "border border-black/10 text-gray-400 hover:text-[var(--blue-energy)] hover:border-[var(--blue-energy)]/30"
                  }`}
                >
                  <i
                    className={`ph ${copied ? "ph-check" : "ph-copy"} text-sm`}
                  />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <i className="ph ph-sparkle text-sm text-gray-300" />
                <p className="text-xs text-gray-400">
                  A link will be generated automatically.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-red-50 border border-red-200">
              <i
                className="ph ph-warning-circle text-sm flex-shrink-0"
                style={{ color: "var(--red-stamp)" }}
              />
              <p className="text-xs" style={{ color: "var(--red-stamp)" }}>
                {error}
              </p>
            </div>
          )}

          <div id="widget-container"></div>

          <div className="flex gap-2.5 pt-1">
            {!loading ? (
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-md font-semibold text-sm transition-all border border-gray-200 hover:bg-amber-100 disabled:opacity-40"
              >
                <i className="ph ph-x text-sm" />
                Cancel
              </button>
            ) : null}
            <button
              onClick={handleConfirm}
              disabled={!!slugError || loading || disabled}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-md font-semibold text-sm transition-all ${
                !slugError && !loading && !disabled
                  ? "bg-gradient-to-b from-[var(--blue-energy)] to-[var(--blue-energy)]/90 text-white shadow-md hover:shadow-lg"
                  : "bg-red-50 text-red-300 border border-red-200 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-3.5 h-3.5 animate-spin"
                  />
                  {sendText}
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="w-3.5 h-3.5"
                  />
                  Post Letter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import type Quill from "quill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
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
} from "../utilities/constants";
import ConfirmDialog from "./ConfirmDialog";
import SuccessDialog from "./SuccessDialog";

type Props = {
  quillRef: React.RefObject<Quill | null>;
  onNeedLetter: () => void;
};

export default function EnvelopePanel({ quillRef, onNeedLetter }: Props) {
  const [envelope, setEnvelope] = useState<EnvelopeData>(defaultEnvelope);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successfulPost, setSuccessfulPost] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const set = <K extends keyof EnvelopeData>(k: K, v: EnvelopeData[K]) =>
    setEnvelope((prev) => ({ ...prev, [k]: v }));

  const hasLetter = !!quillRef.current?.getText().trim();
  const canSend = !!envelope.senderName.trim() && !!envelope.receiverName.trim();
  const selectedStamp = STAMPS.find((s) => s.id === envelope.stampId);

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

        <LetterOutline>
          <div className="bg-white rounded-md border border-black/10 shadow-sm overflow-hidden">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px" }}>
              <div className="divide-y divide-black/[0.05] border-r border-black/[0.05]">
                <div className="p-2 flex flex-col gap-1">
                  <FieldLabel>From</FieldLabel>
                  <input
                    value={envelope.senderName}
                    onChange={(e) => set("senderName", e.target.value.slice(0, 40))}
                    placeholder="Your name"
                    className={inputCls}
                    maxLength={40}
                  />
                  <SenderEmail
                    value={envelope.senderEmail}
                    onChange={(v) => set("senderEmail", v)}
                  />
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <FieldLabel>To</FieldLabel>
                  <input
                    value={envelope.receiverName}
                    onChange={(e) => set("receiverName", e.target.value.slice(0, 40))}
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

            <div className="p-2 border-t border-black/[0.05]">
              <FieldLabel>Occasion</FieldLabel>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => set("occasion", o)}
                    className={`
                      px-2 py-0.5 rounded-md text-[11px] font-medium border transition
                      ${envelope.occasion === o
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
                  maxHeight: envelope.occasion === "Just because" ? "48px" : "0px",
                  opacity: envelope.occasion === "Just because" ? 1 : 0,
                  marginTop: envelope.occasion === "Just because" ? "8px" : "0px",
                }}
              >
                <input
                  value={envelope.customOccasionLabel}
                  onChange={(e) => set("customOccasionLabel", e.target.value.slice(0, 30))}
                  placeholder="Give it a name… (optional)"
                  className={inputCls}
                  maxLength={30}
                  tabIndex={envelope.occasion === "Just because" ? 0 : -1}
                />
              </div>
            </div>

            <div className="px-3 py-2 border-t border-black/[0.05] flex flex-col gap-1.5">
              {(
                [
                  { key: "notifyReceiver" as const, label: "Notify recipient when letter is opened" },
                  { key: "joinMailingList" as const, label: "Keep me posted about हुलाक" },
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
                      ${envelope[key]
                        ? "bg-[var(--blue-energy)] border-[var(--blue-energy)]"
                        : "border-black/20 bg-white"
                      }
                    `}
                  >
                    {envelope[key] && (
                      <FontAwesomeIcon icon={faCheck} className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">{label}</span>
                </label>
              ))}
            </div>

            <SendButton
              canSend={canSend}
              hasLetter={hasLetter}
              onSend={() => setShowConfirm(true)}
              onNeedLetter={onNeedLetter}
            />
          </div>
        </LetterOutline>
      </div>

      {showConfirm && (
        <ConfirmDialog
          onClose={() => setShowConfirm(false)}
          onConfirm={(slug: string) => {
            setShowConfirm(false);
            setSuccessfulPost(true);
            setShareUrl(slug);
          }}
          quillRef={quillRef}
          senderName={envelope.senderName}
          senderEmail={envelope.senderEmail}
          receiverName={envelope.receiverName}
          receiverEmail={envelope.receiverEmail}
          occasion={envelope.occasion}
          customOccasionLabel={envelope.customOccasionLabel}
          stampUrl={selectedStamp?.url}
          stampLabel={selectedStamp?.label}
          notifyReceiver={envelope.notifyReceiver}
          joinMailingList={envelope.joinMailingList}
        />
      )}

      {successfulPost && (
        <SuccessDialog
          onClose={() => setSuccessfulPost(false)}
          slug={shareUrl}
          senderName={envelope.senderName}
          receiverName={envelope.receiverName}
          occasion={envelope.occasion}
          customOccasionLabel={envelope.customOccasionLabel}
          stampUrl={selectedStamp?.url}
        />
      )}
    </>
  );
}
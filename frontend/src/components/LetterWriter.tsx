import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { LetterOutline } from "./AirMailBorder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib, faEnvelope, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import EnvelopePanel from "./EnvelopePanel";

const Font = Quill.import("formats/font");
// @ts-ignore
Font.whitelist = ["crimson", "baskerville", "playfair", "caveat", "patrick", "inter", "garamond", "spectral"];
// @ts-ignore
Quill.register(Font, true);

export default function LetterWriter() {
  const [activeTab, setActiveTab] = useState<"write" | "envelope">("write");
  const [hasLetter, setHasLetter] = useState(false);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const q = new Quill("#editor", {
      theme: "snow",
      modules: { toolbar: "#toolbar" },
      placeholder: "Start writing here...",
    });
    quillRef.current = q;

    // Track whether there's content so the tab bar can reflect it
    q.on("text-change", () => {
      setHasLetter(!!q.getText().trim());
    });
  }, []);

  return (
    <div className="flex flex-col">

      <div className="lg:hidden sticky top-0 z-10 bg-[var(--wheat)] border-b border-black/10">
        <div className="flex items-center px-3 py-2 gap-2">

          {/* Write tab */}
          <button
            onClick={() => setActiveTab("write")}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === "write"
                ? "bg-[var(--blue-energy)] text-white shadow-sm"
                : "text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/10"
              }
            `}
          >
            <FontAwesomeIcon icon={faPenNib} className="w-3 h-3" />
            Write
          </button>

          {/* Envelope tab */}
          <button
            onClick={() => setActiveTab("envelope")}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === "envelope"
                ? "bg-[var(--blue-energy)] text-white shadow-sm"
                : "text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/10"
              }
            `}
          >
            <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
            Envelope
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {activeTab === "write" ? (
            <button
              onClick={() => setActiveTab("envelope")}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${hasLetter
                  ? "bg-[var(--blue-energy)]/10 text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/20"
                  : "text-gray-300 cursor-default"
                }
              `}
              disabled={!hasLetter}
            >
              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
              {hasLetter ? "Next →" : "Write first"}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 pr-1">
              <FontAwesomeIcon icon={faPaperPlane} className="w-2.5 h-2.5" />
              <span>Send below</span>
            </div>
          )}

        </div>

        {/* Progress bar — fills as user writes */}
        <div className="h-[2px] bg-black/5">
          <div
            className="h-full bg-[var(--blue-energy)] transition-all duration-500"
            style={{ width: hasLetter ? "50%" : "0%" }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 p-2">

        {/* LEFT — WRITER */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className={activeTab !== "write" ? "hidden lg:block h-full" : "block h-full"}>
            <LetterOutline
              className="h-full"
              paperClassName="h-full flex flex-col p-5 lg:p-6 bg-[var(--wheat)] rounded-xl shadow-lg"
            >
              <div id="toolbar" className="flex flex-wrap items-end gap-3 pb-3 border-b border-t border-black/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">Font</span>
                  <select className="ql-font" defaultValue="crimson">
                    <option value="crimson">Crimson</option>
                    <option value="baskerville">Baskerville</option>
                    <option value="playfair">Playfair</option>
                    <option value="caveat">Caveat</option>
                    <option value="patrick">Patrick Hand</option>
                    <option value="inter">Inter</option>
                    <option value="garamond">Garamond</option>
                    <option value="spectral">Spectral</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">Size</span>
                  <select className="ql-size">
                    <option value="small">Small</option>
                    <option selected>Normal</option>
                    <option value="large">Large</option>
                    <option value="huge">Huge</option>
                  </select>
                </div>
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
                <button className="ql-script" value="super" />
                <button className="ql-script" value="sub" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">Heading</span>
                  <select className="ql-header">
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option selected>Normal</option>
                  </select>
                </div>
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
                <select className="ql-align" />
                <button className="ql-link" />
                <button className="ql-clean" />
              </div>
              <div id="editor" className="flex-1 pt-4 min-h-[60vh] lg:min-h-0 overflow-y-scroll" />
            </LetterOutline>
          </div>
        </div>

        {/* RIGHT — ENVELOPE */}
        <div className={`w-full lg:w-1/2 flex justify-center ${activeTab !== "envelope" ? "hidden lg:flex" : "flex"}`}>
          <EnvelopePanel
            quillRef={quillRef}
            onNeedLetter={() => setActiveTab("write")}
          />
        </div>

      </div>
    </div>
  );
}
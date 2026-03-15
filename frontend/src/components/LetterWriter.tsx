import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { LetterOutline } from "./AirMailBorder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import EnvelopePanel from "./EnvelopePanel";

const Font = Quill.import("formats/font");
// @ts-ignore
Font.whitelist = [
  "crimson",
  "baskerville",
  "playfair",
  "caveat",
  "patrick",
  "inter",
  "garamond",
  "spectral",
];
// @ts-ignore
Quill.register(Font, true);

export default function LetterWriter() {
  const [activeTab, setActiveTab] = useState<"write" | "envelope">("write");

  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    quillRef.current = new Quill("#editor", {
      theme: "snow",
      modules: { toolbar: "#toolbar" },
      placeholder: "Start writing here...",
    });
  }, []);

  const tabs = [
    { id: "write", icon: faPenNib, label: "Write" },
    { id: "envelope", icon: faEnvelope, label: "Envelope" },
  ] as const;

  return (
    <div className="flex flex-col">
      {/* MOBILE-ONLY tab bar */}
      <div className="lg:hidden flex justify-around gap-2 px-4 py-2 sticky top-0 z-10 bg-[var(--wheat)] border-b border-black/10">
        {tabs.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-lg font-medium transition-all
              ${
                activeTab === id
                  ? "bg-[var(--blue-energy)] text-white shadow-sm"
                  : "text-[var(--blue-energy)] hover:bg-[var(--blue-energy)]/10"
              }`}
          >
            <FontAwesomeIcon icon={icon} className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 p-4 lg:p-6">
        {/* LEFT — WRITER */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div
            className={
              activeTab !== "write" ? "hidden lg:block h-full" : "block h-full"
            }
          >
            <LetterOutline
              className="h-full"
              paperClassName="h-full flex flex-col p-5 lg:p-6 bg-[var(--wheat)] rounded-xl shadow-lg"
            >
              <div
                id="toolbar"
                className="flex flex-wrap items-end gap-3 pb-3 border-b border-t border-black/10"
              >
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

              <div
                id="editor"
                className="flex-1 pt-4 min-h-[60vh] lg:min-h-0 overflow-y-scroll"
              />
            </LetterOutline>
          </div>
        </div>

        {/* RIGHT — ENVELOPE */}
        <div
          className={`w-full lg:w-1/2 flex justify-center ${activeTab !== "envelope" ? "hidden lg:flex" : "flex"}`}
        >
          <EnvelopePanel
            quillRef={quillRef}
            onNeedLetter={() => setActiveTab("write")}
          />
          {/* <div className="p-2 sm:p-4 w-full">
            <LetterOutline
              className="w-full"
              paperClassName="w-full aspect-[2.4/1] rounded-xl overflow-hidden"
            >
              <div className="relative w-full h-full bg-[var(--paper-bg)]">
                <div className="h-full grid grid-cols-[3fr_1fr] p-3 sm:p-6">
                  <div className="border-r border-black/20" >Still building </div>

                  <div className="flex justify-center items-start pt-3" />
                </div>
                <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="px-2 py-[2px] text-[10px] sm:text-xs tracking-widest bg-[var(--paper-bg)] text-gray-600 uppercase">
                    asdas
                  </div>
                </div>
              </div>
            </LetterOutline>
          </div> */}
        </div>
      </div>
    </div>
  );
}

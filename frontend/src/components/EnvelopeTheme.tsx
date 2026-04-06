// @ts-nocheck
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart, faLock, faKey, faMoon, faEye, faStar, faGift, faBolt,
  faLeaf, faSeedling, faTrophy, faMedal, faDove, faCloud,
  faCakeCandles, faWandMagicSparkles, faChampagneGlasses,
  faFeatherPointed, faPaperPlane, faPenNib, faEnvelope,
  faSpa, faCertificate,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as faStarReg,
  faHeart as faHeartReg,
  faCircle as faCircleReg,
} from "@fortawesome/free-regular-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";


type DecoIcon = {
  icon: IconDefinition;
  top?: string; bottom?: string; left?: string; right?: string;
  rotate: number;
  size: number;    // fraction of container width
  opacity: number;
};

type ThemeConfig = {
  bg: string;
  border: string;
  // recipient name
  toColor: string;
  toFont: string;
  // sender name
  fromColor: string;
  fromFont: string;
  // micro labels ("to", "from")
  labelColor: string;
  labelFont: string;
  // occasion pill
  tagColor: string;
  tagBorder: string;
  tagBg: string;
  tagFont: string;
  // postmark
  postmarkColor: string;
  // layout
  layout: "bottom-left" | "center-left" | "top-left";
  bgIcon: IconDefinition;
  bgIconColor: string;
  decos: DecoIcon[];
  rightAccent?: string;
  stampPosition?: "top" | "center" | "bottom";
};

// ─── THEMES ───────────────────────────────────────────────────────────────────

export const OCCASION_THEMES: Record<string, ThemeConfig> = {
  "Just because": {
    bg: "#FFFDF7",
    border: "rgba(0,0,0,0.08)",
    toColor: "#1a1608",
    toFont: "'Playfair Display', Georgia, serif",
    fromColor: "#6b5e3a",
    fromFont: "'EB Garamond', Georgia, serif",
    labelColor: "#9c8a60",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#4a4520",
    tagBorder: "rgba(102,96,48,0.35)",
    tagBg: "rgba(255,248,210,0.85)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#6b7280",
    layout: "bottom-left",
    bgIcon: faFeatherPointed,
    bgIconColor: "#c8b87a",
    decos: [
      { icon: faStarReg,        top:"12%", right:"36%", rotate:-12, size:0.038, opacity:0.18 },
      { icon: faFeatherPointed, bottom:"20%",right:"40%",rotate:20, size:0.042, opacity:0.15 },
      { icon: faStarReg,        top:"52%", right:"28%", rotate:5,  size:0.030, opacity:0.13 },
      { icon: faCircleReg,      top:"22%", right:"22%", rotate:0,  size:0.025, opacity:0.10 },
    ],
  },

  "Love letter": {
    bg: "#FFF5F5",
    border: "rgba(220,60,60,0.15)",
    toColor: "#5a0a0a",
    toFont: "'Playfair Display', Georgia, serif",
    fromColor: "#c0392b",
    fromFont: "'Crimson Pro', Georgia, serif",
    labelColor: "#e07070",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#7a0a0a",
    tagBorder: "rgba(192,57,43,0.4)",
    tagBg: "rgba(255,220,220,0.85)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#F45D52",
    layout: "center-left",
    bgIcon: faHeart,
    bgIconColor: "#f4a0a0",
    rightAccent: "rgba(244,93,82,0.35)",
    stampPosition: "bottom",
    decos: [
      { icon: faHeart,    top:"10%", right:"38%", rotate:-8,  size:0.048, opacity:0.20 },
      { icon: faHeartReg, top:"48%", right:"44%", rotate:15,  size:0.036, opacity:0.16 },
      { icon: faHeart,    bottom:"14%",right:"34%",rotate:5,  size:0.033, opacity:0.14 },
      { icon: faHeartReg, top:"28%", right:"20%", rotate:-15, size:0.030, opacity:0.12 },
    ],
  },

  Confession: {
    bg: "#F8F5FF",
    border: "rgba(100,80,200,0.2)",
    toColor: "#1a0f40",
    toFont: "'Libre Baskerville', Georgia, serif",
    fromColor: "#534AB7",
    fromFont: "'Spectral', Georgia, serif",
    labelColor: "#8878cc",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#2d1f70",
    tagBorder: "rgba(82,56,170,0.4)",
    tagBg: "rgba(220,210,255,0.85)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#666CA3",
    layout: "bottom-left",
    bgIcon: faLock,
    bgIconColor: "#9080e0",
    decos: [
      { icon: faLock, top:"10%", right:"38%", rotate:-5, size:0.039, opacity:0.16 },
      { icon: faMoon, top:"45%", right:"42%", rotate:12, size:0.039, opacity:0.14 },
      { icon: faKey,  bottom:"18%",right:"36%",rotate:30,size:0.042, opacity:0.14 },
      { icon: faEye,  top:"24%", right:"22%", rotate:0,  size:0.033, opacity:0.12 },
    ],
  },

  Surprise: {
    bg: "#FFFBF0",
    border: "rgba(210,140,0,0.22)",
    toColor: "#2a1800",
    toFont: "'Playfair Display', Georgia, serif",
    fromColor: "#92400e",
    fromFont: "'EB Garamond', Georgia, serif",
    labelColor: "#c07820",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#3d1f00",
    tagBorder: "rgba(180,100,0,0.35)",
    tagBg: "rgba(255,235,160,0.88)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#d97706",
    layout: "top-left",
    bgIcon: faStar,
    bgIconColor: "#f5c842",
    rightAccent: "rgba(217,119,6,0.25)",
    stampPosition: "center",
    decos: [
      { icon: faStar,    top:"8%",  right:"42%", rotate:15,  size:0.045, opacity:0.18 },
      { icon: faBolt,    top:"42%", right:"36%", rotate:-10, size:0.039, opacity:0.15 },
      { icon: faGift,    bottom:"14%",right:"40%",rotate:-5, size:0.042, opacity:0.15 },
      { icon: faStarReg, top:"22%", right:"22%", rotate:35,  size:0.030, opacity:0.12 },
    ],
  },

  "Miss you": {
    bg: "#F5F0FF",
    border: "rgba(110,60,220,0.15)",
    toColor: "#1e0845",
    toFont: "'Playfair Display', Georgia, serif",
    fromColor: "#6d28d9",
    fromFont: "'Crimson Pro', Georgia, serif",
    labelColor: "#9d7de8",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#2e0f6a",
    tagBorder: "rgba(109,40,217,0.35)",
    tagBg: "rgba(220,205,255,0.85)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#7c3aed",
    layout: "center-left",
    bgIcon: faPaperPlane,
    bgIconColor: "#b09af0",
    rightAccent: "rgba(124,58,237,0.22)",
    decos: [
      { icon: faPaperPlane, top:"10%", right:"40%", rotate:-15, size:0.042, opacity:0.17 },
      { icon: faCloud,      top:"46%", right:"44%", rotate:5,   size:0.039, opacity:0.14 },
      { icon: faPaperPlane, bottom:"16%",right:"36%",rotate:20, size:0.033, opacity:0.13 },
      { icon: faStarReg,    top:"26%", right:"20%", rotate:-5,  size:0.030, opacity:0.11 },
    ],
  },

  "Thank you": {
    bg: "#F0FDF4",
    border: "rgba(20,160,80,0.18)",
    toColor: "#052e16",
    toFont: "'Libre Baskerville', Georgia, serif",
    fromColor: "#065f46",
    fromFont: "'EB Garamond', Georgia, serif",
    labelColor: "#34a86a",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#022c16",
    tagBorder: "rgba(5,120,64,0.38)",
    tagBg: "rgba(200,248,225,0.85)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#059669",
    layout: "bottom-left",
    bgIcon: faDove,
    bgIconColor: "#6ee7b7",
    rightAccent: "rgba(5,150,105,0.2)",
    stampPosition: "bottom",
    decos: [
      { icon: faLeaf,     top:"10%", right:"40%", rotate:-15, size:0.042, opacity:0.17 },
      { icon: faSeedling, top:"46%", right:"36%", rotate:10,  size:0.039, opacity:0.15 },
      { icon: faDove,     bottom:"16%",right:"42%",rotate:-5, size:0.042, opacity:0.14 },
      { icon: faLeaf,     top:"24%", right:"22%", rotate:25,  size:0.030, opacity:0.12 },
    ],
  },

  "Happy birthday": {
    bg: "#FFF0F8",
    border: "rgba(220,40,140,0.18)",
    toColor: "#3d0024",
    toFont: "'Playfair Display', Georgia, serif",
    fromColor: "#9d174d",
    fromFont: "'Crimson Pro', Georgia, serif",
    labelColor: "#e060a8",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#3d0024",
    tagBorder: "rgba(180,20,100,0.38)",
    tagBg: "rgba(255,210,238,0.88)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#db2777",
    layout: "top-left",
    bgIcon: faCakeCandles,
    bgIconColor: "#f9a8d4",
    rightAccent: "rgba(219,39,119,0.3)",
    decos: [
      { icon: faStar,             top:"8%",  right:"44%", rotate:15,  size:0.045, opacity:0.19 },
      { icon: faChampagneGlasses, top:"44%", right:"38%", rotate:-8,  size:0.045, opacity:0.16 },
      { icon: faCertificate,      bottom:"14%",right:"42%",rotate:5,  size:0.042, opacity:0.15 },
      { icon: faWandMagicSparkles,top:"24%", right:"22%", rotate:20,  size:0.036, opacity:0.14 },
    ],
  },

  Congratulations: {
    bg: "#FEFCE8",
    border: "rgba(180,130,0,0.22)",
    toColor: "#1c1000",
    toFont: "'Libre Baskerville', Georgia, serif",
    fromColor: "#78350f",
    fromFont: "'EB Garamond', Georgia, serif",
    labelColor: "#c08820",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#1c1000",
    tagBorder: "rgba(160,110,0,0.38)",
    tagBg: "rgba(255,240,160,0.88)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#ca8a04",
    layout: "center-left",
    bgIcon: faTrophy,
    bgIconColor: "#fde68a",
    rightAccent: "rgba(202,138,4,0.28)",
    stampPosition: "center",
    decos: [
      { icon: faChampagneGlasses, top:"10%", right:"42%", rotate:-5,  size:0.048, opacity:0.18 },
      { icon: faMedal,            top:"46%", right:"36%", rotate:10,  size:0.042, opacity:0.15 },
      { icon: faStar,             bottom:"14%",right:"40%",rotate:-18,size:0.039, opacity:0.14 },
      { icon: faWandMagicSparkles,top:"26%", right:"20%", rotate:20,  size:0.036, opacity:0.13 },
    ],
  },

  Apology: {
    bg: "#F8FAFC",
    border: "rgba(80,100,130,0.15)",
    toColor: "#0f172a",
    toFont: "'Libre Baskerville', Georgia, serif",
    fromColor: "#334155",
    fromFont: "'Crimson Pro', Georgia, serif",
    labelColor: "#7a90aa",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#0f172a",
    tagBorder: "rgba(60,80,110,0.3)",
    tagBg: "rgba(210,220,240,0.82)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#475569",
    layout: "bottom-left",
    bgIcon: faDove,
    bgIconColor: "#94a3b8",
    decos: [
      { icon: faDove,      top:"10%", right:"40%", rotate:-5, size:0.042, opacity:0.15 },
      { icon: faCircleReg, top:"48%", right:"42%", rotate:0,  size:0.033, opacity:0.12 },
      { icon: faDove,      bottom:"18%",right:"38%",rotate:8, size:0.036, opacity:0.12 },
      { icon: faCircleReg, top:"28%", right:"22%", rotate:0,  size:0.025, opacity:0.09 },
    ],
  },

  "Good luck": {
    bg: "#F0FDFA",
    border: "rgba(10,160,140,0.18)",
    toColor: "#022c22",
    toFont: "'Playfair Display', Georgia, serif",
    fromColor: "#134e4a",
    fromFont: "'EB Garamond', Georgia, serif",
    labelColor: "#2aa88a",
    labelFont: "'Spectral', Georgia, serif",
    tagColor: "#022c22",
    tagBorder: "rgba(10,140,120,0.38)",
    tagBg: "rgba(190,248,235,0.85)",
    tagFont: "'Spectral', Georgia, serif",
    postmarkColor: "#0d9488",
    layout: "top-left",
    bgIcon: faSpa,
    bgIconColor: "#5eead4",
    rightAccent: "rgba(13,148,136,0.2)",
    stampPosition: "bottom",
    decos: [
      { icon: faSpa,     top:"10%", right:"40%", rotate:-10, size:0.042, opacity:0.17 },
      { icon: faStarReg, top:"46%", right:"36%", rotate:15,  size:0.036, opacity:0.14 },
      { icon: faSpa,     bottom:"16%",right:"44%",rotate:20, size:0.033, opacity:0.13 },
      { icon: faStar,    top:"26%", right:"20%", rotate:-5,  size:0.030, opacity:0.12 },
    ],
  },
};


type EnvelopePreviewProps = {
  senderName: string;
  receiverName: string;
  occasion: string;
  customOccasionLabel: string;
  stampUrl?: string;
  stampLabel?: string;
};

export default function EnvelopePreview({
  senderName, receiverName, occasion, customOccasionLabel, stampUrl, stampLabel,
}: EnvelopePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const theme = OCCASION_THEMES[occasion] ?? OCCASION_THEMES["Just because"];

  const displayOccasion =
    occasion === "Just because" && customOccasionLabel ? customOccasionLabel : occasion;

  const displayReceiver = receiverName || "Jane Doe";
  const displaySender   = senderName   || "John Doe";

  // All sizes scale with container width
  const px = (frac: number) => `${w * frac}px`;

  // Stamp: ratio from the uploaded image is ~1:1.35 (width:height)
  const stampW    = w * 0.100;           // 10% of container width
  const stampH    = stampW * 1.35;       // maintain 1:1.35 ratio

  const toSize    = px(0.080);
  const fromSize  = px(0.044);
  const labelSize = px(0.019);
  const tagSize   = px(0.018);
  const tagIconSz = px(0.016);
  const bgIconSz  = px(0.17);
  const pmDiam    = px(0.070);
  const pmTextSz  = px(0.013);
  const pad       = px(0.040);
  const colGap    = px(0.028);
  const accentW   = Math.max(2, w * 0.004);

  const layoutAlign =
    theme.layout === "top-left"    ? "justify-start" :
    theme.layout === "center-left" ? "justify-center" : "justify-end";

  const stampAlign =
    theme.stampPosition === "bottom"  ? "items-end" :
    theme.stampPosition === "center"  ? "items-center" : "items-start";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
    >
      {/* watermark icon */}
      <div className="absolute pointer-events-none select-none"
        style={{ right: "-3%", bottom: "-10%", fontSize: bgIconSz,
          color: theme.bgIconColor, opacity: 0.20, lineHeight: 1, zIndex: 0 }}>
        <FontAwesomeIcon icon={theme.bgIcon} />
      </div>

      {/* right accent */}
      {theme.rightAccent && (
        <div className="absolute pointer-events-none"
          style={{ top: "10%", right: 0, width: accentW, height: "80%",
            borderRadius: "2px 0 0 2px", background: theme.rightAccent, zIndex: 4 }} />
      )}

      {/* deco icons */}
      {theme.decos.map((d, i) => (
        <div key={i} className="absolute pointer-events-none select-none"
          style={{ top: d.top, bottom: d.bottom, left: d.left, right: d.right,
            fontSize: px(d.size), color: theme.bgIconColor, opacity: d.opacity,
            transform: `rotate(${d.rotate}deg)`, zIndex: 2, lineHeight: 1 }}>
          <FontAwesomeIcon icon={d.icon} />
        </div>
      ))}

      {/* layout */}
      <div className="relative h-full flex" style={{ zIndex: 3, padding: pad, gap: colGap }}>

        {/* address column */}
        <div className="flex-1 min-w-0 border-r flex flex-col overflow-hidden"
          style={{ borderColor: theme.border, paddingRight: colGap }}>
          <div className={`flex flex-col h-full ${layoutAlign}`}>

            {/* TO */}
            <div style={{ marginBottom: px(0.005) }}>
              <p className="flex items-center uppercase font-semibold"
                style={{ color: theme.labelColor, fontFamily: theme.labelFont,
                  fontSize: labelSize, letterSpacing: "0.16em",
                  marginBottom: px(0.003), gap: px(0.007), opacity: 0.8 }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: labelSize }} />
                to
              </p>
              <p className="leading-none truncate"
                style={{
                  color: theme.toColor, fontFamily: theme.toFont,
                  fontSize: toSize, letterSpacing: "-0.02em", fontWeight: 700,
                  opacity: receiverName ? 1 : 0.35,
                }}>
                {displayReceiver}
              </p>
            </div>

            {/* FROM */}
            <div style={{ marginBottom: px(0.014) }}>
              <p className="flex items-center uppercase font-semibold"
                style={{ color: theme.labelColor, fontFamily: theme.labelFont,
                  fontSize: labelSize, letterSpacing: "0.16em",
                  marginBottom: px(0.003), gap: px(0.007), opacity: 0.7 }}>
                <FontAwesomeIcon icon={faPenNib} style={{ fontSize: labelSize }} />
                from
              </p>
              <p className="leading-none truncate"
                style={{
                  color: theme.fromColor, fontFamily: theme.fromFont,
                  fontSize: fromSize, letterSpacing: "0.01em",
                  fontWeight: 600, fontStyle: "italic",
                  opacity: senderName ? 1 : 0.35,
                }}>
                {displaySender}
              </p>
            </div>

            {/* occasion pill */}
            <span className="inline-flex items-center rounded-full border font-semibold w-fit"
              style={{ color: theme.tagColor, borderColor: theme.tagBorder,
                background: theme.tagBg, fontFamily: theme.tagFont,
                fontSize: tagSize, letterSpacing: "0.10em",
                padding: `${px(0.007)} ${px(0.015)}`, gap: px(0.007) }}>
              <FontAwesomeIcon icon={theme.bgIcon} style={{ fontSize: tagIconSz }} />
              {displayOccasion}
            </span>
          </div>
        </div>

        {/* stamp column */}
        <div className={`flex flex-col ${stampAlign} justify-center flex-shrink-0`}
          style={{ width: `${stampW}px` }}>
          {stampUrl ? (
            <img
              src={stampUrl}
              alt={stampLabel}
              style={{
                width: `${stampW}px`,
                height: `${stampH}px`,
                objectFit: "cover",
                borderRadius: `${w * 0.008}px`,
                display: "block",
              }}
            />
          ) : (
            <div className="relative flex flex-col items-center justify-center rounded border-2"
              style={{ width: `${stampW}px`, height: `${stampH}px`,
                borderColor: theme.tagBorder, background: theme.tagBg }}>
              <div className="absolute inset-[3px] rounded border border-dashed opacity-40 pointer-events-none"
                style={{ borderColor: theme.tagColor }} />
              <FontAwesomeIcon icon={theme.bgIcon}
                style={{ color: theme.tagColor, fontSize: px(0.042), opacity: 0.7 }} />
              <span className="tracking-wider uppercase font-bold opacity-50 text-center leading-tight"
                style={{ color: theme.tagColor, fontFamily: theme.tagFont,
                  fontSize: px(0.014), marginTop: px(0.005) }}>
                {occasion.split(" ")[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* postmark */}
      <div className="absolute pointer-events-none"
        style={{ top: "50%", left: "68%", transform: "translate(-50%,-50%)", zIndex: 3 }}>
        <div style={{ color: theme.postmarkColor, opacity: 0.16 }}
          className="flex flex-col items-center">
          <div className="rounded-md border flex items-center justify-center"
            style={{ width: pmDiam, height: pmDiam,
              borderColor: "currentColor", borderWidth: Math.max(1, w * 0.003) }}>
            <span className="tracking-widest uppercase text-center leading-tight font-bold"
              style={{ fontSize: pmTextSz, fontFamily: theme.tagFont }}>
              हुलाक<br />POST
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
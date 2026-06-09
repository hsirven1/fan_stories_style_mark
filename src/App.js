import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  SHARE_PNG_FILENAME,
  SHARE_SHEET_TITLE,
  captureShareCardToPngBlob,
  getShareCaptureHostStyle,
} from "./shareCapture";

const LOOKBACK_DATA = {
  items: 34,
  favorite_category: "Outerwear",
  favorite_color: "Navy",
  power_season: "Fall",
  style: "minimalist",
  money_saved: 340,
  co2_saved: 28,
  new_styles: 8,
  boldest_pick_name: "Merino Wool Overcoat in Midnight Navy",
};

const SEASONS = ["Fall", "Winter", "Spring", "Summer"];
const FAST_FASHION_KG_PER_ITEM = 4;
const BOLDEST_PICK_IMAGE = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

const PALETTE = {
  white: "#FFFFFF",
  ink: "#0A0A0A",
  rose: "#C9A99A",
  card: "#E8E4DF",
};

/** Progress segments follow the *current* slide background for contrast. */
const PROGRESS_BAR = {
  dark: { filled: "#ffffff", unfilled: "rgba(255,255,255,0.28)" },
  light: { filled: PALETTE.ink, unfilled: "rgba(10,10,10,0.12)" },
};

const PROFILE_CONTENT = {
  minimalist: {
    title: "THE MINIMALIST",
    body:
      "Clean lines, quiet confidence, and a wardrobe that whispers rather than shouts. You curate with intention—every piece earns its place.",
    shareSummary:
      "Clean lines and quiet confidence—you curate with intention, and every piece earns its place.",
  },
  trendsetter: {
    title: "THE TRENDSETTER",
    body:
      "You spot what's next before it hits the feed. Bold picks, fresh silhouettes, and a closet that always feels one step ahead.",
    shareSummary:
      "You spot what's next before it hits the feed—bold picks and a closet always one step ahead.",
  },
  classicist: {
    title: "THE CLASSICIST",
    body:
      "Timeless tailoring, refined neutrals, and investment pieces that outlast every season. Your style is built to endure.",
    shareSummary:
      "Timeless tailoring and refined neutrals—your style is built to endure, season after season.",
  },
  bold: {
    title: "THE BOLD ONE",
    body:
      "Color, texture, statement silhouettes—you dress like every day is a front row. Your wardrobe is unapologetically expressive.",
    shareSummary:
      "Color, texture, statement silhouettes—you dress unapologetically, every single day.",
  },
  maximalist: {
    title: "THE MAXIMALIST",
    body:
      "More is more, and you wear it brilliantly. Layered looks, rich patterns, and a closet that never stops surprising.",
    shareSummary:
      "More is more, and you wear it brilliantly—layered looks and a closet that never stops surprising.",
  },
};

const profileFromData = (data) =>
  PROFILE_CONTENT[data.style] || PROFILE_CONTENT.minimalist;

const ShareExportCta = () => (
  <div
    style={{
      width: "100%",
      background: PALETTE.rose,
      borderRadius: 10,
      padding: "12px 14px",
      textAlign: "center",
      boxShadow: "0 4px 16px rgba(10,10,10,0.12)",
    }}
  >
    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: PALETTE.ink, lineHeight: 1.25 }}>
      Discover StyleMark
    </div>
    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: PALETTE.ink, lineHeight: 1.35, marginTop: 4, opacity: 0.85 }}>
      Use code STYLE2025 for 20% off your first box
    </div>
  </div>
);

/** Share recap interior — `card` for on-screen slide; `story` + CTA for export only. */
const ShareCardScene = ({ data, profile, variant = "card", includeExportCta = false }) => {
  const isStory = variant === "story";
  const isCard = variant === "card";
  const isExportStory = isStory && includeExportCta;
  const gap = isCard ? 8 : isExportStory ? 10 : isStory ? 8 : 6;
  const statRowMin = isCard ? 52 : isExportStory ? 56 : isStory ? 52 : 44;
  const statValSize = isCard ? 22 : isExportStory ? 24 : isStory ? 20 : 18;
  const statLabelSize = isCard ? 11 : isExportStory ? 12 : 9;
  const personaTitleSize = isCard ? 20 : isExportStory ? 21 : isStory ? 18 : 16;
  const personaLabelSize = isCard ? 11 : isExportStory ? 12 : 9;
  const personaBodySize = isCard ? 13 : isExportStory ? 13 : isStory ? 11 : 10;
  const recapTitleSize = isCard ? 24 : isExportStory ? 26 : isStory ? 22 : 19;
  const highlightLabelSize = isCard ? 10 : isExportStory ? 11 : 8;
  const highlightValSize = isCard ? 15 : isExportStory ? 16 : isStory ? 14 : 13;
  const pickNameSize = isCard ? 13 : isExportStory ? 14 : isStory ? 12 : 11;
  const logoSize = isCard ? 1.15 : isExportStory ? 1.22 : isStory ? 1.1 : 1;
  const boxPadding = isCard ? "10px 12px" : isExportStory ? "10px 12px" : isStory ? "8px 10px" : "7px 9px";
  const statBoxPadding = isCard ? "10px 12px" : isExportStory ? "10px 12px" : isStory ? "8px 10px" : "6px 8px";

  return (
    <div
      style={{
        position: isExportStory ? "relative" : "absolute",
        inset: isExportStory ? undefined : 0,
        width: "100%",
        height: isExportStory ? "100%" : "100%",
        boxSizing: "border-box",
        background: PALETTE.white,
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: isExportStory ? "auto" : "100%",
          minHeight: isExportStory ? "100%" : undefined,
          display: "flex",
          flexDirection: "column",
          justifyContent: isExportStory ? "flex-start" : undefined,
          gap: isExportStory ? 10 : gap,
          overflow: "hidden",
          boxSizing: "border-box",
          ...(isCard ? { padding: "10px 14px 0" } : {}),
          ...(isExportStory ? { padding: "12px 8px 0" } : {}),
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: isExportStory ? 10 : gap,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: isExportStory ? 10 : isCard ? 6 : isStory ? 6 : 4,
              ...(isExportStory ? { paddingTop: 16, paddingBottom: 6 } : {}),
            }}
          >
            <StyleMarkLogo color={PALETTE.ink} size={logoSize} hideSubtitle />
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: recapTitleSize,
                color: "rgba(10,10,10,0.45)",
                lineHeight: 1.1,
              }}
            >
              Your 2025 in Style
            </div>
            <div style={{ width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${PALETTE.card}, transparent)` }} />
          </div>

          <div
            style={{
              flexShrink: 0,
              background: PALETTE.card,
              borderRadius: 12,
              padding: boxPadding,
              border: `1px solid rgba(10,10,10,0.06)`,
            }}
          >
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: personaLabelSize, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>Style identity</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: personaTitleSize, color: PALETTE.ink, lineHeight: 1.15 }}>{profile.title}</div>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontFamily: "'Inter', sans-serif",
                fontSize: personaBodySize,
                fontStyle: "italic",
                fontWeight: 400,
                color: "rgba(10,10,10,0.55)",
                lineHeight: 1.35,
              }}
            >
              {profile.shareSummary ?? profile.body}
            </p>
          </div>

          <div
            style={{
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gridTemplateRows: `repeat(2, minmax(${statRowMin}px, 1fr))`,
              gap: isCard ? 8 : isExportStory ? 10 : isStory ? 8 : 6,
              width: "100%",
            }}
          >
            {[
              { val: data.items, lbl: "items purchased", accent: PALETTE.rose },
              { val: data.new_styles, lbl: "new styles tried", accent: PALETTE.ink },
              { val: `$${data.money_saved}`, lbl: "saved in points", accent: PALETTE.rose },
              { val: `${data.co2_saved} kg`, lbl: "CO₂ saved", accent: PALETTE.ink },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: PALETTE.card,
                  padding: statBoxPadding,
                  borderRadius: 10,
                  border: "1px solid rgba(10,10,10,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: statValSize, color: s.accent, lineHeight: 1, letterSpacing: -0.3 }}>{s.val}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: statLabelSize, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: 1.3, marginTop: 3 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: isCard ? 8 : isExportStory ? 10 : 6,
              width: "100%",
            }}
          >
            {[
              { lbl: "Category", val: data.favorite_category },
              { lbl: "Color", val: data.favorite_color },
              { lbl: "Season", val: data.power_season },
            ].map((h, i) => (
              <div
                key={i}
                style={{
                  background: PALETTE.card,
                  borderRadius: 10,
                  padding: "10px 8px",
                  border: "1px solid rgba(10,10,10,0.05)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: highlightLabelSize, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>{h.lbl}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: highlightValSize, color: PALETTE.ink, lineHeight: 1.15 }}>{h.val}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              flexShrink: 0,
              background: PALETTE.card,
              borderRadius: 12,
              padding: boxPadding,
              border: "1px solid rgba(10,10,10,0.06)",
              overflow: "hidden",
            }}
          >
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: highlightLabelSize, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Boldest pick</div>
            <div
              style={{
                width: "100%",
                height: 100,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <img
                src={BOLDEST_PICK_IMAGE}
                alt={data.boldest_pick_name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: pickNameSize,
                color: PALETTE.ink,
                lineHeight: 1.3,
              }}
            >
              {data.boldest_pick_name}
            </div>
          </div>
        </div>

        {includeExportCta && (
          <div
            style={{
              flexShrink: 0,
              width: "100%",
              ...(isExportStory ? { marginTop: 10 } : { marginTop: "auto" }),
            }}
          >
            <ShareExportCta />
          </div>
        )}
      </div>
    </div>
  );
};

const downloadPngBlob = (blob, filename = SHARE_PNG_FILENAME) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const EditorialLine = ({ opacity = 0.12 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: "38%",
      height: 1,
      background: `linear-gradient(90deg, transparent, ${PALETTE.rose}, transparent)`,
      zIndex: 2,
      opacity,
      pointerEvents: "none",
    }}
  />
);

const StyleMarkLogo = ({ color = PALETTE.ink, size = 1, hideSubtitle = false }) => {
  const s = size;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * s }}>
      <svg width={36 * s} height={36 * s} viewBox="0 0 40 40" fill="none" aria-hidden>
        <path d="M20 5 L27 14 L20 23 L13 14 Z" stroke={color} strokeWidth="1.3" fill="none" opacity={0.55} />
        <path d="M14 24 h12" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M20 23 v2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M11 33 Q20 25 29 33" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
      <div style={{ lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: 19 * s,
            color,
            letterSpacing: 0.2,
            display: "block",
          }}
        >
          StyleMark
        </span>
        {!hideSubtitle && (
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 9 * s,
              color,
              opacity: 0.5,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              display: "block",
              marginTop: 3,
            }}
          >
            Lookback 2025
          </span>
        )}
      </div>
    </div>
  );
};

const slides = (data) => {
  const profile = profileFromData(data);
  const fastFashionIfBought = data.items * FAST_FASHION_KG_PER_ITEM;
  const itemsPerMonth = (data.items / 12).toFixed(1);

  return [
    {
      bg: PALETTE.white,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <EditorialLine opacity={0.18} />
          <div style={{ position: "absolute", right: -40, top: "42%", transform: "translateY(-50%)", opacity: 0.06, zIndex: 2, pointerEvents: "none" }}>
            <svg width="220" height="220" viewBox="0 0 40 40" fill="none">
              <path d="M20 5 L27 14 L20 23 L13 14 Z" stroke={PALETTE.rose} strokeWidth="1.2" fill="none" />
              <path d="M11 33 Q20 25 29 33" stroke={PALETTE.rose} strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ height: 48 }} />
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(10,10,10,0.4)", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 20 }}>
                StyleMark Lookback
              </p>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 52,
                  color: PALETTE.ink,
                  lineHeight: 1.05,
                  letterSpacing: -0.5,
                  marginBottom: 16,
                }}
              >
                Your year
                <br />
                in style.
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(10,10,10,0.5)", lineHeight: 1.65, maxWidth: 280 }}>
                A curated look back at what you wore, discovered, and loved with your StyleMark subscription.
              </p>
            </div>
            <div style={{ height: 8 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.rose,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <div style={{ position: "absolute", right: -28, top: "50%", transform: "translateY(-46%)", zIndex: 2, pointerEvents: "none", lineHeight: 0.78 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 260, color: "rgba(10,10,10,0.08)", letterSpacing: -8, display: "block" }}>{data.items}</span>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.55)", textTransform: "uppercase", letterSpacing: 2.2, marginTop: 48 }}>This year you added</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 132, color: PALETTE.ink, lineHeight: 0.82, letterSpacing: -4, marginBottom: 12 }}>{data.items}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 36, color: "rgba(10,10,10,0.9)", lineHeight: 1.05, marginBottom: 28 }}>pieces to your wardrobe.</div>
              <div style={{ background: "rgba(255,255,255,0.35)", borderRadius: 12, padding: "14px 18px", display: "inline-block", maxWidth: "100%" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(10,10,10,0.8)", lineHeight: 1.5 }}>
                  Roughly {itemsPerMonth} new items per month—your closet kept evolving.
                </span>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.white,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <EditorialLine opacity={0.14} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, marginTop: 48 }}>Your signatures</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: PALETTE.card, borderRadius: 16, padding: "22px 22px", border: "1px solid rgba(10,10,10,0.05)" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 8 }}>Favorite category</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 42, color: PALETTE.ink, lineHeight: 1.05, letterSpacing: -0.5 }}>{data.favorite_category}</div>
                </div>
                <div style={{ background: PALETTE.card, borderRadius: 16, padding: "22px 22px", border: "1px solid rgba(10,10,10,0.05)" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 8 }}>Favorite color</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1B2A4A", border: `2px solid ${PALETTE.rose}`, flexShrink: 0 }} />
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 42, color: PALETTE.ink, lineHeight: 1.05 }}>{data.favorite_color}</div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(10,10,10,0.5)", lineHeight: 1.6, marginBottom: 8 }}>
              The category and hue you reached for again and again—effortless, elevated, unmistakably you.
            </p>
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.ink,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 80%, rgba(201,169,154,0.18) 0%, transparent 55%)`, zIndex: 1, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Your power season</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "center", paddingBottom: 20 }}>
              {SEASONS.map((season) => {
                const isPower = season === data.power_season;
                return (
                  <div
                    key={season}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      padding: isPower ? "18px 0" : "8px 0",
                      borderBottom: isPower ? "none" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: isPower ? 700 : 500,
                        fontSize: isPower ? 72 : 28,
                        color: isPower ? PALETTE.rose : "rgba(255,255,255,0.28)",
                        lineHeight: 1,
                        letterSpacing: isPower ? -2 : -0.5,
                        transition: "all 0.2s",
                      }}
                    >
                      {season}
                    </span>
                    {isPower && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2 }}>Power season</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 8 }}>
              When the temperature dropped, your style peaked—layered, intentional, and always on point.
            </p>
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.white,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <div style={{ position: "absolute", right: -24, top: "22%", opacity: 0.05, zIndex: 2, pointerEvents: "none" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 200, color: PALETTE.rose, letterSpacing: -6, lineHeight: 1 }}>${data.money_saved}</span>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Loyalty rewards</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 100, color: PALETTE.ink, lineHeight: 0.9, letterSpacing: -3, marginBottom: 6 }}>${data.money_saved}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 26, color: "rgba(10,10,10,0.85)", lineHeight: 1.2, marginBottom: 22 }}>saved through loyalty points</div>
              <div style={{ background: PALETTE.card, borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(10,10,10,0.05)" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(10,10,10,0.55)", lineHeight: 1.65, margin: 0 }}>
                  Every box, every swap, every review—your loyalty added up to real savings on the pieces you love.
                </p>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.card,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Conscious style</div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 72, color: PALETTE.ink, lineHeight: 1 }}>{data.co2_saved}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: "rgba(10,10,10,0.55)" }}>kg CO₂ saved</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(10,10,10,0.55)", lineHeight: 1.65, marginBottom: 24 }}>
                Compared to fast fashion, where we estimate about {FAST_FASHION_KG_PER_ITEM} kg CO₂ per impulse purchase, your curated wardrobe avoided roughly{" "}
                <strong style={{ color: PALETTE.ink, fontWeight: 600 }}>{fastFashionIfBought} kg</strong> in throwaway-fashion emissions across your {data.items} pieces.
              </p>
              <div style={{ background: PALETTE.white, borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(10,10,10,0.06)" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(10,10,10,0.65)", lineHeight: 1.55 }}>
                  Same style appetite, lighter footprint—every curated piece was a vote against disposable fashion.
                </div>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.white,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(180deg, transparent, rgba(201,169,154,0.08))`, zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Your style identity</div>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: profile.title.length > 18 ? 36 : 44,
                  color: PALETTE.ink,
                  lineHeight: 1.05,
                  letterSpacing: -0.3,
                  marginBottom: 22,
                }}
              >
                {profile.title.split(" ").map((w, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {w}
                  </span>
                ))}
              </div>
              <div style={{ background: PALETTE.card, borderRadius: 16, padding: "22px 22px", border: "1px solid rgba(10,10,10,0.05)" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(10,10,10,0.65)", lineHeight: 1.75, fontWeight: 400 }}>{profile.body}</p>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.ink,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(201,169,154,0.12) 0%, transparent 50%)`, zIndex: 1, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2.2, marginTop: 48 }}>
              Your boldest pick of 2025
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, justifyContent: "center", gap: 18, paddingTop: 8, paddingBottom: 8 }}>
              <div
                style={{
                  width: "100%",
                  height: "45%",
                  minHeight: 200,
                  borderRadius: 16,
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={BOLDEST_PICK_IMAGE}
                  alt={data.boldest_pick_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: 32,
                    color: "#FFFFFF",
                    lineHeight: 1.2,
                    letterSpacing: -0.2,
                  }}
                >
                  {data.boldest_pick_name}
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 8 }}>
              The piece that defined your year.
            </p>
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.white,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <ShareCardScene data={data} profile={profile} variant="card" />
      ),
    },
  ];
};

export default function App() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dir, setDir] = useState(1);
  const touchStart = useRef(null);
  const [sharePreparing, setSharePreparing] = useState(true);
  const [shareReady, setShareReady] = useState(false);
  const shareCaptureRef = useRef(null);
  const cachedShareFile = useRef(null);
  const cachedShareBlob = useRef(null);
  const sharePregenGenRef = useRef(0);
  const data = LOOKBACK_DATA;
  const profile = profileFromData(data);
  const allSlides = slides(data);
  const lastSlideIdx = allSlides.length - 1;

  const goTo = (nextIdx) => {
    if (nextIdx < 0 || nextIdx >= allSlides.length) return;
    setDir(nextIdx > idx ? 1 : -1);
    setVisible(false);
    setTimeout(() => {
      setIdx(nextIdx);
      setVisible(true);
    }, 160);
  };

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(dx > 0 ? idx + 1 : idx - 1);
    touchStart.current = null;
  };

  /** Pre-generate share PNG on mount so navigator.share() runs inside the tap gesture on iOS. */
  useEffect(() => {
    const gen = ++sharePregenGenRef.current;
    cachedShareFile.current = null;
    cachedShareBlob.current = null;
    setShareReady(false);
    setSharePreparing(true);

    let cancelled = false;

    const runPregen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 480));
      if (cancelled || sharePregenGenRef.current !== gen) return;

      const captureEl = shareCaptureRef.current;
      if (!captureEl) {
        if (!cancelled && sharePregenGenRef.current === gen) setSharePreparing(false);
        return;
      }

      try {
        const blob = await captureShareCardToPngBlob(captureEl);
        if (cancelled || sharePregenGenRef.current !== gen) return;
        cachedShareBlob.current = blob;
        cachedShareFile.current = new File([blob], SHARE_PNG_FILENAME, { type: "image/png" });
        setShareReady(true);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled && sharePregenGenRef.current === gen) setSharePreparing(false);
      }
    };

    runPregen();

    return () => {
      cancelled = true;
      sharePregenGenRef.current += 1;
    };
  }, [data, profile]);

  const handleShare = () => {
    if (sharePreparing || !shareReady) return;

    const file = cachedShareFile.current;
    const blob = cachedShareBlob.current;
    if (!file || !blob) return;

    if (typeof navigator.share !== "function") {
      downloadPngBlob(blob);
      return;
    }

    const canShareFiles =
      typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

    if (!canShareFiles) {
      downloadPngBlob(blob);
      return;
    }

    navigator.share({ files: [file], title: SHARE_SHEET_TITLE }).catch((e) => {
      if (e?.name === "AbortError") return;
      downloadPngBlob(blob);
    });
  };

  const slide = allSlides[idx];
  const isLastSlide = idx === lastSlideIdx;
  const progressBar = PROGRESS_BAR[slide.progressBarTheme];

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button{cursor:pointer;border:none;transition:opacity .15s,transform .1s}
        button:hover:not(:disabled){opacity:.85} button:active:not(:disabled){transform:scale(.98)}
        button:disabled{opacity:.75;cursor:wait}
      `}</style>

      <div style={{ width: "100%", maxWidth: 390 }}>
        <div>
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              borderRadius: 28,
              overflow: "hidden",
              width: "100%",
              height: 620,
              position: "relative",
              boxShadow: "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
              background: slide.bg,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: isLastSlide ? "48px 28px 56px" : "36px 30px 60px",
                background: slide.bg,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : `translateY(${dir * 14}px)`,
                transition: "opacity 0.16s ease, transform 0.16s ease",
                zIndex: 20,
                overflow: "hidden",
              }}
            >
              {slide.render()}
            </div>

            {idx < allSlides.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 22,
                  left: 24,
                  right: 24,
                  zIndex: 35,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <StyleMarkLogo color={slide.logoOnDark ? "rgba(255,255,255,0.92)" : "rgba(10,10,10,0.85)"} size={1.05} />
              </div>
            )}

            <div style={{ position: "absolute", bottom: 24, left: 30, right: 30, display: "flex", gap: 5, zIndex: 30 }}>
              {allSlides.map((_, i) => (
                <div
                  key={i}
                  data-testid={`progress-dot-${i}`}
                  onClick={() => goTo(i)}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    cursor: "pointer",
                    background: i <= idx ? progressBar.filled : progressBar.unfilled,
                    transition: "background 0.25s",
                  }}
                />
              ))}
            </div>

            <div
              onClick={() => goTo(idx - 1)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "35%",
                height: "100%",
                zIndex: 25,
                cursor: idx > 0 ? "pointer" : "default",
              }}
            />
            <div
              onClick={() => goTo(idx + 1)}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "35%",
                height: "100%",
                zIndex: 25,
                cursor: idx < allSlides.length - 1 ? "pointer" : "default",
              }}
            />
          </div>

          {createPortal(
            <div ref={shareCaptureRef} aria-hidden="true" data-testid="share-capture-host" style={getShareCaptureHostStyle()}>
              <ShareCardScene
                data={data}
                profile={profile}
                variant="story"
                includeExportCta
              />
            </div>,
            document.body
          )}

          {idx === lastSlideIdx && (
            <button
              type="button"
              disabled={sharePreparing || !shareReady}
              onClick={handleShare}
              style={{
                width: "100%",
                marginTop: 10,
                background: PALETTE.rose,
                color: PALETTE.ink,
                border: "none",
                borderRadius: 10,
                padding: "15px 20px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 0.3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: sharePreparing ? 0.85 : 1,
              }}
            >
              {sharePreparing && (
                <svg width="18" height="18" viewBox="0 0 100 100" fill="none" style={{ animation: "spin 0.85s linear infinite", flexShrink: 0 }}>
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" strokeDasharray="66 200" strokeLinecap="round" />
                </svg>
              )}
              {sharePreparing ? "Preparing…" : "Share my 2025 recap"}
            </button>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", marginTop: 10 }}>
            Tap sides or swipe to navigate
          </p>
        </div>
      </div>

    </div>
  );
}

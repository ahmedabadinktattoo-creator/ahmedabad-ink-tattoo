import { ImageResponse } from "next/og";

export const alt = "Ahmedabad Ink Tattoo — Premium tattoo studio in Nikol, Ahmedabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 78px",
        color: "#f7f2e8",
        background:
          "radial-gradient(circle at 82% 18%, rgba(212,175,55,.22), transparent 28%), linear-gradient(135deg, #080807 0%, #171512 58%, #080807 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 66,
            height: 66,
            border: "1px solid #d4af37",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d4af37",
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          AI
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 25, letterSpacing: 7, fontWeight: 600 }}>AHMEDABAD INK</div>
          <div style={{ marginTop: 8, color: "#a9a39a", fontSize: 14, letterSpacing: 4 }}>TATTOO STUDIO · SINCE 2014</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div style={{ color: "#d4af37", fontSize: 18, letterSpacing: 5, textTransform: "uppercase" }}>Nikol · Ahmedabad</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 20, fontSize: 76, lineHeight: 1.03, letterSpacing: -2 }}>
          <span>Custom tattoos,</span>
          <span>made with intention.</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa49a", fontSize: 17, letterSpacing: 2 }}>
        <div>REALISM · FINE LINE · MANDALA · COVER-UPS</div>
        <div>AHMEDABADINKTATTOO.COM</div>
      </div>
    </div>,
    size,
  );
}

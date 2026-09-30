import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#FBFBFD",
        color: "#1D1D1F",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 4, display: "flex" }}>
        RAZAK · SOFTWARE ENGINEER
      </div>
      <div
        style={{
          fontSize: 100,
          fontWeight: 800,
          letterSpacing: -5,
          marginTop: 60,
          display: "flex",
        }}
      >
        Clear code.
      </div>
      <div
        style={{
          fontSize: 100,
          fontWeight: 800,
          letterSpacing: -5,
          color: "#79797E",
          display: "flex",
        }}
      >
        Real results.
      </div>
      <div style={{ marginTop: 50, fontSize: 22, display: "flex" }}>
        Full-stack development · Applied AI · Depok, Indonesia
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";

export const alt = "Kavil-Cure — Ayurvedic Jaundice Care since 1965";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eef3ea 0%, #f8f6ef 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              borderRadius: "28px",
              background: "#337a4d",
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div style={{ fontSize: "52px", fontWeight: 700, color: "#20402c" }}>
            Kavil-Cure
          </div>
        </div>

        <div
          style={{
            fontSize: "68px",
            fontWeight: 700,
            color: "#20402c",
            lineHeight: 1.1,
            marginTop: "48px",
            maxWidth: "900px",
          }}
        >
          Gentle, time-tested Ayurvedic care for jaundice
        </div>

        <div
          style={{
            fontSize: "32px",
            color: "#4b6350",
            marginTop: "28px",
          }}
        >
          Trusted family practice since 1965 · India
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";
import { getPublicOgData } from "@/features/public-profile/service";

export const runtime = "nodejs";
export const alt = "CareerVerse profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getPublicOgData(username);
  const name = data?.name ?? "CareerVerse Student";
  const headline = data?.headline ?? "Career portfolio";
  const score = data?.score ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(120deg, #2a78d6, #c6467c)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, opacity: 0.95 }}>CareerVerse</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
          <div style={{ fontSize: 34, marginTop: 12, opacity: 0.92 }}>{headline}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(255,255,255,0.16)",
              padding: "16px 28px",
              borderRadius: 999,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Career Health Score · {score}/100
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

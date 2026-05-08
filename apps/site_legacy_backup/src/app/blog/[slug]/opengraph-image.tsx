import { ImageResponse } from "next/og";
import { getArticleBySlug } from "../_data";

export const runtime = "edge";
export const alt = "Artigo do Blog Gradios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryColors: Record<string, string> = {
  Automação: "#2546BD",
  Desenvolvimento: "#7C3AED",
  Integração: "#059669",
  IA: "#D97706",
  Gestão: "#E11D48",
  Ferramentas: "#0891B2",
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  const title = article?.title ?? "Blog Gradios";
  const category = article?.category ?? "Artigo";
  const readingTime = article?.readingTime ?? 5;
  const accentColor = categoryColors[category] ?? "#2546BD";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg, #080E1A 0%, #0f1d32 50%, #0A1628 100%)",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "60px 80px",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              "repeating-linear-gradient(45deg, #00BFFF 0px, #00BFFF 1px, transparent 1px, transparent 24px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${accentColor}, #00BFFF)`,
          }}
        />

        {/* Top: logo + category */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 32,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #2546BD, #00BFFF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                color: "white",
              }}
            >
              G
            </div>
            Gradios
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                background: accentColor,
                color: "white",
                padding: "8px 20px",
                borderRadius: 100,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {category}
            </span>
            <span
              style={{
                color: "#94A3B8",
                fontSize: 16,
              }}
            >
              {readingTime} min de leitura
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 40 : 48,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              maxWidth: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#94A3B8",
            }}
          >
            gradios.co/blog
          </div>
        </div>

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}20, transparent)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}

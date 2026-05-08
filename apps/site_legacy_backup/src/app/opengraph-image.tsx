import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gradios - Elimine processos manuais e escale sua operação B2B";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(145deg, #080E1A 0%, #0f1d32 50%, #0A1628 100%)",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "repeating-linear-gradient(45deg, #00BFFF 0px, #00BFFF 1px, transparent 1px, transparent 24px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top glow line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(0,191,255,0.6), transparent)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: "0 80px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2546BD, #00BFFF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
              }}
            >
              G
            </div>
            Gradios
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "white",
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: 900,
              letterSpacing: "-0.02em",
            }}
          >
            Elimine processos manuais.
            <br />
            Escale sua operação B2B.
          </div>

          {/* Subline */}
          <div
            style={{
              fontSize: 24,
              color: "#94A3B8",
              textAlign: "center",
            }}
          >
            Engenharia de software e IA | Resultado em 14 dias
          </div>

          {/* CTA badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #2546BD, #00BFFF)",
              borderRadius: 100,
              padding: "14px 32px",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              marginTop: 8,
            }}
          >
            Diagnóstico Gratuito →
          </div>
        </div>

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,70,189,0.15), transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

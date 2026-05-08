"""
Gera Site 2/og-cover.png (1200x630) — imagem de compartilhamento da Gradios.
Estilo Linear/Stripe/Vercel: fundo claro, texto navy, glow sutil em ciano/azul.

Rodar: python3 scripts/generate-og-cover.py
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "Site 2"
FONTS = SITE / "design-system" / "fonts"
LOGO = SITE / "design-system" / "assets" / "logo-mark.png"
OUT = SITE / "og-cover.png"

W, H = 1200, 630

# Paleta Gradios
BG = (245, 245, 247)        # #F5F5F7
TEXT = (10, 27, 61)          # #0A1B3D
MUTED = (100, 116, 139)      # #64748B
BRAND = (37, 70, 189)        # #2546BD
ACCENT = (0, 191, 255)       # #00BFFF
DIVIDER = (226, 232, 240)    # #E2E8F0

# 1. Base
img = Image.new("RGBA", (W, H), BG + (255,))

# 2. Dot grid sutil
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
SPACING = 32
for x in range(0, W, SPACING):
    for y in range(0, H, SPACING):
        od.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(10, 27, 61, 16))
img = Image.alpha_composite(img, overlay)

# 3. Glow ciano/azul no canto superior direito
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([W - 520, -260, W + 240, 380], fill=(0, 191, 255, 36))
gd.ellipse([W - 320, -120, W + 80, 280], fill=(37, 70, 189, 28))
glow = glow.filter(ImageFilter.GaussianBlur(56))
img = Image.alpha_composite(img, glow)

# 4. Linha divisória horizontal sutil debaixo do logo
draw = ImageDraw.Draw(img)
draw.line([(80, 156), (W - 80, 156)], fill=DIVIDER + (255,), width=1)

# 5. Linha divisória horizontal acima do strip de serviços
draw.line([(80, 484), (W - 80, 484)], fill=DIVIDER + (255,), width=1)

# Fontes (Inter local)
font_wordmark = ImageFont.truetype(str(FONTS / "Inter-Bold.otf"), 30)
font_eyebrow = ImageFont.truetype(str(FONTS / "Inter-SemiBold.otf"), 14)
font_headline = ImageFont.truetype(str(FONTS / "Inter-SemiBold.otf"), 62)
font_strip = ImageFont.truetype(str(FONTS / "Inter-Medium.otf"), 19)
font_url = ImageFont.truetype(str(FONTS / "Inter-Medium.otf"), 16)

# 6. Logo + wordmark (top-left)
logo = Image.open(LOGO).convert("RGBA")
logo.thumbnail((52, 52), Image.LANCZOS)
img.paste(logo, (80, 84), logo)
draw = ImageDraw.Draw(img)
draw.text((80 + 52 + 14, 90), "Gradios", font=font_wordmark, fill=TEXT)

# 7. Eyebrow com bolinha azul (ciano = energia, dado live)
EY_Y = 226
draw.ellipse([80, EY_Y + 5, 90, EY_Y + 15], fill=BRAND)
draw.text(
    (80 + 22, EY_Y),
    "TECNOLOGIA SOB MEDIDA",
    font=font_eyebrow,
    fill=BRAND,
)

# 8. Headline em 3 linhas (controlado manualmente para layout consistente)
HEADLINE_LINES = [
    "Tecnologia sob medida",
    "para empresas que",
    "querem operar melhor.",
]
y = 264
LINE_HEIGHT = 70
for line in HEADLINE_LINES:
    draw.text((80, y), line, font=font_headline, fill=TEXT)
    y += LINE_HEIGHT

# 9. Strip de serviços (footer da imagem)
draw.text(
    (80, 504),
    "Sites · Sistemas · Apps · Automações · IA · Dashboards",
    font=font_strip,
    fill=MUTED,
)

# 10. URL canônica (canto inferior direito)
url_text = "gradios.co"
url_bbox = draw.textbbox((0, 0), url_text, font=font_url)
url_w = url_bbox[2] - url_bbox[0]
draw.text((W - 80 - url_w, 510), url_text, font=font_url, fill=TEXT)

# 11. Salvar
final = img.convert("RGB")
final.save(OUT, "PNG", optimize=True)
print(f"Gerado: {OUT}  —  {OUT.stat().st_size // 1024} KB")

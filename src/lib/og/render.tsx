/**
 * Open Graph / Twitter images (Fase 9.3) rendered with next/og at 1200×630.
 * - Fonts: local OFL woff files in src/assets/og (Newsreader, Geist, Geist Mono; see docs/CREDITS.md);
 *   no font service is called.
 * - Colors: next/og cannot read CSS variables, so OG_COLORS mirrors DESIGN.md → colors.light.
 * - Project images: fetched from the existing image URL (Cloudinary → JPG); any failure falls back
 *   to a text-only layout.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { isCloudinaryImage, validImageSource } from "@/lib/image-loader";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** DESIGN.md → colors.light (keep in sync). */
const OG_COLORS = {
  canvas: "#FAF8F4",
  surface: "#F2EEE7",
  ink: "#1A1917",
  body: "#4A4843",
  muted: "#6B6760",
  hairline: "#E4DED3",
  accent: "#A34A27",
  accentSoft: "#F5E6DD",
};

let fontData: Promise<
  { name: string; data: Buffer; weight: 400; style: "normal" }[]
> | null = null;
function fonts() {
  fontData ??= Promise.all(
    [
      ["Newsreader", "newsreader-latin-400-normal.woff"],
      ["Geist", "geist-sans-latin-400-normal.woff"],
      ["Geist Mono", "geist-mono-latin-400-normal.woff"],
    ].map(async ([name, file]) => ({
      name,
      data: await readFile(join(process.cwd(), "src/assets/og", file)),
      weight: 400 as const,
      style: "normal" as const,
    })),
  );
  return fontData;
}

/** Project image as a data URL (JPG via Cloudinary when possible), or null on any failure. */
export async function imageDataUrl(src: string | null | undefined) {
  if (!src || !validImageSource(src) || src.startsWith("/")) return null;
  const url = isCloudinaryImage(src)
    ? src.replace(
        "/image/upload/",
        "/image/upload/f_jpg,q_80,c_fill,g_north,w_1040,h_650/",
      )
    : src;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(png|jpe?g)$/.test(type)) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 4 * 1024 * 1024) return null;
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

const clamp = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export async function renderOg({
  eyebrow,
  title,
  description,
  badges = [],
  image = null,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  badges?: string[];
  image?: string | null;
}) {
  const c = OG_COLORS;
  const withImage = Boolean(image);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: c.canvas,
        color: c.ink,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Geist Mono",
          fontSize: 20,
          color: c.muted,
          letterSpacing: 2,
        }}
      >
        <span>{eyebrow.toUpperCase()}</span>
        <span>FARHANZULKARNAINHRP.COM</span>
      </div>

      <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: withImage ? 560 : 1000,
          }}
        >
          {badges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {badges.slice(0, 3).map((badge) => (
                <span
                  key={badge}
                  style={{
                    display: "flex",
                    padding: "6px 14px",
                    borderRadius: 999,
                    backgroundColor: c.accentSoft,
                    color: c.ink,
                    fontFamily: "Geist Mono",
                    fontSize: 18,
                    letterSpacing: 1,
                  }}
                >
                  {clamp(badge.toUpperCase(), 34)}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontSize: withImage ? 64 : 84,
              lineHeight: 1.05,
              letterSpacing: -1.5,
            }}
          >
            {clamp(title, withImage ? 70 : 90)}
          </div>
          {description && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.45,
                color: c.body,
              }}
            >
              {clamp(description, withImage ? 130 : 170)}
            </div>
          )}
        </div>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img>
          <img
            src={image}
            alt=""
            width={520}
            height={325}
            style={{
              borderRadius: 16,
              border: `1px solid ${c.hairline}`,
              objectFit: "cover",
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: "Geist Mono",
          fontSize: 20,
          color: c.muted,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 64,
            height: 4,
            backgroundColor: c.accent,
          }}
        />
        <span>
          Farhan Zulkarnain Harahap · Full-stack engineer · Medan, Indonesia
        </span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  );
}

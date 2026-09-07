import type { ImageLoaderProps } from "next/image";
export function validImageSource(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return ["https:", "http:"].includes(new URL(src).protocol);
  } catch {
    return false;
  }
}
export function isCloudinaryImage(src: string) {
  try {
    const url = new URL(src);
    return (
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}
/** Cloudinary supplies responsive widths and negotiated formats without a second image proxy. */
export function cloudinaryImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  return src.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_${quality || 75},c_limit,w_${width}/`,
  );
}

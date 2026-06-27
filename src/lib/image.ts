const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

export function getOptimizedImageUrl(url: string, width = 1200): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return url;
  }

  const transformation = `f_webp,q_auto:eco,c_limit,w_${width}`;
  const [baseUrl, query = ""] = url.split("?");
  const optimizedUrl = baseUrl.replace(
    CLOUDINARY_UPLOAD_SEGMENT,
    `${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/`,
  );

  return query ? `${optimizedUrl}?${query}` : optimizedUrl;
}

const IMAGE_BASE =
  process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "http://localhost:8080";

export const getImageUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${IMAGE_BASE}${normalized}`;
};

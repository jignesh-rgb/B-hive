/**
 * Utility function to get the correct image source URL.
 * For uploaded images (starting with /uploads), use backend URL.
 * For other images, assume they are in Next.js public folder.
 */
export function getImageSrc(imagePath?: string): string {
  if (!imagePath) return "/product_placeholder.jpg";

  // If it's an absolute URL, return as is
  if (imagePath.startsWith("http")) return imagePath;

  // For uploaded images, serve from backend
  if (imagePath.startsWith("/uploads")) {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${imagePath}`;
  }

  // For other relative paths, serve from Next.js public
  return `/${imagePath}`;
}
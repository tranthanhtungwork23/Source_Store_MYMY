import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001";

  try {
    const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });

    return [
      { url: baseUrl, lastModified: new Date(), priority: 1 },
      ...products.map((product) => ({
        url: `${baseUrl}/san-pham/${product.slug}`,
        lastModified: product.updatedAt,
        priority: 0.8,
      })),
    ];
  } catch {
    return [{ url: baseUrl, lastModified: new Date(), priority: 1 }];
  }
}

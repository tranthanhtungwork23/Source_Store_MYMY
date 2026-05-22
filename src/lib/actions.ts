"use server";

import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCouponType(value: string) {
  return value === "PERCENT" || value === "FIXED" ? value : "NONE";
}

async function saveUploadedImage(file: File | null) {
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
}

async function getOrderPricing(subtotal: number, couponCodeRaw?: string) {
  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const couponCode = String(couponCodeRaw || "").trim().toUpperCase();
  const baseShipping = settings?.defaultShippingFee || 0;
  const freeShippingFrom = settings?.freeShippingFrom || 0;
  const shippingFee = freeShippingFrom > 0 && subtotal >= freeShippingFrom ? 0 : baseShipping;

  let discount = 0;
  let appliedCouponCode: string | null = null;

  if (couponCode && settings?.couponCode && couponCode === settings.couponCode.toUpperCase()) {
    appliedCouponCode = settings.couponCode;
    if (settings.couponDiscountType === "PERCENT") {
      discount = Math.floor((subtotal * settings.couponDiscountValue) / 100);
    } else if (settings.couponDiscountType === "FIXED") {
      discount = settings.couponDiscountValue;
    }
  }

  discount = Math.max(0, Math.min(discount, subtotal));
  const total = Math.max(0, subtotal + shippingFee - discount);

  return {
    shippingFee,
    discount,
    total,
    couponCode: appliedCouponCode,
    settings,
  };
}

export async function createOrder(formData: FormData) {
  const items = JSON.parse(String(formData.get("items") || "[]")) as Array<{ id: number; quantity: number }>;
  if (!items.length) redirect("/?order=empty");

  const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.id) }, isActive: true } });
  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      priceSnapshot: product.price,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const pricing = await getOrderPricing(subtotal, String(formData.get("couponCode") || ""));

  await prisma.order.create({
    data: {
      code: `MY${Date.now()}`,
      customerName: String(formData.get("customerName") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      note: String(formData.get("note") || ""),
      subtotal,
      shippingFee: pricing.shippingFee,
      discount: pricing.discount,
      couponCode: pricing.couponCode,
      total: pricing.total,
      items: { create: orderItems },
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/orders");
  redirect(pricing.couponCode ? "/?order=success&coupon=applied" : "/?order=success");
}

export async function saveProduct(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || slugify(name)).trim();
  const uploadedImage = await saveUploadedImage(formData.get("imageFile") as File | null);
  const imageUrlInput = String(formData.get("imageUrl") || "").trim();

  const data = {
    name,
    slug,
    sku: String(formData.get("sku") || "").trim() || null,
    shortDescription: String(formData.get("shortDescription") || ""),
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    compareAtPrice: Number(formData.get("compareAtPrice") || 0) || null,
    stock: Number(formData.get("stock") || 0),
    imageUrl: uploadedImage || imageUrlInput || null,
    categoryId: Number(formData.get("categoryId")),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  };

  if (id) await prisma.product.update({ where: { id }, data });
  else await prisma.product.create({ data });

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProduct(id: number) {
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function deleteProduct(id: number) {
  await prisma.product.update({ where: { id }, data: { isActive: false, stock: 0 } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function saveCategory(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || slugify(name)).trim();
  const data = {
    name,
    slug,
    description: String(formData.get("description") || ""),
    sortOrder: Number(formData.get("sortOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };

  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function toggleCategory(id: number) {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  await prisma.category.update({ where: { id }, data: { isActive: !category.isActive } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function saveSettings(formData: FormData) {
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {
      siteName: String(formData.get("siteName") || ""),
      hotline: String(formData.get("hotline") || ""),
      zaloLink: String(formData.get("zaloLink") || ""),
      heroTitle: String(formData.get("heroTitle") || ""),
      heroDescription: String(formData.get("heroDescription") || ""),
      homeMetaTitle: String(formData.get("homeMetaTitle") || ""),
      homeMetaDescription: String(formData.get("homeMetaDescription") || ""),
      defaultShippingFee: Number(formData.get("defaultShippingFee") || 0),
      freeShippingFrom: Number(formData.get("freeShippingFrom") || 0),
      couponCode: String(formData.get("couponCode") || "").trim().toUpperCase() || null,
      couponDiscountType: normalizeCouponType(String(formData.get("couponDiscountType") || "NONE")),
      couponDiscountValue: Number(formData.get("couponDiscountValue") || 0),
    },
    create: {
      id: 1,
      siteName: String(formData.get("siteName") || "MyMy Đồ Ăn Vặt"),
      hotline: String(formData.get("hotline") || ""),
      zaloLink: String(formData.get("zaloLink") || ""),
      heroTitle: String(formData.get("heroTitle") || ""),
      heroDescription: String(formData.get("heroDescription") || ""),
      homeMetaTitle: String(formData.get("homeMetaTitle") || ""),
      homeMetaDescription: String(formData.get("homeMetaDescription") || ""),
      defaultShippingFee: Number(formData.get("defaultShippingFee") || 0),
      freeShippingFrom: Number(formData.get("freeShippingFrom") || 0),
      couponCode: String(formData.get("couponCode") || "").trim().toUpperCase() || null,
      couponDiscountType: normalizeCouponType(String(formData.get("couponDiscountType") || "NONE")),
      couponDiscountValue: Number(formData.get("couponDiscountValue") || 0),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function updateOrderStatus(formData: FormData) {
  await prisma.order.update({
    where: { id: Number(formData.get("id")) },
    data: { status: String(formData.get("status")) as never },
  });
  revalidatePath("/admin/orders");
}

export async function createManualOrder(formData: FormData) {
  const productIds = formData.getAll("productId").map((value) => Number(value)).filter(Boolean);
  const quantities = formData.getAll("quantity").map((value) => Number(value) || 0);
  const manualShippingFee = Number(formData.get("shippingFee") || 0);
  const couponCodeInput = String(formData.get("couponCode") || "");

  if (!productIds.length) redirect("/admin/orders/new?error=no-items");

  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  let subtotal = 0;
  const orderItems = productIds.map((productId, index) => {
    const product = products.find((item) => item.id === productId);
    const quantity = quantities[index] || 1;
    if (!product) throw new Error("Sản phẩm không tồn tại");
    const lineTotal = product.price * quantity;
    subtotal += lineTotal;
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      priceSnapshot: product.price,
      quantity,
      lineTotal,
    };
  });

  const pricing = await getOrderPricing(subtotal, couponCodeInput);
  const shippingFee = Math.max(0, manualShippingFee || pricing.shippingFee);
  const total = Math.max(0, subtotal + shippingFee - pricing.discount);

  await prisma.order.create({
    data: {
      code: `MY${Date.now()}`,
      customerName: String(formData.get("customerName") || "Khách lẻ"),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      note: String(formData.get("note") || "Tạo thủ công từ admin"),
      subtotal,
      shippingFee,
      discount: pricing.discount,
      couponCode: pricing.couponCode,
      total,
      status: String(formData.get("status") || "NEW") as never,
      items: { create: orderItems },
    },
  });

  revalidatePath("/admin/orders");
  redirect("/admin/orders?created=1");
}

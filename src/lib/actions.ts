"use server";

import { randomBytes } from "node:crypto";
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

function randomOrderCode() {
  return `MY${Date.now()}${randomBytes(3).toString("hex").toUpperCase()}`;
}

function randomLookupToken() {
  return randomBytes(24).toString("hex");
}

function redirectOrderError(code: string) {
  redirect(`/?order=${code}`);
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizePhone(value: FormDataEntryValue | null) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function validateCustomerFields(customerName: string, phone: string, address: string, note: string) {
  if (customerName.length < 2 || customerName.length > 80) redirectOrderError("invalid");
  if (!/^[0-9+]{8,15}$/.test(phone)) redirectOrderError("invalid");
  if (address.length < 5 || address.length > 200) redirectOrderError("invalid");
  if (note.length > 500) redirectOrderError("invalid");
}

function parseCartItems(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Array<{ id?: unknown; quantity?: unknown }>;
    if (!Array.isArray(parsed)) return null;

    const grouped = new Map<number, number>();

    for (const item of parsed) {
      const id = Number(item?.id);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(id) || id <= 0) continue;
      if (!Number.isFinite(quantity)) continue;
      const safeQty = Math.max(1, Math.min(20, Math.floor(quantity)));
      grouped.set(id, Math.min((grouped.get(id) || 0) + safeQty, 20));
    }

    return Array.from(grouped.entries()).map(([id, quantity]) => ({ id, quantity }));
  } catch {
    return null;
  }
}

async function createOrderRecord({
  items,
  customerName,
  phone,
  address,
  note,
  couponCode,
}: {
  items: Array<{ id: number; quantity: number }>;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  couponCode?: string;
}) {
  if (!items.length) redirectOrderError("empty");

  validateCustomerFields(customerName, phone, address, note);

  const result = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: items.map((i) => i.id) }, isActive: true },
      select: { id: true, name: true, price: true, stock: true },
    });

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) redirectOrderError("invalid");
      const existingProduct = product!;

      const safeQty = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));
      if (existingProduct.stock <= 0 || safeQty > existingProduct.stock) redirectOrderError("stock");

      const lineTotal = existingProduct.price * safeQty;
      subtotal += lineTotal;

      return {
        productId: existingProduct.id,
        productNameSnapshot: existingProduct.name,
        priceSnapshot: existingProduct.price,
        quantity: safeQty,
        lineTotal,
      };
    });

    const pricing = await getOrderPricing(subtotal, couponCode || "");

    for (const item of orderItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) redirectOrderError("stock");
    }

    const order = await tx.order.create({
      data: {
        code: randomOrderCode(),
        lookupToken: randomLookupToken(),
        customerName,
        phone,
        address,
        note: note || null,
        subtotal,
        shippingFee: pricing.shippingFee,
        discount: pricing.discount,
        couponCode: pricing.couponCode,
        total: pricing.total,
        items: { create: orderItems },
      },
      select: {
        id: true,
        code: true,
        lookupToken: true,
        total: true,
      },
    });

    return {
      ...pricing,
      order,
    };
  });

  return result;
}

export async function createOrder(formData: FormData) {
  const items = parseCartItems(String(formData.get("items") || "[]"));
  if (items === null) redirectOrderError("invalid");
  const safeItems = items!;

  const pricing = await createOrderRecord({
    items: safeItems,
    customerName: normalizeText(formData.get("customerName")),
    phone: normalizePhone(formData.get("phone")),
    address: normalizeText(formData.get("address")),
    note: normalizeText(formData.get("note")),
    couponCode: normalizeText(formData.get("couponCode")),
  });

  revalidatePath("/");
  revalidatePath("/admin/orders");
  redirect(`/dat-hang-thanh-cong?token=${encodeURIComponent(pricing.order.lookupToken!)}`);
}

export async function createProductOrder(formData: FormData) {
  const productId = Number(formData.get("productId") || 0);
  if (!Number.isInteger(productId) || productId <= 0) redirectOrderError("invalid");
  const quantity = Math.max(1, Math.min(20, Math.floor(Number(formData.get("quantity") || 1))));

  const pricing = await createOrderRecord({
    items: [{ id: productId, quantity }],
    customerName: normalizeText(formData.get("customerName")),
    phone: normalizePhone(formData.get("phone")),
    address: normalizeText(formData.get("address")),
    note: normalizeText(formData.get("note")),
    couponCode: "",
  });

  revalidatePath("/");
  revalidatePath("/admin/orders");
  redirect(`/dat-hang-thanh-cong?token=${encodeURIComponent(pricing.order.lookupToken!)}`);
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

export async function saveBlogPost(formData: FormData) {
  const id = Number(formData.get("id") || 0);
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || slugify(title)).trim();
  const uploadedImage = await saveUploadedImage(formData.get("coverImageFile") as File | null);
  const coverImageInput = String(formData.get("coverImageUrl") || "").trim();
  const isPublished = formData.get("isPublished") === "on";

  const currentPost = id ? await prisma.blogPost.findUnique({ where: { id } }) : null;
  const data = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || ""),
    content: String(formData.get("content") || ""),
    coverImageUrl: uploadedImage || coverImageInput || currentPost?.coverImageUrl || null,
    authorName: String(formData.get("authorName") || "MyMy Đồ Ăn Vặt"),
    metaTitle: String(formData.get("metaTitle") || "").trim() || null,
    metaDescription: String(formData.get("metaDescription") || "").trim() || null,
    isFeatured: formData.get("isFeatured") === "on",
    isPublished,
    publishedAt: isPublished ? currentPost?.publishedAt || new Date() : null,
  };

  if (id) await prisma.blogPost.update({ where: { id }, data });
  else await prisma.blogPost.create({ data });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function toggleBlogPost(id: number) {
  const post = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
  const isPublished = !post.isPublished;
  await prisma.blogPost.update({
    where: { id },
    data: { isPublished, publishedAt: isPublished ? post.publishedAt || new Date() : null },
  });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
}

export async function deleteBlogPost(id: number) {
  const post = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
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
      code: randomOrderCode(),
      lookupToken: randomLookupToken(),
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


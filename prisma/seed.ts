import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "12345678", 10);

  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@mymy.local" },
    update: { passwordHash },
    create: {
      email: process.env.ADMIN_EMAIL || "admin@mymy.local",
      name: "Quản trị MyMy",
      passwordHash,
    },
  });

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "MyMy Đồ Ăn Vặt",
      hotline: "0900 000 000",
      zaloLink: "https://zalo.me/0900000000",
      heroTitle: "Bánh tráng, đậu phộng và đồ ăn vặt ship nhanh",
      heroDescription:
        "Website bán hàng v2 có database, admin riêng, quản lý sản phẩm và đơn hàng thật.",
      homeMetaTitle: "MyMy Đồ Ăn Vặt | Bán Bánh Tráng Online",
      homeMetaDescription:
        "Đặt bánh tráng, đậu phộng và đồ ăn vặt online. Menu cập nhật từ admin, có giỏ hàng và đơn hàng thật.",
    },
  });

  const categories = [
    { name: "Bánh tráng", slug: "banh-trang", description: "Các món bánh tráng trộn, cuốn, chấm." },
    { name: "Đậu phộng", slug: "dau-phong", description: "Đậu phộng rang tỏi ớt, rang muối." },
    { name: "Đồ uống", slug: "do-uong", description: "Trà tắc, nước giải khát ăn kèm." },
  ];

  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { ...category, sortOrder: index + 1 },
      create: { ...category, sortOrder: index + 1 },
    });
  }

  const banhTrang = await prisma.category.findUniqueOrThrow({ where: { slug: "banh-trang" } });
  const dauPhong = await prisma.category.findUniqueOrThrow({ where: { slug: "dau-phong" } });
  const doUong = await prisma.category.findUniqueOrThrow({ where: { slug: "do-uong" } });

  const products = [
    {
      name: "Bánh tráng trộn đặc biệt",
      slug: "banh-trang-tron-dac-biet",
      sku: "MY-BT-001",
      shortDescription: "Mix tôm khô, bò khô, trứng cút, xoài xanh và sốt me cay.",
      description: "Món best-seller phù hợp khách thích vị đậm, cay vừa, topping nhiều.",
      price: 35000,
      compareAtPrice: 42000,
      stock: 50,
      isFeatured: true,
      sortOrder: 1,
      categoryId: banhTrang.id,
    },
    {
      name: "Bánh tráng cuốn sốt phô mai",
      slug: "banh-trang-cuon-sot-pho-mai",
      sku: "MY-BT-002",
      shortDescription: "Bánh tráng cuốn mềm, sốt phô mai béo nhẹ, dễ ăn.",
      description: "Phù hợp khách không ăn cay mạnh, trẻ em và dân văn phòng.",
      price: 32000,
      stock: 40,
      isFeatured: true,
      sortOrder: 2,
      categoryId: banhTrang.id,
    },
    {
      name: "Đậu phộng rang tỏi ớt",
      slug: "dau-phong-rang-toi-ot",
      sku: "MY-DP-001",
      shortDescription: "Đậu phộng rang giòn, phủ tỏi ớt thơm cay nhẹ.",
      description: "Ăn kèm bánh tráng hoặc dùng làm snack riêng đều hợp.",
      price: 29000,
      stock: 70,
      isFeatured: true,
      sortOrder: 3,
      categoryId: dauPhong.id,
    },
    {
      name: "Trà tắc hạt é",
      slug: "tra-tac-hat-e",
      sku: "MY-DU-001",
      shortDescription: "Trà tắc mát lạnh, cân bằng vị cay của bánh tráng.",
      description: "Đồ uống bán kèm giúp tăng giá trị đơn hàng.",
      price: 18000,
      stock: 80,
      sortOrder: 4,
      categoryId: doUong.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

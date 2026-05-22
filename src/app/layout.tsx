import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const font = Be_Vietnam_Pro({ subsets: ["vietnamese"], weight: ["400", "500", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "MyMy Đồ Ăn Vặt",
  description: "Website bán đồ ăn vặt giao nhanh, đặt món trực tuyến dễ dàng.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={font.className} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

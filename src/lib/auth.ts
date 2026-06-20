import * as bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSignedSession, isProductionHttps, readSignedSession } from "@/lib/security";

const COOKIE_NAME = "mymy_admin_session";

export async function loginAdmin(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) {
    redirect("/admin/login?error=not-found");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    redirect("/admin/login?error=wrong-password");
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createSignedSession(admin.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionHttps(),
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  "use server";
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  const store = await cookies();
  const session = readSignedSession(store.get(COOKIE_NAME)?.value);
  if (!session) return null;

  return prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

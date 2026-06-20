import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const setting = await prisma.siteSetting.findUnique({ where: { id: 1 } });

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section>
          <h1 className="text-3xl font-black sm:text-4xl">Cài đặt website</h1>
          <p className="mt-2 text-stone-600">Sửa thông tin này sẽ cập nhật trực tiếp ra trang chủ, phí ship, coupon và metadata.</p>

          <form action={saveSettings} className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="font-bold">Tên shop</span>
              <input name="siteName" defaultValue={setting?.siteName || ""} required className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2">
              <span className="font-bold">Hotline</span>
              <input name="hotline" defaultValue={setting?.hotline || ""} className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2">
              <span className="font-bold">Link Zalo</span>
              <input name="zaloLink" defaultValue={setting?.zaloLink || ""} className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2">
              <span className="font-bold">Phí ship mặc định</span>
              <input name="defaultShippingFee" type="number" defaultValue={setting?.defaultShippingFee || 0} className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">Freeship từ đơn</span>
              <input name="freeShippingFrom" type="number" defaultValue={setting?.freeShippingFrom || 0} className="w-full rounded-xl border p-3" />
            </label>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 md:col-span-2">
              <h2 className="text-lg font-black text-orange-700">Coupon khuyến mãi</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="font-bold">Mã coupon</span>
                  <input name="couponCode" defaultValue={setting?.couponCode || ""} placeholder="VD: GIAM10" className="w-full rounded-xl border p-3" />
                </label>
                <label className="space-y-2">
                  <span className="font-bold">Loại giảm giá</span>
                  <select name="couponDiscountType" defaultValue={setting?.couponDiscountType || "NONE"} className="w-full rounded-xl border p-3">
                    <option value="NONE">Không áp dụng</option>
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Giảm tiền cố định</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="font-bold">Giá trị giảm</span>
                  <input name="couponDiscountValue" type="number" defaultValue={setting?.couponDiscountValue || 0} className="w-full rounded-xl border p-3" />
                </label>
              </div>
            </div>

            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">Tiêu đề hero trang chủ</span>
              <input name="heroTitle" defaultValue={setting?.heroTitle || ""} required className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">Mô tả hero</span>
              <textarea name="heroDescription" defaultValue={setting?.heroDescription || ""} required className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">SEO title trang chủ</span>
              <input name="homeMetaTitle" defaultValue={setting?.homeMetaTitle || ""} required className="w-full rounded-xl border p-3" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">Meta description trang chủ</span>
              <textarea name="homeMetaDescription" defaultValue={setting?.homeMetaDescription || ""} required className="w-full rounded-xl border p-3" />
            </label>
            <button className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Lưu cài đặt</button>
          </form>
        </section>
      </div>
    </main>
  );
}

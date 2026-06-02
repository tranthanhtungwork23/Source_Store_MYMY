type ProductFallbackVisualProps = {
  name: string;
  categoryName?: string;
  compact?: boolean;
};

export function ProductFallbackVisual({ name, categoryName, compact = false }: ProductFallbackVisualProps) {
  const label = name.trim().charAt(0).toUpperCase() || "M";
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,#fed7aa_0,#fffbeb_42%,#fff7ed_100%)] p-3 text-center text-stone-700">
      <span className={`${compact ? "h-11 w-11 text-xl" : "h-16 w-16 text-3xl"} flex items-center justify-center rounded-full bg-white/85 font-black text-orange-700 shadow-sm ring-1 ring-orange-100`}>
        {label}
      </span>
      <span className={`${compact ? "mt-2 text-[10px]" : "mt-3 text-xs"} font-black uppercase tracking-[0.18em] text-orange-700`}>
        {categoryName || "Món ăn vặt"}
      </span>
      <span className={`${compact ? "mt-1 text-[10px]" : "mt-2 text-xs"} font-semibold text-stone-500`}>
        Ảnh món đang cập nhật
      </span>
    </div>
  );
}

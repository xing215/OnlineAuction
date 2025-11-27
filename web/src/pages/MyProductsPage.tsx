import { Inventory2Rounded, VisibilityRounded } from "@mui/icons-material";
import { useMyProducts } from "../hooks/useMyProducts";
import { formatCurrency } from "../ultilities/FormatCurrency";

const accentClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

const formatBidder = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function MyProductsPage() {
  const { activeTab, setActiveTab, stats, tabOptions, products } = useMyProducts();

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-[#3E3C31] md:px-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-base font-medium text-[#3E3C31]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#D5AD41] to-[#F4D799] text-[#3E3C31]">
                <Inventory2Rounded />
              </div>
              <h1 className="text-2xl font-semibold">Sản phẩm của tôi</h1>
            </div>
            <p className="text-sm text-[#6B6B6B]">Quản lý các sản phẩm bạn đã đăng</p>
          </div>
          <button
            type="button"
            className="w-full rounded-2xl bg-gradient-to-b from-[#D5AD41] to-[#F4D799] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg md:w-auto"
          >
            + Đăng sản phẩm mới
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#3E3C31]/10 bg-white px-6 py-5 shadow-sm"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses[item.accent] ?? "bg-gray-50 text-[#3E3C31]"}`}>
                <Inventory2Rounded fontSize="small" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-[#3E3C31]">{item.value}</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-[#F7F7F7] p-1">
          <div className="flex flex-wrap gap-2">
            {tabOptions.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-white text-[#3E3C31] shadow" : "text-[#3E3C31]/70 hover:bg-white/60"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#3E3C31]/20 bg-white px-6 py-12 text-center text-sm text-[#6B6B6B]">
              Chưa có sản phẩm nào trong mục này.
            </div>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col gap-4 rounded-3xl border border-[#3E3C31]/15 bg-white p-4 shadow-sm md:flex-row md:items-center md:gap-6 md:p-6"
              >
                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-[#F5F5F5]">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-base font-medium text-[#3E3C31]">{product.title}</h2>
                  </div>
                  <div className="grid gap-2 text-sm text-[#6B6B6B] md:grid-cols-3">
                    <p>
                      Giá hiện tại: <span className="font-semibold text-[#D5AD41]">{formatCurrency(product.currentPrice)}</span>
                    </p>
                    <p>
                      Lượt đặt giá: <span className="text-[#3E3C31]">{product.bidCount}</span>
                    </p>
                    <p>
                      Người cao nhất: <span className="text-[#3E3C31]">{formatBidder(product.highestBidder)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-stretch justify-between gap-3 md:items-end">
                  <span className="inline-flex items-center rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    Đang đấu giá
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#3E3C31]/15 bg-neutral-50 px-4 py-2 text-sm text-[#3E3C31] transition hover:bg-neutral-100"
                    >
                      <VisibilityRounded fontSize="small" />
                      <span>Xem</span>
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-[#D5AD41] px-4 py-2 text-sm font-medium text-[#3E3C31] transition hover:bg-[#c49a37]"
                    >
                      Xem giao dịch
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

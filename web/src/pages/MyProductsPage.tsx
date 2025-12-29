import { Inventory2Rounded, VisibilityRounded, RateReview, CancelRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMyProducts } from "../hooks/useMyProducts";
import { useUser } from "../context/useUser";
import { MyProductsLoginPrompt } from "../components/Product/MyProductsLoginPrompt";
import { RatingModal } from "../components/Product/RatingModal";
import { CancelOrderModal } from "../components/Product/CancelOrderModal";
import { MyProductsStatsSkeleton } from "../components/Product/MyProductsStatsSkeleton";
import { MyProductsTabsSkeleton } from "../components/Product/MyProductsTabsSkeleton";
import { MyProductsCardSkeleton } from "../components/Product/MyProductsCardSkeleton";
import { formatCurrency } from "../utilities";
import "./MyProductsPage.css";

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
  const navigate = useNavigate();
  const { user, loading: authLoading, token } = useUser();
  const { activeTab, setActiveTab, stats, tabOptions, products, loading, error } = useMyProducts();
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string>("");

  if (authLoading) {
    return (
      <div className="my-products-page">
        <div className="my-products-page__inner">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D5AD41] border-r-transparent"></div>
              <p className="mt-4 text-sm text-[#6B6B6B]">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <MyProductsLoginPrompt />;
  }

  if (loading) {
    return (
      <div className="my-products-page">
        <div className="my-products-page__inner">
          <div className="my-products-page__header">
            <div className="my-products-page__title-block">
              <div className="flex items-center gap-3 text-base font-medium text-[#3E3C31]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#D5AD41] to-[#F4D799] text-[#3E3C31]">
                  <Inventory2Rounded />
                </div>
                <h1 className="text-2xl font-semibold">Sản phẩm của tôi</h1>
              </div>
              <p className="text-sm text-[#6B6B6B]">Quản lý các sản phẩm bạn đã đăng</p>
            </div>
            <div className="my-products-page__cta rounded-2xl bg-gradient-to-b from-[#D5AD41] to-[#F4D799] px-6 py-3 text-sm font-semibold text-white shadow-md">
              + Đăng sản phẩm mới
            </div>
          </div>

          <MyProductsStatsSkeleton />

          <MyProductsTabsSkeleton />

          <div className="my-products-page__products">
            {Array.from({ length: 4 }).map((_, index) => (
              <MyProductsCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-products-page">
        <div className="my-products-page__inner">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="text-sm text-red-600">Lỗi: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-products-page">
      <div className="my-products-page__inner">
        <div className="my-products-page__header">
          <div className="my-products-page__title-block">
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
            onClick={() => navigate('/my-products/new')}
            className="my-products-page__cta rounded-2xl bg-gradient-to-b from-[#D5AD41] to-[#F4D799] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg cursor-pointer"
          >
            + Đăng sản phẩm mới
          </button>
        </div>

        <div className="my-products-page__stats">
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
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition cursor-pointer ${
                    isActive ? "bg-white text-[#3E3C31] shadow" : "text-[#3E3C31]/70 hover:bg-white/60"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="my-products-page__products">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#3E3C31]/20 bg-white px-6 py-12 text-center text-sm text-[#6B6B6B]">
              Chưa có sản phẩm nào trong mục này.
            </div>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="my-products-page__product-card rounded-3xl border border-[#3E3C31]/15 bg-white shadow-sm"
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
                  <div className="my-products-page__product-meta text-sm text-[#6B6B6B]">
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
                <div className="my-products-page__product-actions">
                  {activeTab !== "ongoing" && (
                    <span className={`inline-flex items-center rounded-2xl px-3 py-1 text-xs font-medium ${
                      product.orderStatus === "pending"
                        ? "bg-blue-50 text-blue-600"
                        : product.orderStatus === "paid"
                        ? "bg-yellow-50 text-yellow-600"
                        : product.orderStatus === "shipped"
                        ? "bg-purple-50 text-purple-600"
                        : product.orderStatus === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : product.orderStatus === "cancelled"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-600"
                    }`}>
                      {product.orderStatus === "pending"
                        ? "Chờ xử lý"
                        : product.orderStatus === "paid"
                        ? "Đã thanh toán"
                        : product.orderStatus === "shipped"
                        ? "Đang vận chuyển"
                        : product.orderStatus === "completed"
                        ? "Hoàn tất"
                        : product.orderStatus === "cancelled"
                        ? "Đã hủy"
                        : "Đã bán"}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#3E3C31]/15 bg-neutral-50 px-4 py-2 text-sm text-[#3E3C31] transition hover:bg-neutral-100 cursor-pointer"
                    >
                      <VisibilityRounded fontSize="small" />
                      <span>Xem</span>
                    </button>
                    {product.status !== "ongoing" && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(product.orderId ? `/orders/${product.orderId}` : `/orders`)}
                          className="rounded-2xl bg-[#D5AD41] px-4 py-2 text-sm font-medium text-[#3E3C31] transition hover:bg-[#c49a37] cursor-pointer"
                        >
                          Xem giao dịch
                        </button>
                        {product.orderId && activeTab !== "ongoing" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderId(product.orderId!);
                                setRatingModalOpen(true);
                              }}
                              title="Đánh giá"
                              className="inline-flex items-center justify-center rounded-2xl bg-[#D5AD41] p-2 text-[#3E3C31] transition hover:bg-[#c49a37] cursor-pointer"
                            >
                              <RateReview fontSize="small" />
                            </button>
                        )}
                        {product.orderId && activeTab === "sold" && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelOrderId(product.orderId!);
                                setIsCancelModalOpen(true);
                              }}
                              disabled={product.orderStatus !== "pending"}
                              title={product.orderStatus === "pending" ? "Hủy giao dịch" : "Chỉ có thể hủy đơn đang chờ xử lý"}
                              className={`inline-flex items-center justify-center rounded-2xl p-2 text-white transition ${
                                product.orderStatus === "pending"
                                  ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                                  : "bg-gray-400 cursor-not-allowed opacity-50"
                              }`}
                            >
                              <CancelRounded fontSize="small" />
                            </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
      {token && (
        <>
          <RatingModal
            isOpen={ratingModalOpen}
            onClose={() => {
              setRatingModalOpen(false);
              setSelectedOrderId("");
            }}
            orderId={selectedOrderId}
            token={token}
          />
          <CancelOrderModal
            isOpen={isCancelModalOpen}
            onClose={() => {
              setIsCancelModalOpen(false);
              setCancelOrderId("");
            }}
            orderId={cancelOrderId}
            token={token}
          />
        </>
      )}
    </div>
  );
}

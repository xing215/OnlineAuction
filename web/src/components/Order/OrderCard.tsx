import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, AlertCircle } from "lucide-react";
import type { OrderView } from "../../types";
import { getOrderStatusLabel, getOrderStatusColor } from "../../utilities/orderStatusUtils";

interface OrderCardProps {
  order: OrderView;
  currentUserId: string | undefined;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, currentUserId }) => {
  const navigate = useNavigate();

  // Lấy dữ liệu từ trường _detail để hiển thị
  const product = order.product_detail;
  const seller = order.seller_detail;
  const winner = order.winner_detail;

  // Logic vai trò
  const isSeller = order.seller === currentUserId;
  const partner = isSeller ? winner : seller;
  const roleLabel = isSeller ? "Người mua" : "Người bán";
  const isCancelled = order.status === "cancelled";

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all mb-4">
      <div className="flex gap-4">
        {/* ẢNH SẢN PHẨM */}
        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border shrink-0 relative">
          {product?.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover ${
                isCancelled ? "grayscale opacity-75" : ""
              }`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              No Image
            </div>
          )}
          {/* Overlay nếu hủy */}
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="text-[10px] font-bold bg-gray-800 text-white px-2 py-1 rounded">
                ĐÃ HỦY
              </span>
            </div>
          )}
        </div>

        {/* THÔNG TIN */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3
                className={`font-bold text-lg line-clamp-1 ${
                  isCancelled ? "text-gray-500 line-through" : "text-gray-800"
                }`}
              >
                {product?.name || "Sản phẩm ẩn"}
              </h3>
              <span
                className={`inline-flex items-center rounded-2xl px-3 py-1 text-xs font-medium whitespace-nowrap ${
                  getOrderStatusColor(order.status)
                }`}
              >
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Mã đơn:{" "}
              <span className="font-mono">
                #{order.id?.slice(-6).toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {roleLabel}:{" "}
              <span className="font-bold text-gray-800">
                {partner?.full_name || "Unknown"}
              </span>
            </p>
          </div>
          <div
            className={`text-xl font-bold text-right ${
              isCancelled ? "text-gray-400" : "text-yellow-600"
            }`}
          >
            {formatMoney(order.final_price)}
          </div>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="mt-4 pt-4 border-t flex justify-end gap-2">
        <button
          onClick={() => navigate(`/orders/${order.id}`)}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition cursor-pointer ${
            isCancelled
              ? "border border-[#3E3C31]/15 bg-neutral-50 text-[#3E3C31] hover:bg-neutral-100"
              : "bg-[#D5AD41] text-[#3E3C31] hover:bg-[#c49a37]"
          }`}
        >
          {isCancelled ? (
            <AlertCircle size={16} />
          ) : (
            <MessageCircle size={16} />
          )}
          {isCancelled ? "Xem chi tiết hủy đơn" : "Chi tiết & Trao đổi"}
        </button>
      </div>
    </div>
  );
};

export default OrderCard;

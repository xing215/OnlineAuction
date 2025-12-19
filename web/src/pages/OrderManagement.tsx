import React, { useState, useEffect } from "react";
import { PackageOpen } from "lucide-react";
import OrderCard from "../components/Order/OrderCard";
import type { OrderView, OrderResponse } from "../types";
import { useUser } from "../context/useUser";
import { apiUrl } from "../config/api";

const OrderManagement: React.FC = () => {
  // Lấy user và token từ Context
  const { user, token, loading: authLoading } = useUser();

  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ thanh toán" },
    { id: "shipped", label: "Đang vận chuyển" },
    { id: "completed", label: "Hoàn tất" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  useEffect(() => {
    // Nếu auth đang load hoặc chưa có token thì chưa gọi API
    if (authLoading || !token) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          apiUrl(`api/orders/my-orders?status=${activeTab}`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: OrderResponse = await response.json();
          if (data.success) setOrders(data.data);
        }
      } catch (err) {
        console.error("Lỗi fetch đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, token, authLoading]); // Thêm dependencies

  // Hiển thị trạng thái đang tải user
  if (authLoading)
    return <div className="p-10 text-center">Đang tải thông tin...</div>;

  // Nếu tải xong mà không có user
  if (!user)
    return (
      <div className="p-10 text-center text-red-500">
        Vui lòng đăng nhập để xem đơn hàng.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý đơn hàng
        </h1>

        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-yellow-500 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  currentUserId={user._id || user.id}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <PackageOpen size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Chưa có đơn hàng nào.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;

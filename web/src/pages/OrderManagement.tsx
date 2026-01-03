import React, { useState, useEffect } from "react";
import { PackageOpen } from "lucide-react";
import OrderCard from "../components/Order/OrderCard";
import { OrderLoginPrompt } from "../components/Order/OrderLoginPrompt";
import type { OrderView, OrderResponse } from "../types";
import { useUser } from "../context/useUser";
import { apiUrl } from "../config/api";
import toast from "react-hot-toast";

const OrderManagement: React.FC = () => {
  // Lấy user và token từ Context
  const { user, token, loading: authLoading } = useUser();

  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all"); // Thêm role filter

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ thanh toán" },
    { id: "paid", label: "Đã thanh toán" },
    { id: "shipped", label: "Đang vận chuyển" },
    { id: "completed", label: "Hoàn tất" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  const roleFilters = [
    { id: "all", label: "Tất cả" },
    { id: "buyer", label: "Đơn mua" },
    { id: "seller", label: "Đơn bán" },
  ];

  useEffect(() => {
    // Nếu auth đang load hoặc chưa có token thì chưa gọi API
    if (authLoading || !token) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('status', activeTab);
        if (roleFilter !== 'all') {
          params.append('role', roleFilter);
        }

        const response = await fetch(
          apiUrl(`api/orders/my-orders?${params.toString()}`),
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
        } else {
          toast.error("Không thể tải danh sách đơn hàng");
        }
      } catch {
        toast.error("Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, roleFilter, token, authLoading]); // Thêm roleFilter vào dependencies

  // Hiển thị trạng thái đang tải user
  if (authLoading)
    return <div className="p-10 text-center">Đang tải thông tin...</div>;

  // Nếu tải xong mà không có user
  if (!user)
    return <OrderLoginPrompt />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý đơn hàng
          </h1>
          <p className="text-gray-500">Theo dõi và quản lý các đơn hàng của bạn</p>
        </div>

        {/* FILTERS CONTAINER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 space-y-6">
          {/* ROLE FILTER */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Loại đơn hàng</span>
            </div>
            <div className="rounded-2xl bg-[#F7F7F7] p-1">
              <div className="flex gap-2">
                {roleFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setRoleFilter(filter.id)}
                    className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                      roleFilter === filter.id
                        ? "bg-white text-[#3E3C31] shadow"
                        : "text-[#3E3C31]/70 hover:bg-white/60"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-gray-100"></div>

          {/* STATUS TABS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Trạng thái</span>
            </div>
            <div className="rounded-2xl bg-[#F7F7F7] p-1">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white text-[#3E3C31] shadow"
                        : "text-[#3E3C31]/70 hover:bg-white/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
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

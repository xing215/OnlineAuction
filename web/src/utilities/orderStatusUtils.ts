// Utility functions for order status translations and formatting

export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";

// Map order status to Vietnamese labels
export const getOrderStatusLabel = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    shipped: "Đang vận chuyển",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

// Get color classes for status badge
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    pending: "bg-blue-50 text-blue-600",
    paid: "bg-yellow-50 text-yellow-600",
    shipped: "bg-purple-50 text-purple-600",
    completed: "bg-emerald-50 text-emerald-600",
    cancelled: "bg-red-50 text-red-600",
  };
  return colorMap[status] || "bg-gray-50 text-gray-600";
};

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Truck,
  Package,
  Star,
  Upload,
  ExternalLink,
  X,
} from "lucide-react";
import OrderChat from "../components/Order/OrderChat";
import type { OrderView, OrderDetailResponse } from "../types";
import { useUser } from "../context/useUser";
import { apiUrl } from "../config/api";
import toast from "react-hot-toast";
import { ConfirmModal } from "../components/ConfirmModal";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Lấy Token và User từ Context
  const { user, token, loading: authLoading } = useUser();

  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- STATE MODAL HỦY ---
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // --- STATE MODAL ĐÁNH GIÁ ---
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<1 | -1>(1);
  const [feedbackComment, setFeedbackComment] = useState("");

  // --- STATE MODAL XÁC NHẬN ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  // --- STATE FORM THANH TOÁN / GIAO HÀNG ---
  const [address, setAddress] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch dữ liệu chi tiết đơn hàng
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setError("Vui lòng đăng nhập để xem chi tiết.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const response = await fetch(apiUrl(`api/orders/${orderId}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 403)
            throw new Error("Bạn không có quyền xem đơn hàng này.");
          if (response.status === 404)
            throw new Error("Không tìm thấy đơn hàng.");
          throw new Error("Lỗi tải dữ liệu.");
        }

        const data: OrderDetailResponse = await response.json();
        if (data.success) {
          setOrder(data.data);
          const shippingAddr = data.data.shipping_address;
          if (shippingAddr && 
              !shippingAddr.toLowerCase().includes('pending') && 
              !shippingAddr.toLowerCase().includes('awaiting')) {
            setAddress(shippingAddr);
          }
        } else {
          throw new Error("Không tải được dữ liệu.");
        }
      } catch (err: unknown) {
        console.error("Lỗi tải chi tiết:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchDetail();
  }, [orderId, token, authLoading]);

  // --- XỬ LÝ FILE ẢNH (DRAG & DROP) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/"))
        return toast.error("Chỉ chấp nhận file ảnh");
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/"))
        return toast.error("Chỉ chấp nhận file ảnh");
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProofFile(null);
    setProofPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- CÁC HÀM GỌI API ---

  // 1. Seller Hủy đơn
  const submitCancellation = async () => {
    if (!cancelReason.trim()) return toast.error("Vui lòng nhập lý do hủy đơn.");
    
    setConfirmConfig({
      title: 'Xác nhận hủy đơn',
      message: 'Hành động này không thể hoàn tác. Bạn chắc chắn muốn hủy đơn hàng này?',
      confirmText: 'Hủy đơn',
      type: 'danger',
      onConfirm: executeCancellation
    });
    setIsConfirmModalOpen(true);
  };

  const executeCancellation = async () => {
    setIsConfirmModalOpen(false);
    setActionLoading(true);
    try {
      const response = await fetch(apiUrl(`api/orders/${orderId}/cancel`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Đã hủy đơn thành công.");
        window.location.reload();
      } else {
        toast.error(resData.message || "Lỗi khi hủy đơn.");
      }
    } catch {
      toast.error("Lỗi kết nối.");
    } finally {
      setActionLoading(false);
      setIsCancelModalOpen(false);
    }
  };

  // 2. Buyer Thanh toán (Gửi FormData)
  const handleBuyerPay = async () => {
    if (!address.trim()) return toast.error("Vui lòng nhập địa chỉ");
    if (!proofFile) return toast.error("Vui lòng tải lên ảnh chuyển khoản");

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("address", address);
      formData.append("images", proofFile);

      const response = await fetch(apiUrl(`api/orders/${orderId}/pay`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) window.location.reload();
      else {
        const data = await response.json();
        toast.error(data.message || "Lỗi khi cập nhật thanh toán");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Seller Gửi hàng (Gửi FormData)
  const handleSellerShip = async () => {
    if (!proofFile) return toast.error("Vui lòng tải lên ảnh vận đơn");

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("images", proofFile);

      const response = await fetch(apiUrl(`api/orders/${orderId}/ship`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) window.location.reload();
      else {
        const data = await response.json();
        toast.error(data.message || "Lỗi khi cập nhật vận chuyển");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Buyer Nhận hàng
  const handleConfirmReceipt = async () => {
    setConfirmConfig({
      title: 'Xác nhận nhận hàng',
      message: 'Bạn xác nhận đã nhận được hàng và hài lòng với sản phẩm?',
      confirmText: 'Xác nhận',
      type: 'info',
      onConfirm: executeConfirmReceipt
    });
    setIsConfirmModalOpen(true);
  };

  const executeConfirmReceipt = async () => {
    setIsConfirmModalOpen(false);
    setActionLoading(true);
    try {
      const response = await fetch(
        apiUrl(`api/orders/${orderId}/confirm-receipt`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) window.location.reload();
      else toast.error("Lỗi xác nhận");
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Gửi Đánh giá
  const submitFeedback = async () => {
    if (!feedbackComment.trim())
      return toast.error("Vui lòng nhập nội dung đánh giá");
    setActionLoading(true);
    try {
      const response = await fetch(apiUrl(`api/orders/${orderId}/feedback`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: feedbackScore,
          comment: feedbackComment,
        }),
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Đánh giá thành công!");
        window.location.reload();
      } else toast.error(resData.message || "Lỗi gửi đánh giá");
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setActionLoading(false);
      setIsFeedbackModalOpen(false);
    }
  };

  // --- UI HELPER: Dropzone ---
  const renderProofUploader = (label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-yellow-400 transition bg-white relative overflow-hidden"
      >
        {proofPreview ? (
          <div className="relative w-full h-full p-2 group">
            <img
              src={proofPreview}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center p-4">
            <Upload size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Kéo thả ảnh vào đây
            </p>
            <p className="text-xs text-gray-400 mt-1">
              hoặc click để chọn file (JPG, PNG)
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );

  // --- RENDER CHÍNH ---

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );

  if (error || !order || !user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-red-500 font-medium mb-4">
          {error || "Không tìm thấy đơn hàng"}
        </div>
        <button
          onClick={() => navigate("/order")}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 cursor-pointer"
        >
          <ChevronLeft size={16} /> Quay lại danh sách
        </button>
      </div>
    );

  const currentUserId = user._id || user.id;
  const isSeller = order.seller === currentUserId;
  const partner = isSeller ? order.winner_detail : order.seller_detail;
  const roleTitle = isSeller ? "Người mua" : "Người bán";
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const steps = ["pending", "paid", "shipped", "completed"];
  const currentStepIndex =
    order.status === "cancelled" ? -1 : steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 1. HEADER */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/order")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition cursor-pointer"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          <div className="text-sm text-gray-500">
            Mã đơn:{" "}
            <span className="font-mono font-bold text-gray-700">
              #{orderId?.slice(-6).toUpperCase()}
            </span>
            <span className="mx-2">|</span>
            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>

        {/* 2. STATUS STEPPER */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          {isCancelled ? (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
              <AlertTriangle size={24} />
              <div>
                <h3 className="font-bold">Đơn hàng đã bị hủy</h3>
                <p className="text-sm opacity-80">
                  Lý do: {order.cancellation?.reason || "Không có lý do"}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded"></div>
              <div
                className="absolute top-5 left-0 h-1 bg-green-500 transition-all duration-500 rounded"
                style={{ width: `${(currentStepIndex / 3) * 100}%` }}
              ></div>

              <div className="flex justify-between relative z-10">
                {[
                  { key: "pending", label: "Thanh toán", icon: CreditCard },
                  { key: "paid", label: "Vận chuyển", icon: Package },
                  { key: "shipped", label: "Nhận hàng", icon: Truck },
                  { key: "completed", label: "Hoàn tất", icon: CheckCircle },
                ].map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center cursor-default"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                          isActive
                            ? "bg-green-500 border-green-100 text-white shadow-md scale-110"
                            : "bg-white border-gray-100 text-gray-300"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isCurrent
                            ? "text-green-600 font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3. LEFT COLUMN: PROCESS & INFO */}
          <div className="lg:col-span-2 space-y-6">
            {/* PRODUCT CARD */}
            <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 items-center">
              <img
                src={order.product_detail?.images?.[0] || "placeholder.jpg"}
                className="w-20 h-20 rounded-lg object-cover border"
                alt="Product"
              />
              <div>
                <h2 className="font-bold text-gray-800">
                  {order.product_detail?.name || "Sản phẩm ẩn"}
                </h2>
                <p className="text-yellow-600 font-bold text-lg">
                  {formatMoney(order.final_price)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold text-gray-700">
                    {roleTitle}:
                  </span>{" "}
                  {partner?.full_name} ({partner?.email})
                </p>
              </div>
            </div>

            {/* --- PROCESS STEPS --- */}
            {!isCancelled && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
                  <Truck size={18} /> Tiến độ xử lý
                </div>
                <div className="p-6">
                  {/* BƯỚC 1: PENDING */}
                  {order.status === "pending" && (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm mb-4">
                        Đơn hàng đang chờ thanh toán.
                      </div>

                      {isSeller ? (
                        <div className="text-center py-6 text-gray-500 italic">
                          Đang chờ người mua thanh toán và cập nhật thông tin...
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              Địa chỉ nhận hàng
                            </label>
                            <div className="relative">
                              <MapPin
                                className="absolute left-3 top-3 text-gray-400"
                                size={18}
                              />
                              <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900 bg-white"
                                placeholder="Nhập địa chỉ nhận hàng..."
                              />
                            </div>
                          </div>
                          {/* Dropzone Ảnh chuyển khoản */}
                          {renderProofUploader(
                            "Ảnh minh chứng chuyển khoản (Bill)"
                          )}

                          <button
                            onClick={handleBuyerPay}
                            disabled={actionLoading}
                            className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition cursor-pointer disabled:cursor-not-allowed"
                          >
                            {actionLoading
                              ? "Đang xử lý..."
                              : "Xác nhận đã thanh toán"}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* BƯỚC 2: PAID */}
                  {order.status === "paid" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4">
                        Người mua đã thanh toán.
                      </div>
                      {/* Info */}
                      <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-2">
                        <p className="text-gray-700">
                          <strong>Địa chỉ nhận:</strong>{" "}
                          {order.shipping_address}
                        </p>
                        <p className="text-gray-700">
                          <strong>Ảnh thanh toán:</strong>
                        </p>
                        {order.payment_proof ? (
                          <a
                            href={order.payment_proof}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink size={14} /> Xem ảnh chuyển khoản
                          </a>
                        ) : (
                          <span className="text-red-500">Không có ảnh</span>
                        )}
                      </div>

                      {isSeller ? (
                        <div className="pt-4 border-t">
                          {/* Dropzone Ảnh vận đơn */}
                          {renderProofUploader("Ảnh vận đơn (Shipping Bill)")}

                          <button
                            onClick={handleSellerShip}
                            disabled={actionLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:cursor-not-allowed"
                          >
                            {actionLoading
                              ? "Đang xử lý..."
                              : "Xác nhận đã gửi hàng"}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 italic">
                          Đang chờ người bán xác nhận và gửi hàng...
                        </div>
                      )}
                    </div>
                  )}

                  {/* BƯỚC 3: SHIPPED */}
                  {order.status === "shipped" && (
                    <div className="space-y-4">
                      <div className="bg-purple-50 text-purple-800 p-3 rounded text-sm mb-4">
                        Hàng đang được vận chuyển.
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50 text-sm">
                        <p className="mb-2 text-gray-700">
                          <strong>Vận đơn gửi hàng:</strong>
                        </p>
                        {order.shipping_proof ? (
                          <a
                            href={order.shipping_proof}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink size={14} /> Xem ảnh vận đơn
                          </a>
                        ) : (
                          <span className="text-red-500">Không có ảnh</span>
                        )}
                      </div>

                      {isSeller ? (
                        <div className="text-center py-4 text-gray-500 italic">
                          Đang chờ người mua nhận hàng...
                        </div>
                      ) : (
                        <button
                          onClick={handleConfirmReceipt}
                          disabled={actionLoading}
                          className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition cursor-pointer disabled:cursor-not-allowed"
                        >
                          {actionLoading
                            ? "Đang xử lý..."
                            : "Đã nhận được hàng"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* BƯỚC 4: COMPLETED */}
                  {order.status === "completed" && (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-green-700 mb-2">
                        Giao dịch thành công!
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Cảm ơn bạn đã sử dụng dịch vụ.
                      </p>

                      <button
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="bg-gray-900 text-yellow-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2 mx-auto"
                      >
                        <Star size={18} fill="currentColor" /> Viết đánh giá
                      </button>
                    </div>
                  )}

                  {/* Nút hủy cho Seller */}
                  {isSeller && order.status === "pending" && (
                    <div className="mt-8 pt-4 border-t text-center">
                      <button
                        onClick={() => {
                          setIsCancelModalOpen(true);
                          setCancelReason("");
                        }}
                        className="text-red-500 text-sm hover:underline font-medium"
                      >
                        Gặp sự cố? Hủy đơn hàng này
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. RIGHT COLUMN: CHAT */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OrderChat orderId={orderId!} currentUser={user} token={token} />
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL HỦY ĐƠN --- */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in duration-200">
            <h3 className="font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
              <AlertTriangle /> Xác nhận hủy đơn
            </h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] mb-4 text-sm text-gray-900 bg-white placeholder-gray-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={submitCancellation}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang xử lý..." : "Hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ĐÁNH GIÁ --- */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in duration-200">
            <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">
              Đánh giá giao dịch
            </h3>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setFeedbackScore(1)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition cursor-pointer ${
                  feedbackScore === 1
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100"
                }`}
              >
                <span className="text-3xl">👍</span>
                <span className="text-sm font-bold mt-2 text-green-700">
                  Hài lòng (+1)
                </span>
              </button>
              <button
                onClick={() => setFeedbackScore(-1)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition cursor-pointer ${
                  feedbackScore === -1
                    ? "border-red-500 bg-red-50"
                    : "border-gray-100"
                }`}
              >
                <span className="text-3xl">👎</span>
                <span className="text-sm font-bold mt-2 text-red-700">
                  Thất vọng (-1)
                </span>
              </button>
            </div>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Nhập nhận xét của bạn về đối tác..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] mb-4 text-sm focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900 bg-white placeholder-gray-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={submitFeedback}
                disabled={actionLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL XÁC NHẬN --- */}
      {isConfirmModalOpen && confirmConfig && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          type={confirmConfig.type}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { apiUrl } from "../../config/api";
import toast from "react-hot-toast";

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    token: string;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
    isOpen,
    onClose,
    orderId,
    token,
}) => {
    const [cancelReason, setCancelReason] = useState("Người thắng không thanh toán");
    const [actionLoading, setActionLoading] = useState(false);

    const submitCancellation = async () => {
        if (!cancelReason.trim())
            return toast.error("Vui lòng nhập lý do hủy đơn");
        setActionLoading(true);
        try {
            const response = await fetch(
                apiUrl(`api/orders/${orderId}/cancel`),
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason: cancelReason,
                    }),
                }
            );
            const resData = await response.json();
            if (response.ok) {
                toast.success("Đã hủy đơn thành công!");
                window.location.reload();
            } else toast.error(resData.message || "Lỗi hủy đơn");
        } catch {
            toast.error("Lỗi kết nối");
        } finally {
            setActionLoading(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in duration-200">
                <h3 className="font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle /> Xác nhận hủy đơn
                </h3>
                <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy..."
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] mb-4 text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
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
    );
};

export default CancelOrderModal;

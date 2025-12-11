import React from "react";
import { X, AlertCircle } from "lucide-react";

interface BannedBidderModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
}

export const BannedBidderModal: React.FC<BannedBidderModalProps> = ({
    isOpen,
    onClose,
    productName,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-white" size={24} />
                        <h2 className="text-xl font-semibold text-white">
                            Không thể đặt giá
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-gray-800 text-base leading-relaxed">
                            Bạn đã bị người bán <strong>hạn chế</strong> đặt giá
                            cho sản phẩm:{" "}
                            <strong className="text-red-600">
                                "{productName}"
                            </strong>
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            <strong>Lý do có thể:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Vi phạm quy định đấu giá</li>
                            <li>Không thanh toán các lần đấu giá trước</li>
                            <li>Hành vi không phù hợp</li>
                        </ul>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>Cần hỗ trợ?</strong> Vui lòng liên hệ với
                            người bán hoặc bộ phận chăm sóc khách hàng để được
                            giải đáp.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Đã hiểu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannedBidderModal;

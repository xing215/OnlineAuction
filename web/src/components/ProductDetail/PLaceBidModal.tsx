import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "../../utilities";

interface PlaceBidModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bidAmount: number) => void;
    currentPrice: number;
    stepPrice: number;
    minimumBid: number;
    isLoading?: boolean;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentPrice,
    stepPrice,
    minimumBid,
    isLoading = false,
}) => {
    const [bidAmount, setBidAmount] = useState("");
    const [bidMode, setBidMode] = useState<"manual" | "auto">("manual"); // TODO: auto-bid will be implemented later
    const [error, setError] = useState("");

    const handleBidAmountChange = (value: string) => {
        // Only allow numbers and decimal point
        const numericValue = value.replace(/[^0-9]/g, "");
        setBidAmount(numericValue);
        setError("");
    };

    const quickBidAmounts = useMemo(() => {
        return [minimumBid, minimumBid + stepPrice, minimumBid + stepPrice * 2];
    }, [minimumBid, stepPrice]);

    const handleQuickBid = (amount: number) => {
        setBidAmount(amount.toString());
        setError("");
    };

    const handleConfirm = () => {
        if (!bidAmount) {
            setError("Vui lòng nhập số tiền đặt giá");
            return;
        }

        const bidAmountNum = parseFloat(bidAmount);

        if (isNaN(bidAmountNum)) {
            setError("Vui lòng nhập số hợp lệ");
            return;
        }

        if (bidAmountNum < minimumBid) {
            setError(`Giá đặt tối thiểu là ${formatCurrency(minimumBid)}`);
            return;
        }

        onConfirm(bidAmountNum);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-[500px] rounded-3xl bg-white p-8 shadow-lg">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Đặt giá của bạn
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Nhập số tiền bạn muốn đặt giá.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Bid Mode Selection */}
                <div className="mb-6 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="bidMode"
                            value="manual"
                            checked={bidMode === "manual"}
                            onChange={(e) =>
                                setBidMode(e.target.value as "manual" | "auto")
                            }
                            className="w-4 h-4 accent-[#d5ad41]"
                        />
                        <span className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                Đặt giá thông thường
                            </span>
                        </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer opacity-50">
                        <input
                            type="radio"
                            name="bidMode"
                            value="auto"
                            disabled
                            className="w-4 h-4 accent-[#d5ad41]"
                        />
                        <span className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                Đặt giá tự động (Sắp cập nhật)
                            </span>
                        </span>
                    </label>
                </div>

                {/* Price Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={bidAmount}
                        onChange={(e) => handleBidAmountChange(e.target.value)}
                        placeholder="Nhập giá đặt..."
                        className="w-full rounded-2xl border-[1.5px] border-[#d5ad41] bg-neutral-50 px-5 py-3 text-base font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d5ad41] focus:ring-opacity-50 transition-all"
                    />
                </div>

                {/* Formatted Price Display */}
                {bidAmount && (
                    <div className="mb-4 text-center">
                        <p className="text-xl font-semibold text-[#d5ad41]">
                            {formatCurrency(parseFloat(bidAmount) || 0)}
                        </p>
                    </div>
                )}

                {/* Quick Bid Buttons */}
                {!bidAmount && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Gợi ý giá:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {quickBidAmounts.map((amount, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickBid(amount)}
                                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-[#d5ad41]"
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Minimum Bid Info */}
                <div className="mb-4 text-sm text-gray-600">
                    <p>
                        Giá đặt tối thiểu:{" "}
                        <span className="font-semibold text-gray-800">
                            {formatCurrency(minimumBid)}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Giá hiện tại: {formatCurrency(currentPrice)} +{" "}
                        {formatCurrency(stepPrice)} (bước giá)
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-800 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 rounded-2xl bg-gradient-to-b from-[#d5ad41] to-[#f4d483] px-4 py-3 text-base font-semibold text-white transition-all hover:shadow-lg hover:from-[#c9a037] hover:to-[#e8c978] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
};

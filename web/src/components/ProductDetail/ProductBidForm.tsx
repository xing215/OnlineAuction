import React from "react";
import { Gavel } from "lucide-react";
import { formatCurrency } from "../../utilities";

interface ProductBidFormProps {
    bidAmount: string;
    onBidAmountChange: (value: string) => void;
    onBidClick: () => void;
    minimumBid: number;
    disabled?: boolean;
}

export const ProductBidForm: React.FC<ProductBidFormProps> = ({
    bidAmount,
    onBidAmountChange,
    onBidClick,
    minimumBid,
    disabled = false,
}) => {
    return (
        <div className="grid grid-cols-4 gap-4 items-center">
            <button
                className="flex justify-center gap-2 items-center rounded-xl border border-gray-300 bg-white p-2 text-xl font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer col-span-4"
                onClick={onBidClick}
                disabled={disabled}
            >
                <span>Đặt giá</span>
                <Gavel />
            </button>
        </div>
    );
};

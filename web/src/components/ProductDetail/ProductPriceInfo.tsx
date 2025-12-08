import React from "react";
import { formatCurrency } from "../../utilities";

interface ProductPriceInfoProps {
    currentPrice: number;
    highestBidderName?: string | null | undefined;
    bidCount?: number | null | undefined;
}

export const ProductPriceInfo: React.FC<ProductPriceInfoProps> = ({
    currentPrice,
    highestBidderName,
    bidCount = 0,
}) => {
    return (
        <div className="p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col mb-4">
                <span className="text-sm text-gray-600 mb-1">Giá hiện tại</span>
                <span className="text-3xl font-bold text-[#D5AD41]">
                    {formatCurrency(currentPrice)}
                </span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                        Người đặt giá cao nhất:
                    </span>
                    <span className="text-gray-800 font-medium">
                        {highestBidderName || "Chưa có ai đặt giá"}
                    </span>
                    <span className="text-gray-600 ml-auto">
                        {bidCount || 0} lượt đặt giá
                    </span>
                </div>
            </div>
        </div>
    );
};

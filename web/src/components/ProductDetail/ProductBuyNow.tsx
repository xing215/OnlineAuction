import React from "react";
import { formatCurrency } from "../../utilities";

interface ProductBuyNowProps {
    buyNowPrice: number;
    onBuyNowClick?: () => void;
}

export const ProductBuyNow: React.FC<ProductBuyNowProps> = ({
    buyNowPrice,
    onBuyNowClick,
}) => {
    return (
        <div
            className="flex items-center justify-center gap-4 rounded-xl  bg-[#D5AD41] py-2.5 text-xl font-semibold text-white shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg cursor-pointer"
            onClick={onBuyNowClick}
        >
            <span>Mua ngay</span>
            <span className="text-2xl">{formatCurrency(buyNowPrice)}</span>
        </div>
    );
};

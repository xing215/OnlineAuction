import { useState } from "react";
import type { Product } from "../../types";
import { formatCurrency } from "../../ultilities/FormatCurrency";
import {
    AccessTime,
    Favorite,
    FavoriteBorder,
    Gavel,
} from "@mui/icons-material";
export interface ProductCardProps {
    product: Product;
    onBidClick?: (productId: string) => void;
    onViewDetails?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onBidClick,
    onViewDetails,
}) => {
    const [imageError, setImageError] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const getTimeRemaining = (): string => {
        const now = new Date();
        const diff = product.endTime.getTime() - now.getTime();

        if (diff <= 0) return "Ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleBidClick = () => {
        if (onBidClick) {
            onBidClick(product.id);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(product.id);
        }
    };

    const isAuctionEnded = product.endTime.getTime() <= new Date().getTime();

    return (
        <article className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-[280px] flex-shrink-0">
            {/* Image Section */}
            <div className="relative w-full h-[280px] bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-t-2xl flex-shrink-0">
                {imageError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            No Image Available
                        </span>
                    </div>
                ) : (
                    <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                        loading="lazy"
                    />
                )}

                {/* Timer Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                    <AccessTime></AccessTime>
                    <span className="text-xs font-semibold text-gray-800">
                        {getTimeRemaining()}
                    </span>
                </div>

                {/* Favorite Button */}
                <button
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    onClick={() => setIsLiked(!isLiked)}
                >
                    {isLiked ? (
                        <Favorite
                            sx={{
                                color: "red",
                            }}
                        ></Favorite>
                    ) : (
                        <FavoriteBorder></FavoriteBorder>
                    )}
                </button>

                {/* Category Badge */}
                {product.category && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-md px-2.5 py-1 text-[10px] font-semibold text-white uppercase tracking-wide">
                        {product.category}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-4 gap-2 flex-shrink-0">
                {/* Title */}
                <h3
                    className="text-base font-semibold text-gray-900 dark:text-white truncate leading-tight h-5"
                    title={product.title}
                >
                    {product.title}
                </h3>

                {/* Price and Bid Count Row */}
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                        {formatCurrency(product.currentBid)}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <span className="text-sm font-medium">
                            Lượt ra giá: {product.bidCount}
                        </span>
                    </div>
                </div>

                {/* Seller */}
                <p
                    className={`${
                        product.seller ? "" : "invisible"
                    } text-xs text-gray-600 dark:text-gray-400`}
                >
                    Cao nhất: {product.seller ? product.seller : "..."}
                </p>

                {/* Status Label */}
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                    Mở bán:{" "}
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                        {isAuctionEnded ? "Đã kết thúc" : "Hôm qua"}
                    </span>
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                    <button
                        className="flex-1 px-4 py-2.5 bg-[#D5AD41] hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-200 text-sm shadow-md hover:shadow-lg flex items-center justify-between gap-2"
                        onClick={handleBidClick}
                        disabled={isAuctionEnded}
                    >
                        <span>
                            {isAuctionEnded ? "Đã kết thúc" : "Mua ngay"}
                        </span>
                        {!isAuctionEnded && (
                            <span className="font-bold">
                                {formatCurrency(product.buyNowPrice)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Bid Button */}
                <button
                    className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    onClick={handleViewDetails}
                >
                    <span>Đặt giá</span>
                    <Gavel></Gavel>
                </button>
            </div>
        </article>
    );
};
export default ProductCard;

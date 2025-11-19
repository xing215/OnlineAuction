import { useState } from "react";
import type { Product } from "../../types";
import { formatCurrency } from "../../ultilities/FormatCurrency";

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

  const getTimeRemaining = (): string => {
    const now = new Date();
    const diff = product.endTime.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
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
          <svg
            className="w-3.5 h-3.5 text-gray-700"
            fill="none"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 4V8L10.5 9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-semibold text-gray-800">
            {getTimeRemaining()}
          </span>
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
          <svg
            className="w-5 h-5 text-pink-500"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
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
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21v-2a4 4 0 0 0-3-3.87"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">{product.bidCount}</span>
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
            className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-200 text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            onClick={handleBidClick}
            disabled={isAuctionEnded}
          >
            <span>{isAuctionEnded ? "Đã kết thúc" : "Mua ngay"}</span>
            {!isAuctionEnded && (
              <span className="font-bold">
                {formatCurrency(product.startingPrice)}
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
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 11l3 3L22 4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </article>
  );
};
export default ProductCard;

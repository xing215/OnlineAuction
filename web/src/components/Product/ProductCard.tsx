import { useMemo, useState, useEffect } from "react";
import type { Product } from "../../types";
import { formatCurrency } from "../../utilities/FormatCurrency";
import { AccessTime, Favorite, FavoriteBorder, Gavel } from "@mui/icons-material";

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
  
  const [, setTick] = useState(0);

  const endDate = useMemo(() => new Date(product.end_date), [product.end_date]);
  
  const categoryName = 
    product.category && typeof product.category === 'object' 
      ? (product.category as any).name  // Nếu là object (API trả về), lấy .name
      : product.category;               // Nếu là string (Mock data), giữ nguyên

  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : "";
  const currentPrice = product.current_price ?? product.start_price;
  const buyNowPrice = product.buy_now_price ?? null;
  const bidCount = product.bid_count ?? 0;
  const highestBidder = product.highest_bidder_name ?? "Chưa có";
  const isAuctionEnded = endDate.getTime() <= Date.now();
  const statusLabel = isAuctionEnded ? "Đã kết thúc" : "Đang diễn ra";

  const getTimeRemaining = (): string => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <article className="group flex w-[200px] flex-col flex-shrink-0 rounded-2xl bg-white transition-all duration-300 hover:shadow-sm sm:w-[280px]">
      <div className="relative h-[200px] w-full flex-shrink-0 overflow-hidden rounded-t-2xl bg-gray-200 dark:bg-gray-700 sm:h-[280px]">
        {imageError || !primaryImage ? (
          <div className="relative inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No Image Available
            </span>
          </div>
        ) : (
          <img
            src={primaryImage}
            alt={product.name}
            className="relative inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <AccessTime sx={{ color: "black" }} />
          <span className="text-xs font-semibold text-gray-800">
            {getTimeRemaining()}
          </span>
        </div>

        <button
          type="button"
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white backdrop-blur-sm"
          onClick={() => setIsLiked((prev) => !prev)}
        >
          {isLiked ? <Favorite sx={{ color: "red" }} /> : <FavoriteBorder sx={{ color: "black" }} />}
        </button>

        {categoryName && (
          <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {categoryName}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="h-5 truncate text-base font-semibold text-gray-900 dark:text-white" title={product.name}>
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500 sm:text-xl">
            {formatCurrency(currentPrice)}
          </span>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <span className="text-xs font-medium sm:text-sm">Lượt ra giá: {bidCount}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">Cao nhất: {highestBidder}</p>

        <p className="text-xs font-medium text-gray-500 dark:text-gray-500">
          Trạng thái: <span className="font-semibold text-gray-700 dark:text-gray-300">{statusLabel}</span>
        </p>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className={
              isAuctionEnded
                ? "flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-300 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 disabled:cursor-not-allowed"
                : "flex flex-1 items-center justify-between gap-2 rounded-full bg-[#D5AD41] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg"
            }
            onClick={handleBidClick}
            disabled={isAuctionEnded}
          >
            <span>{isAuctionEnded ? "Đã kết thúc" : "Mua ngay"}</span>
            {!isAuctionEnded && buyNowPrice !== null && (
              <span className="font-bold">{formatCurrency(buyNowPrice)}</span>
            )}
          </button>
        </div>

        {!isAuctionEnded && (
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            onClick={handleViewDetails}
          >
            <span>Đặt giá</span>
            <Gavel />
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types";
import { formatCurrency, formatDate, getTimeRemaining } from "../../utilities";
import {
    AccessTime,
    Favorite,
    FavoriteBorder,
    Gavel,
} from "@mui/icons-material";
import { useUser } from "../../context/useUser";
import { apiUrl } from "../../config/api";
import toast from "react-hot-toast";
import { RatingModal } from "./RatingModal";
import { ConfirmModal } from "../ConfirmModal";

export interface ProductCardProps {
    product: Product;
    onBidClick?: (productId: string) => void;
    onViewDetails?: (productId: string) => void;
    showTransactionDetails?: boolean;
    onTransactionDetails?: (orderId: string) => void;
}

const NEW_THRESHOLD_MINUTES = 120;

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    showTransactionDetails = false,
    onTransactionDetails,
}) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { user, token, refreshUser } = useUser();

    // Get product ID from _id field
    const productId = useMemo(() => product.id, [product.id]);

    // Check if product is in user's watch_list
    const isLiked = useMemo(() => {
        if (!user || !user.watch_list) return false;
        return user.watch_list.some(
            (id: string) => String(id) === String(productId)
        );
    }, [user, productId]);

    const [, setTick] = useState(0);

    const endDate = useMemo(
        () => new Date(product.end_date),
        [product.end_date]
    );

    const categoryName =
        product.category && typeof product.category === "object"
            ? product.category.name // Nếu là object (API trả về), lấy .name
            : product.category; // Nếu là string (Mock data), giữ nguyên

    const isNew = useMemo(() => {
        if (!product.posted_at) return false;
        const postedTime = new Date(product.posted_at).getTime();
        const now = Date.now();
        const diffMinutes = (now - postedTime) / (1000 * 60);
        return diffMinutes <= NEW_THRESHOLD_MINUTES;
    }, [product.posted_at]);

    const primaryImage =
        product.images && product.images.length > 0 ? product.images[0] : "";
    const currentPrice = product.current_price ?? product.start_price;
    const buyNowPrice = product.buy_now_price ?? null;
    const bidCount = product.bid_count ?? 0;
    const highestBidder =
        typeof product.current_bidder === "object" &&
        product.current_bidder?.full_name
            ? product.current_bidder.full_name
            : "Chưa có ai đặt giá";
    const isAuctionEnded = endDate.getTime() <= Date.now();
    const statusLabel = isAuctionEnded ? "Đã kết thúc" : "Đang diễn ra";
    const timeRemaining = getTimeRemaining(endDate);
    const startedAt = new Date(product.posted_at);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleBidClick = async () => {
        if (!user || !token) {
            toast.error("Vui lòng đăng nhập để mua sản phẩm");
            navigate("/signin");
            return;
        }

        if (!buyNowPrice) {
            toast.error("Sản phẩm này không hỗ trợ mua ngay");
            return;
        }

        if (isAuctionEnded) {
            toast.error("Sản phẩm đã kết thúc đấu giá");
            return;
        }

        // Show confirm modal
        setIsConfirmModalOpen(true);
    };

    const handleBuyNowConfirm = async () => {
        setIsConfirmModalOpen(false);
        setIsBuyNowLoading(true);
        try {
            const response = await fetch(
                apiUrl(`/api/products/${productId}/buy-now`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Mua ngay thất bại");
            }

            toast.success(
                data.message || "Mua ngay thành công! Bạn đã trở thành người thắng cuộc."
            );
            
            // Navigate to product detail to see updated status
            navigate(`/product/${productId}`);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Mua ngay thất bại. Vui lòng thử lại."
            );
        } finally {
            setIsBuyNowLoading(false);
        }
    };

    const handleViewDetails = () => {
        if (!user || !token) {
            toast.error("Vui lòng đăng nhập để đặt giá");
            navigate("/signin");
            return;
        }
        // Navigate to product detail page for bidding
        navigate(`/product/${productId}`);
    };

    const handleTransactionDetails = () => {
        if (
            showTransactionDetails &&
            onTransactionDetails &&
            (product as any).order_id
        ) {
            onTransactionDetails((product as any).order_id);
        }
    };

    const handleToggleFavorite = async () => {
        console.log("Heart clicked! User:", user, "Token:", !!token);

        if (!user || !token) {
            toast.error(
                "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích"
            );
            return;
        }

        try {
            const updatedWatchList = isLiked
                ? (user.watch_list || []).filter(
                      (id) => String(id) !== String(productId)
                  )
                : [...(user.watch_list || []), productId];

            console.log("Updating watch_list:", updatedWatchList);

            const response = await fetch(apiUrl("/api/auth/me"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    watch_list: updatedWatchList,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Error response:", errorData);
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật danh sách yêu thích"
                );
            }

            const data = await response.json();
            console.log("Success response:", data);

            // Refresh user data to sync watch_list
            const refreshedUser = await refreshUser();
            console.log("Refreshed user:", refreshedUser);
        } catch (err) {
            console.error("Error toggling favorite:", err);
            toast.error(
                "Không thể cập nhật danh sách yêu thích: " +
                    (err instanceof Error ? err.message : "Lỗi không xác định")
            );
        }
    };

    return (
        <article className="group flex w-[200px] flex-col shrink-0 rounded-2xl bg-white transition-all duration-300 hover:shadow-sm sm:w-[280px]">
            <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-gray-200 sm:h-[280px] cursor-pointer">
                {imageError || !primaryImage ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <span className="text-sm font-medium text-gray-500">
                            No Image Available
                        </span>
                    </div>
                ) : (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="relative inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                        onClick={handleViewDetails}
                        loading="lazy"
                    />
                )}
                {isNew && (
                    <div className="absolute top-3 right-12 z-10 rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        NEW
                    </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                    <AccessTime sx={{ color: "black" }} />
                    <span className="text-xs font-semibold text-gray-800">
                        {timeRemaining}
                    </span>
                </div>

                <button
                    type="button"
                    className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white backdrop-blur-sm cursor-pointer"
                    onClick={handleToggleFavorite}
                    aria-label={
                        isLiked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
                    }
                >
                    {isLiked ? (
                        <Favorite
                            sx={{ color: "red", pointerEvents: "none" }}
                        />
                    ) : (
                        <FavoriteBorder
                            sx={{ color: "black", pointerEvents: "none" }}
                        />
                    )}
                </button>

                {categoryName && (
                    <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        {categoryName}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 p-4">
                <h3
                    className="h-5 truncate text-base font-semibold text-gray-900 cursor-pointer hover:text-yellow-600"
                    title={product.name}
                    onClick={handleViewDetails}
                >
                    {product.name}
                </h3>

                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-yellow-600 sm:text-xl">
                        {formatCurrency(currentPrice)}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-xs font-medium sm:text-sm">
                            Lượt ra giá: {bidCount}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-gray-600">
                    Cao nhất: {highestBidder}
                </p>

                <p className="text-xs font-medium text-gray-500">
                    Trạng thái:{" "}
                    <span className="font-semibold text-gray-700">
                        {statusLabel}
                    </span>
                </p>

                <p className="text-xs font-medium text-gray-500">
                    Ngày đăng:{" "}
                    <span className="font-semibold text-gray-700">
                        {formatDate(startedAt.toISOString())}
                    </span>
                </p>

                <div className="mt-2 flex gap-2">
                    {showTransactionDetails ? (
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#D5AD41] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg cursor-pointer"
                            onClick={handleTransactionDetails}
                        >
                            <span>Chi tiết giao dịch</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={
                                isAuctionEnded
                                    ? "flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-300 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 disabled:cursor-not-allowed"
                                    : "flex flex-1 items-center justify-between gap-2 rounded-full bg-[#D5AD41] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            }
                            onClick={handleBidClick}
                            disabled={isAuctionEnded || isBuyNowLoading}
                        >
                            <span>
                                {isAuctionEnded ? "Đã kết thúc" : isBuyNowLoading ? "Đang xử lý..." : "Mua ngay"}
                            </span>
                            {!isAuctionEnded && buyNowPrice !== null && !isBuyNowLoading && (
                                <span className="font-bold">
                                    {formatCurrency(buyNowPrice)}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {showTransactionDetails && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D5AD41] bg-white px-4 py-2.5 text-sm font-semibold text-[#D5AD41] shadow-md transition-all duration-200 hover:bg-yellow-50 hover:shadow-lg cursor-pointer"
                            onClick={() => setIsFeedbackModalOpen(true)}
                        >
                            <span>Đánh giá</span>
                        </button>
                    </div>
                )}

                {!isAuctionEnded && !showTransactionDetails && (
                    <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 cursor-pointer"
                        onClick={handleViewDetails}
                    >
                        <span>Đặt giá</span>
                        <Gavel />
                    </button>
                )}

                <RatingModal
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    orderId={(product as any).order_id || ""}
                    token={token || ""}
                />

                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleBuyNowConfirm}
                    title="Xác nhận mua ngay"
                    message={`Bạn muốn mua ngay sản phẩm này với giá ${formatCurrency(buyNowPrice || 0)}?\n\nBạn sẽ trở thành người thắng cuộc và đấu giá sẽ kết thúc ngay lập tức.`}
                    confirmText="Mua ngay"
                    type="warning"
                    isLoading={isBuyNowLoading}
                />
            </div>
        </article>
    );
};

export default ProductCard;

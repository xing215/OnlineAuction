import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AccessTime, Favorite, FavoriteBorder } from "@mui/icons-material";
import { apiUrl } from "../../config/api";
import { formatCurrency } from "../../utilities/FormatCurrency";
import { formatDate } from "../../utilities/FormatDate";
import { type User, type Product } from "../../types";
import { getTimeRemaining } from "../../utilities";
import { Gavel, ThumbsUp, ThumbsDown } from "lucide-react";
import { ProductList, QnABox, Description } from "../../components/Product";
import { useUser } from "../../context/useUser";
import {
    PlaceBidModal,
    BidderManagerModal,
} from "../../components/ProductDetail";
import { BannedBidderModal } from "../../components/ProductDetail/BannedBidderModal";
import { placeBid, getMyAutoBid } from "../../hooks/usePlaceBid";
import { BidHistoryTable } from "../../components/ProductDetail/History";
import toast from "react-hot-toast";
import { ConfirmModal } from "../../components/ConfirmModal";

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    //const [bidAmount, setBidAmount] = useState("");
    const [activeTab, setActiveTab] = useState<
        "description" | "history" | "qna"
    >("description");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBidLoading, setIsBidLoading] = useState(false);
    const [currentAutoBid, setCurrentAutoBid] = useState<{
        maxBid: number;
        currentBidPrice: number;
        isLeading: boolean;
    } | null>(null);
    const [isBidderManagerOpen, setIsBidderManagerOpen] = useState(false);
    const [isBannedModalOpen, setIsBannedModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { user, token, refreshUser } = useUser();
    const [, setTick] = useState(0);

    // Check if product is in user's watch_list
    const isLiked = useMemo(() => {
        if (!user || !user.watch_list || !product) return false;
        return user.watch_list.some(
            (id: string) => String(id) === String(product.id)
        );
    }, [user, product]);

    const handleToggleFavorite = async () => {
        if (!user || !token) {
            toast.error(
                "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích"
            );
            return;
        }

        if (!product) return;

        try {
            const updatedWatchList = isLiked
                ? (user.watch_list || []).filter(
                      (id) => String(id) !== String(product.id)
                  )
                : [...(user.watch_list || []), product.id];

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
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật danh sách yêu thích"
                );
            }

            // Refresh user data to sync watch_list
            await refreshUser();

            toast.success(
                isLiked
                    ? "Đã xóa khỏi danh sách yêu thích"
                    : "Đã thêm vào danh sách yêu thích"
            );
        } catch (err) {
            console.error("Error toggling favorite:", err);
            toast.error(
                "Không thể cập nhật danh sách yêu thích: " +
                    (err instanceof Error ? err.message : "Lỗi không xác định")
            );
        }
    };

    const handleBidConfirm = async (
        bidAmount: number,
        isAutoBid?: boolean,
        maxBid?: number
    ) => {
        if (!user || !token || !product) return;

        // Check rating eligibility
        const positiveCount = user.rating_summary?.positive_count || 0;
        const negativeCount = user.rating_summary?.negative_count || 0;
        const totalRatings = positiveCount + negativeCount;

        // If user has ratings, check if they meet the 80% threshold
        if (totalRatings > 0) {
            const ratingPercentage = (positiveCount / totalRatings) * 100;
            if (ratingPercentage < 80) {
                toast.error(
                    `Bạn cần có ít nhất 80% đánh giá tích cực để đấu giá. Điểm hiện tại: ${ratingPercentage.toFixed(
                        1
                    )}%`
                );
                return;
            }
        }
        // If user has no ratings, they are allowed to bid (handled by backend based on seller preference)

        setIsBidLoading(true);
        try {
            const response = await placeBid(
                product.id,
                bidAmount,
                token,
                isAutoBid || false,
                maxBid
            );

            // Update product data with new bid info
            if (response.data) {
                const updatedProduct = {
                    ...product,
                    current_price:
                        response.data.currentPrice ?? product.current_price,
                    bid_count: response.data.bidCount ?? product.bid_count,
                    current_bidder:
                        response.data.highestBidder ?? product.current_bidder,
                    end_date: response.data.endDate
                        ? new Date(response.data.endDate)
                        : product.end_date,
                };
                setProduct(updatedProduct);
            }

            // Close modal and show success with appropriate message
            setIsModalOpen(false);
            const successMessage = response.data?.isLeading
                ? isAutoBid
                    ? "Đặt giá tự động thành công! Bạn đang dẫn đầu."
                    : "Đặt giá thành công! Bạn đang dẫn đầu."
                : isAutoBid
                ? "Đặt giá tự động thành công!"
                : "Đặt giá thành công!";
            toast.success(successMessage);

            // Refresh auto-bid data if it was an auto-bid
            if (isAutoBid && maxBid) {
                try {
                    const autoBidResponse = await getMyAutoBid(
                        product.id,
                        token
                    );
                    if (autoBidResponse.data) {
                        setCurrentAutoBid(autoBidResponse.data);
                    }
                } catch {
                    // Silent error for auto-bid refresh
                }
            }
        } catch (error) {
            // Check if user is banned
            if (error instanceof Error && error.message.includes("banned")) {
                setIsModalOpen(false);
                setIsBannedModalOpen(true);
            } else {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Đặt giá thất bại. Vui lòng thử lại."
                );
            }
        } finally {
            setIsBidLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để mua sản phẩm");
            navigate("/signin");
            return;
        }

        if (!product?.buy_now_price) {
            toast.error("Sản phẩm này không hỗ trợ mua ngay");
            return;
        }

        if (product.status !== "active") {
            toast.error("Sản phẩm không còn hoạt động");
            return;
        }

        if (seller && user.id === seller.id) {
            toast.error("Bạn không thể mua sản phẩm của chính mình");
            return;
        }

        // Show confirm modal
        setIsConfirmModalOpen(true);
    };

    const executeBuyNow = async () => {
        if (!product?.buy_now_price) return;

        setIsConfirmModalOpen(false);
        setIsBidLoading(true);
        try {
            const response = await fetch(
                apiUrl(`/api/products/${product.id}/buy-now`),
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

            // Update product state with new data
            if (data.data && data.data.product) {
                setProduct(data.data.product);
            }

            toast.success(
                data.message ||
                    "Mua ngay thành công! Bạn đã trở thành người thắng cuộc."
            );
        } catch (error) {
            // Check if user is banned
            if (error instanceof Error && error.message.includes("bị cấm")) {
                setIsBannedModalOpen(true);
            } else {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Mua ngay thất bại. Vui lòng thử lại."
                );
            }
        } finally {
            setIsBidLoading(false);
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            if (!id) return;

            setLoading(true);
            setRelatedProducts([]);
            setError(null);

            try {
                const productRes = await fetch(apiUrl(`/api/products/${id}`));
                if (!productRes.ok) throw new Error("Failed to fetch product");

                const productData = await productRes.json();
                const currentProduct = productData.data;

                console.log(currentProduct);

                setProduct(currentProduct);
                //setBidAmount(currentProduct.step_price?.toString() || "");

                const categoryId = currentProduct.category?._id;
                const sellerId = currentProduct.seller?._id;

                const relatedPromise = categoryId
                    ? fetch(
                          apiUrl(`/api/products?category=${categoryId}&limit=6`)
                      ).then((res) =>
                          res.ok
                              ? res.json()
                              : Promise.reject("Related fetch failed")
                      )
                    : Promise.reject("No category");

                const sellerPromise = sellerId
                    ? fetch(apiUrl(`/api/products/seller/${sellerId}`)).then(
                          (res) =>
                              res.ok
                                  ? res.json()
                                  : Promise.reject("Seller fetch failed")
                      )
                    : Promise.reject("No seller");

                const [relatedResult, sellerResult] = await Promise.allSettled([
                    relatedPromise,
                    sellerPromise,
                ]);

                if (relatedResult.status === "fulfilled") {
                    const res = relatedResult.value;
                    setRelatedProducts(
                        res.data?.filter(
                            (p: Product) => p.id !== currentProduct.id
                        ) || []
                    );
                } else {
                    console.warn(
                        "Lỗi tải sản phẩm liên quan:",
                        relatedResult.reason
                    );
                }

                if (sellerResult.status === "fulfilled") {
                    const res = sellerResult.value;
                    setSeller(res.data);
                } else {
                    console.warn("Lỗi tải tên người bán:", sellerResult.reason);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [id]);

    // Fetch user's auto-bid when modal opens
    useEffect(() => {
        const fetchAutoBid = async () => {
            if (isModalOpen && user && token && product) {
                try {
                    const response = await getMyAutoBid(product.id, token);
                    if (response.data) {
                        setCurrentAutoBid(response.data);
                    } else {
                        setCurrentAutoBid(null);
                    }
                } catch (error) {
                    console.error("Error fetching auto-bid:", error);
                    setCurrentAutoBid(null);
                }
            }
        };

        fetchAutoBid();
    }, [isModalOpen, user, token, product]);

    // Timer for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleBidClick = () => {
        if (!user || !token) {
            toast.error("Vui lòng đăng nhập để mua sản phẩm");
            navigate("/signin");
            return;
        }
        setIsModalOpen(true);
    };

    const timeRemaining = useMemo(() => {
        if (!product?.end_date) return "00:00:00";
        return getTimeRemaining(new Date(product.end_date));
    }, [product?.end_date]);

    const categoryName = useMemo(() => {
        if (!product?.category) return "";
        return typeof product.category === "object"
            ? (product.category as { name: string }).name
            : product.category;
    }, [product?.category]);

    const currentPrice = product?.current_price ?? product?.start_price ?? 0;

    // Calculate minimum bid: if no one has bid yet (currentPrice = start_price), use start_price + step_price
    const minimumBid = useMemo(() => {
        if (!product) return 0;
        const hasNoBid =
            !product.current_price ||
            product.current_price === product.start_price;
        return hasNoBid
            ? product.start_price + product.step_price
            : currentPrice + product.step_price;
    }, [product, currentPrice]);

    const handleViewDetails = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-5">
                <div className="max-w-7xl mx-auto px-5">
                    {/* Breadcrumb Skeleton */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-5 rounded-lg shadow">
                        {/* Left: Product Images Skeleton */}
                        <div className="flex flex-col gap-4">
                            <div className="w-full aspect-4/3 bg-gray-200 rounded-lg animate-pulse relative">
                                <div className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-20 h-15 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Info Skeleton */}
                        <div className="flex flex-col gap-4">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                    <div className="flex gap-1 ml-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
                                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div>
                                </div>
                            </div>

                            {/* Timer Skeleton */}
                            <div className="bg-gray-100 p-4 rounded-xl">
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                                </div>
                            </div>

                            {/* Price Info Skeleton */}
                            <div className="p-4 rounded-xl border border-gray-200">
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-20"></div>
                                <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                    <div className="flex gap-1 ml-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
                                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                                </div>
                            </div>

                            {/* Bid Form Skeleton */}
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <div className="col-span-3">
                                    <div className="w-full h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                                </div>
                                <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                            </div>

                            {/* Buy Now Skeleton */}
                            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>

                            {/* Bidder Manager Skeleton */}
                            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                        </div>
                    </div>

                    {/* Tabs Section Skeleton */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                        <div className="flex border-b border-gray-200">
                            <div className="flex-1 px-4 py-4">
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                            </div>
                            <div className="flex-1 px-4 py-4">
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                            </div>
                            <div className="flex-1 px-4 py-4">
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products Skeleton */}
                    <div className="mb-8">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mb-6"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                                    <div className="p-4">
                                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                                        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-3"></div>
                                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
                <p className="text-lg text-gray-600">
                    Không thể tải thông tin sản phẩm
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    const mainImage =
        product.images && product.images.length > 0
            ? product.images[selectedImageIndex]
            : "";

    return (
        <div className="min-h-screen bg-gray-50 py-5">
            <div className="max-w-7xl mx-auto px-5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-5 text-xs sm:text-sm text-gray-600">
                    <span
                        className="cursor-pointer hover:text-yellow-600 transition-colors"
                        onClick={() => navigate("/")}
                    >
                        Trang chủ
                    </span>
                    <span className="text-gray-400">›</span>
                    <span className="cursor-pointer hover:text-yellow-600 transition-colors">
                        {categoryName}
                    </span>
                    <span className="text-gray-400">›</span>
                    <span className="text-gray-800 font-medium">
                        {product.name}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-5 rounded-lg shadow">
                    {/* Left: Product Images */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full aspect-4/3 bg-gray-100 rounded-lg overflow-hidden relative">
                            {mainImage && (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <button
                                type="button"
                                className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white backdrop-blur-sm cursor-pointer"
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
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {product.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`w-20 h-15 rounded border-2 overflow-hidden cursor-pointer transition-colors ${
                                            index === selectedImageIndex
                                                ? "border-yellow-600"
                                                : "border-transparent hover:border-yellow-600"
                                        }`}
                                        onClick={() =>
                                            setSelectedImageIndex(index)
                                        }
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-gray-200 pb-4">
                            <h1 className="text-2xl font-semibold mb-2 text-gray-800">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-2 text-sm justify-between">
                                <div className="flex gap-2">
                                    <span className="text-gray-600">
                                        Người bán:
                                    </span>
                                    <span className="text-yellow-600 font-medium">
                                        {seller?.full_name}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs ml-2">
                                        <ThumbsUp
                                            fill="#D5AD41"
                                            strokeWidth={0.5}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-yellow-600 font-semibold">
                                            {seller?.rating_summary
                                                .positive_count || 0}
                                        </span>
                                        <ThumbsDown
                                            fill="#45556c"
                                            strokeWidth={0.5}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-slate-600 font-semibold">
                                            {seller?.rating_summary
                                                .negative_count || 0}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex gap-1">
                                    <span className="text-gray-600 hidden sm:inline">
                                        Ngày đăng:
                                    </span>
                                    <span className="text-gray-600">
                                        {formatDate(product.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Timer */}
                        <div className="bg-gray-100 p-4 rounded-xl">
                            <span className="block text-sm text-gray-600 mb-2">
                                Thời gian còn lại
                            </span>
                            <div className="flex items-center gap-2">
                                <AccessTime className="text-black text-sm sm:text-xl" />
                                <span className="text-sm sm:text-2xl font-semibold text-black">
                                    {timeRemaining}
                                </span>
                            </div>
                        </div>

                        {/* Price Info */}
                        <div className=" p-4 rounded-xl border border-gray-200">
                            <div className="flex flex-col mb-4">
                                <span className="text-sm text-gray-600 mb-1">
                                    Giá hiện tại
                                </span>
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
                                        {typeof product.current_bidder ===
                                            "object" &&
                                        product.current_bidder?.full_name
                                            ? product.current_bidder.full_name
                                            : "Chưa có ai đặt giá"}
                                    </span>
                                    {typeof product.current_bidder ===
                                        "object" &&
                                        product.current_bidder
                                            ?.rating_summary && (
                                            <span className="flex items-center gap-1.5 text-xs ml-2">
                                                <ThumbsUp
                                                    fill="#D5AD41"
                                                    strokeWidth={0.5}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-yellow-600 font-semibold">
                                                    {product.current_bidder
                                                        .rating_summary
                                                        .positive_count || 0}
                                                </span>
                                                <ThumbsDown
                                                    fill="#45556c"
                                                    strokeWidth={0.5}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-slate-600 font-semibold">
                                                    {product.current_bidder
                                                        .rating_summary
                                                        .negative_count || 0}
                                                </span>
                                            </span>
                                        )}
                                    <span className="text-gray-600 ml-auto">
                                        {product.bid_count} lượt đặt giá
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bid Form */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="col-span-3 flex flex-col gap-2">
                                <button
                                    className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-600 text-black text-base font-medium bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={handleBidClick}
                                    disabled={product.status !== "active"}
                                >
                                    Tối thiểu: {formatCurrency(minimumBid)}
                                </button>
                            </div>
                            <button
                                className="flex justify-around items-center rounded-xl border border-gray-300 bg-white p-2 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                onClick={handleBidClick}
                                disabled={product.status !== "active"}
                            >
                                <span>Đặt giá</span>
                                <Gavel />
                            </button>
                        </div>

                        {/* Place Bid Modal */}
                        <PlaceBidModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={handleBidConfirm}
                            currentPrice={currentPrice}
                            stepPrice={product.step_price}
                            minimumBid={minimumBid}
                            isLoading={isBidLoading}
                            currentAutoBid={currentAutoBid}
                        />

                        {/* Buy Now */}
                        {product.buy_now_price && (
                            <button
                                className="flex items-center justify-center gap-4 rounded-xl bg-[#D5AD41] py-2.5 text-xl font-semibold text-white shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                onClick={handleBuyNow}
                                disabled={
                                    product.status !== "active" || isBidLoading
                                }
                            >
                                <span>Mua ngay</span>
                                <span className="text-2xl">
                                    {formatCurrency(product.buy_now_price)}
                                </span>
                            </button>
                        )}

                        {/* Bidder Manager Button - Only show for product owner */}
                        {user && seller && user.id === seller.id && (
                            <button
                                onClick={() => setIsBidderManagerOpen(true)}
                                className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold text-base hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Quản lý người đặt giá
                            </button>
                        )}

                        {/* Bidder Manager Modal */}
                        <BidderManagerModal
                            isOpen={isBidderManagerOpen}
                            onClose={() => setIsBidderManagerOpen(false)}
                            productId={product.id}
                            productName={product.name}
                            onProductUpdate={(data) => {
                                setProduct({
                                    ...product,
                                    current_price: data.currentPrice,
                                    current_bidder: data.currentBidder,
                                    bid_count: data.bidCount,
                                });
                            }}
                        />

                        {/* Banned Bidder Modal */}
                        <BannedBidderModal
                            isOpen={isBannedModalOpen}
                            onClose={() => setIsBannedModalOpen(false)}
                            productName={product.name}
                        />
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative cursor-pointer ${
                                activeTab === "description"
                                    ? "text-yellow-600"
                                    : "text-gray-600 hover:text-yellow-600"
                            }`}
                            onClick={() => setActiveTab("description")}
                        >
                            Mô tả
                            {activeTab === "description" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></span>
                            )}
                        </button>
                        <button
                            className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative cursor-pointer ${
                                activeTab === "history"
                                    ? "text-yellow-600"
                                    : "text-gray-600 hover:text-yellow-600"
                            }`}
                            onClick={() => setActiveTab("history")}
                        >
                            Lịch sử đấu giá
                            {activeTab === "history" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></span>
                            )}
                        </button>
                        <button
                            className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative cursor-pointer ${
                                activeTab === "qna"
                                    ? "text-yellow-600"
                                    : "text-gray-600 hover:text-yellow-600"
                            }`}
                            onClick={() => setActiveTab("qna")}
                        >
                            Hỏi đáp
                            {activeTab === "qna" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></span>
                            )}
                        </button>
                    </div>
                    <div className="p-5">
                        {activeTab === "description" && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                    Thông tin chi tiết
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {product.description ||
                                        "Chưa có mô tả chi tiết."}
                                </p>
                                {product.description_updates &&
                                    product.description_updates.length > 0 && (
                                        <div className="mt-5 pt-5 border-t border-gray-200">
                                            <h4 className="text-base font-semibold mb-4 text-gray-800">
                                                Cập nhật mô tả:
                                            </h4>
                                            {product.description_updates.map(
                                                (update, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-4 p-2 bg-gray-50 rounded"
                                                    >
                                                        <p className="mb-1 text-gray-700">
                                                            {update.content}
                                                        </p>
                                                        <span className="text-xs text-gray-400">
                                                            {formatDate(
                                                                update.created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="animate-fade-in">
                                <BidHistoryTable productId={product.id} />
                            </div>
                        )}

                        {activeTab === "qna" && (
                            <div className="animate-fade-in">
                                <div className="-mt-8">
                                    <QnABox
                                        productId={product.id}
                                        sellerId={
                                            typeof product.seller === "object"
                                                ? product.seller._id
                                                : product.seller
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <ProductList
                    title="Sản phẩm cùng chuyên mục"
                    subtitle="Các sản phẩm có giá trị cao nhất hiện tại"
                    products={relatedProducts}
                    onBidClick={handleBidClick}
                    onViewDetails={handleViewDetails}
                />

                {/* Confirm Modal for Buy Now */}
                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={executeBuyNow}
                    title="Xác nhận mua ngay"
                    message={`Bạn muốn mua ngay sản phẩm này với giá ${formatCurrency(
                        product?.buy_now_price || 0
                    )}?\n\nBạn sẽ trở thành người thắng cuộc và đấu giá sẽ kết thúc ngay lập tức.`}
                    confirmText="Mua ngay"
                    type="warning"
                    isLoading={isBidLoading}
                />
            </div>
        </div>
    );
};

export default ProductDetail;

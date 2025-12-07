import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTimeRemaining } from "../../utilities";
import { ProductList } from "../../components/Product";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useCountdown } from "../../hooks/useCountdown";
import { useUser } from "../../context/useUser";
import { placeBid } from "../../services/bidService";
import {
    ProductBreadcrumb,
    ProductImageGallery,
    ProductHeader,
    ProductCountdown,
    ProductPriceInfo,
    ProductBidForm,
    ProductBuyNow,
    ProductTabs,
    PlaceBidModal,
} from "../../components/ProductDetail";

type TabType = "description" | "bidHistory" | "questions";

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { product, seller, relatedProducts, loading, error } =
        useProductDetail(id);
    const [activeTab, setActiveTab] = useState<TabType>("description");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBidLoading, setIsBidLoading] = useState(false);
    const { user, token } = useUser();

    // Trigger countdown re-render
    useCountdown(1000);

    const handleBidClick = () => {
        if (!user || !token) {
            navigate("/signin");
            return;
        }
        setIsModalOpen(true);
    };

    const handlePlaceBid = async (bidAmountNum: number) => {
        if (!user || !token || !id) return;

        setIsBidLoading(true);
        try {
            const response = await placeBid(id, bidAmountNum, token);

            if (response.success) {
                alert("Đặt giá thành công!");
                setIsModalOpen(false);
                // Reload page to show updated data
                window.location.reload();
            } else {
                alert(response.message || "Đặt giá thất bại");
            }
        } catch (error) {
            console.error("Place bid error:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi đặt giá"
            );
        } finally {
            setIsBidLoading(false);
        }
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

    const handleViewDetails = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
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
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-5">
            <div className="max-w-7xl mx-auto px-5">
                <ProductBreadcrumb
                    categoryName={categoryName}
                    productName={product.name}
                    onHomeClick={() => navigate("/")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-5 rounded-lg shadow">
                    <ProductImageGallery
                        images={product.images || []}
                        productName={product.name}
                    />

                    <div className="flex flex-col gap-4">
                        <ProductHeader
                            productName={product.name}
                            seller={seller}
                            createdAt={product.createdAt}
                        />

                        <ProductCountdown timeRemaining={timeRemaining} />

                        <ProductPriceInfo
                            currentPrice={currentPrice}
                            highestBidderName={product.highest_bidder_name}
                            bidCount={product.bid_count}
                        />

                        <ProductBidForm
                            bidAmount=""
                            onBidAmountChange={() => {}}
                            onBidClick={handleBidClick}
                            minimumBid={currentPrice + product.step_price}
                        />

                        {product.buy_now_price && (
                            <ProductBuyNow
                                buyNowPrice={product.buy_now_price}
                            />
                        )}
                    </div>
                </div>

                <ProductTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    product={product}
                />

                {/* Related Products */}
                <ProductList
                    title="Sản phẩm cùng chuyên mục"
                    subtitle="Các sản phẩm có giá trị cao nhất hiện tại"
                    products={relatedProducts}
                    onBidClick={handleBidClick}
                    onViewDetails={handleViewDetails}
                />

                {/* Bid Modal */}
                <PlaceBidModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handlePlaceBid}
                    currentPrice={currentPrice}
                    stepPrice={product?.step_price ?? 0}
                    minimumBid={currentPrice + (product?.step_price ?? 0)}
                    isLoading={isBidLoading}
                />
            </div>
        </div>
    );
};

export default ProductDetail;

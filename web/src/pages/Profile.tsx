import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileTabs from "../components/Profile/ProfileTabs";
import ProfileForm from "../components/Profile/ProfileForm";
import { ProductCard } from "../components/Product/ProductCard"; // Đảm bảo đường dẫn đúng tới file bạn gửi
import UpgradeRequestButton from "../components/Profile/UpgradeRequestButton";
import type { Product } from "../types/index";
import { useUser } from "../context/useUser";
import { useUserBids } from "../hooks/useUserBids";

interface ProductGridProps {
    products: Product[];
    title: string;
    onBid: (id: string) => void;
    onView: (id: string) => void;
    onTransactionDetails?: (orderId: string) => void;
    showTransactionDetails?: boolean;
    loading?: boolean;
    error?: string | null;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("info");
    const { user } = useUser();
    const { biddingProducts, wonProducts, loading: bidsLoading, error: bidsError } = useUserBids();
    const navigate = useNavigate();

    // Hàm xử lý sự kiện card
    const handleBid = (id: string) => console.log("Đặt giá sản phẩm:", id);
    const handleView = (id: string) => console.log("Xem chi tiết:", id);
    const handleTransactionDetails = (orderId: string) => {
        navigate(`/orders/${orderId}`);
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {" "}
                {/* Tăng max-width để hiển thị grid đẹp hơn */}
                <h1 className="text-2xl font-medium text-gray-700 mb-6">
                    Hồ sơ người dùng
                </h1>
                <UpgradeRequestButton userRole={user?.role} />
                <ProfileHeader />
                {/* Truyền state xuống Tabs */}
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                {/* Render nội dung dựa trên Tab */}
                <div className="min-h-[400px]">
                    {activeTab === "info" && <ProfileForm />}

                    {activeTab === "bidding" && (
                        <ProductGrid
                            products={biddingProducts}
                            title="Sản phẩm đang tham gia"
                            onBid={handleBid}
                            onView={handleView}
                            loading={bidsLoading}
                            error={bidsError}
                        />
                    )}

                    {activeTab === "won" && (
                        <ProductGrid
                            products={wonProducts}
                            title="Lịch sử chiến thắng"
                            onBid={handleBid}
                            onView={handleView}
                            onTransactionDetails={handleTransactionDetails}
                            showTransactionDetails={true}
                            loading={bidsLoading}
                            error={bidsError}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Component hiển thị Grid sản phẩm cho gọn code
const ProductGrid = ({ products, title, onBid, onView, onTransactionDetails, showTransactionDetails, loading, error }: ProductGridProps) => {
    if (loading) {
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                    {title}
                </h3>
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                    {title}
                </h3>
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-red-300">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                    {title}
                </h3>
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Chưa có sản phẩm nào.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
                {title}
            </h3>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                {products.map((product: Product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onBidClick={onBid}
                        onViewDetails={onView}
                        showTransactionDetails={showTransactionDetails || false}
                        onTransactionDetails={onTransactionDetails}
                    />
                ))}
            </div>
        </div>
    );
};

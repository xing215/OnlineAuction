import { useState } from "react";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileTabs from "../components/Profile/ProfileTabs";
import ProfileForm from "../components/Profile/ProfileForm";
import { ProductCard } from "../components/Product/ProductCard"; // Đảm bảo đường dẫn đúng tới file bạn gửi
import type { Product } from "../types/index";

interface ProductGridProps {
    products: Product[];
    title: string;
    onBid: (id: string) => void;
    onView: (id: string) => void;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("info");

    // Mock data: Sản phẩm đang đấu giá (end_date ở tương lai)
    // Dựa trên cấu trúc từ ProductCard.example.tsx
    const biddingProducts: Product[] = [
        {
            id: "1",
            name: "MacBook Pro 16-inch M3 Max",
            description: "Mẫu laptop cấu hình cao dành cho nhà sáng tạo.",
            category: "Electronics",
            seller: "TechStore VN",
            images: [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
            ],
            description_updates: [],
            start_price: 2500,
            step_price: 50,
            buy_now_price: 3600,
            posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
            end_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
            status: "active",
            banned_bidders: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            current_price: 3200,
            bid_count: 45,
            highest_bidder_name: "pro_creator",
        },
        {
            id: "2",
            name: "Đồng hồ cổ Rolex Submariner",
            description: "Phiên bản sưu tầm hiếm với tình trạng như mới.",
            category: "Watches",
            seller: "LuxuryWatch",
            images: [
                "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop",
            ],
            description_updates: [],
            start_price: 12000,
            step_price: 200,
            buy_now_price: 20000,
            posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "active",
            banned_bidders: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            current_price: 15750,
            bid_count: 23,
            highest_bidder_name: "collector_vn",
        },
    ];

    // Mock data: Sản phẩm đã thắng (end_date ở quá khứ)
    // Logic hiển thị "Ended" đã có sẵn trong ProductCard.tsx
    const wonProducts: Product[] = [
        {
            id: "3",
            name: "Bộ sưu tập sách Harry Potter",
            description: "Trọn bộ 7 tập bản in tiếng Anh nguyên bản.",
            category: "Books",
            seller: "BookWorm",
            images: [
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop",
            ],
            description_updates: [],
            start_price: 300,
            step_price: 10,
            buy_now_price: 820,
            posted_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            end_date: new Date(Date.now() - 100000),
            status: "sold",
            banned_bidders: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            current_price: 500,
            bid_count: 12,
            highest_bidder_name: "booklover",
        },
        {
            id: "4",
            name: "Guitar Gibson Les Paul 1959",
            description: "Chiếc guitar vintage dành cho nhà sưu tầm âm nhạc.",
            category: "Instruments",
            seller: "MusicWorld",
            images: [
                "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop",
            ],
            description_updates: [],
            start_price: 9000,
            step_price: 250,
            buy_now_price: 16000,
            posted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            end_date: new Date(Date.now() - 500000),
            status: "sold",
            banned_bidders: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            current_price: 12500,
            bid_count: 156,
            highest_bidder_name: "musicfan",
        },
    ];

    // Hàm xử lý sự kiện card
    const handleBid = (id: string) => console.log("Đặt giá sản phẩm:", id);
    const handleView = (id: string) => console.log("Xem chi tiết:", id);

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {" "}
                {/* Tăng max-width để hiển thị grid đẹp hơn */}
                <h1 className="text-2xl font-medium text-gray-700 mb-6">
                    Hồ sơ người dùng
                </h1>
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
                        />
                    )}

                    {activeTab === "won" && (
                        <ProductGrid
                            products={wonProducts}
                            title="Lịch sử chiến thắng"
                            onBid={handleBid}
                            onView={handleView}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Component hiển thị Grid sản phẩm cho gọn code
const ProductGrid = ({ products, title, onBid, onView }: ProductGridProps) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-500">Chưa có sản phẩm nào.</p>
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
                    />
                ))}
            </div>
        </div>
    );
};

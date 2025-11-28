import { useState, useEffect } from "react";
import { ProductList } from "../../components/Product";
import type { Product } from "../../types";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [topExpiring, setTopExpiring] = useState<Product[]>([]);
  const [topBidding, setTopBidding] = useState<Product[]>([]);
  const [topPrice, setTopPrice] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Mock data for demonstration
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Giày Sneaker phiên bản giới hạn",
        category: "Fashion",
        seller: "sneaker_head",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
        ],
        description: "High quality sneakers",
        description_updates: [],
        start_price: 600,
        step_price: 25,
        buy_now_price: 1200,
        posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 3 * 60 * 1000 + 6 * 1000),
        status: "active",
        banned_bidders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        current_price: 850,
        bid_count: 45,
        highest_bidder_name: "limited_lover",
      },
      {
        id: "2",
        name: "Túi xách Louis Vuitton",
        category: "Luxury",
        seller: "fashion_queen",
        images: [
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80",
        ],
        description: "Authentic designer bag",
        description_updates: [],
        start_price: 750,
        step_price: 30,
        buy_now_price: 1800,
        posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 3 * 60 * 1000 + 36 * 1000),
        status: "active",
        banned_bidders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        current_price: 980,
        bid_count: 62,
        highest_bidder_name: "style_icon",
      },
      {
        id: "3",
        name: "Đồng hồ Thụy Sĩ cao cấp",
        category: "Watches",
        seller: "john_doe",
        images: [
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
        ],
        description: "Swiss luxury watch",
        description_updates: [],
        start_price: 2000,
        step_price: 100,
        buy_now_price: 3500,
        posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        end_date: new Date(
          Date.now() + 1 * 60 * 60 * 1000 + 59 * 60 * 1000 + 36 * 1000
        ),
        status: "active",
        banned_bidders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        current_price: 2450,
        bid_count: 89,
        highest_bidder_name: "watch_addict",
      },
      {
        id: "4",
        name: "Laptop Gaming RTX 4090",
        category: "Electronics",
        seller: "gamer_pro",
        images: [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80",
        ],
        description: "High performance gaming laptop",
        description_updates: [],
        start_price: 1500,
        step_price: 75,
        buy_now_price: 2700,
        posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 5 * 60 * 60 * 1000 + 59 * 60 * 1000),
        status: "active",
        banned_bidders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        current_price: 1899,
        bid_count: 134,
        highest_bidder_name: "esports_team",
      },
      {
        id: "5",
        name: "Camera Canon EOS R5",
        category: "Electronics",
        seller: "photo_expert",
        images: [
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
        ],
        description: "Professional mirrorless camera",
        description_updates: [],
        start_price: 1400,
        step_price: 50,
        buy_now_price: 2300,
        posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: "active",
        banned_bidders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        current_price: 1650,
        bid_count: 78,
        highest_bidder_name: "lens_master",
      },
      {
        id: "6",
        name: "Áo khoác da thật",
        category: "Fashion",
        seller: "fashion_store",
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
        ],
        description: "Genuine leather jacket",
        description_updates: [],
        start_price: 300,
        step_price: 15,
        buy_now_price: 650,
        posted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: "active",
        banned_bidders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        current_price: 450,
        bid_count: 23,
        highest_bidder_name: "street_style",
      },
    ];

    // Set different products for each section
    setTopExpiring([...mockProducts].slice(0, 5));
    setTopBidding([...mockProducts].reverse().slice(0, 5));
    const valueOf = (item: Product) => item.current_price ?? item.start_price;
    setTopPrice(
      [...mockProducts].sort((a, b) => valueOf(b) - valueOf(a)).slice(0, 5)
    );
  }, []);

  const handleBidClick = (productId: string) => {
    console.log("Bid clicked for product:", productId);
    // Implement bid logic
  };

  const handleViewDetails = (productId: string) => {
    console.log("View details for product:", productId);
    // Navigate to product details page
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[75vh] bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 dark:from-pink-900 dark:via-purple-900 dark:to-blue-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Chào mừng đến với BiddenBid
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Nền tảng đấu giá trực tuyến uy tín, đáng tin cậy
          </p>
          <button
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => {
              navigate("#topBidding");
            }}
          >
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* Product Lists Sections */}
      <div className="space-y-8 pb-12">
        <ProductList
          title="Top 5 gần kết thúc"
          subtitle="Đừng bỏ lỡ cơ hội đấu giá những sản phẩm này"
          products={topExpiring}
          onBidClick={handleBidClick}
          onViewDetails={handleViewDetails}
        />

        <div id="topBidding">
          <ProductList
            title="Top 5 nhiều lượt ra giá"
            subtitle="Những sản phẩm được quan tâm nhất"
            products={topBidding}
            onBidClick={handleBidClick}
            onViewDetails={handleViewDetails}
          />
        </div>

        <ProductList
          title="Top 5 giá cao nhất"
          subtitle="Các sản phẩm có giá trị cao nhất hiện tại"
          products={topPrice}
          onBidClick={handleBidClick}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
};

export default HomePage;

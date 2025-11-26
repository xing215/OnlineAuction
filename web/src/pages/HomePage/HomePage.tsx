import { useState, useEffect } from "react";
import { ProductList } from "../../components/Product";
import type { Product } from "../../types";

const HomePage = () => {
  const [topExpiring, setTopExpiring] = useState<Product[]>([]);
  const [topBidding, setTopBidding] = useState<Product[]>([]);
  const [topPrice, setTopPrice] = useState<Product[]>([]);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Mock data for demonstration
    const mockProducts: Product[] = [
      {
        id: "1",
        title: "Giày Sneaker phiên bản giới hạn",
        description: "High quality sneakers",
        currentBid: 850,
        buyNowPrice: 1200,
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
        endTime: new Date(Date.now() + 3 * 60 * 1000 + 6 * 1000), // 3:06 minutes
        bidCount: 45,
        seller: "sneaker_head",
        category: "Fashion",
      },
      {
        id: "2",
        title: "Túi xách Louis Vuitton",
        description: "Authentic designer bag",
        currentBid: 980,
        buyNowPrice: 1500,
        imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80",
        endTime: new Date(Date.now() + 3 * 60 * 1000 + 36 * 1000), // 3:36 minutes
        bidCount: 62,
        seller: "fashion_queen",
        category: "Luxury",
      },
      {
        id: "3",
        title: "Đồng hồ Thụy Sĩ cao cấp",
        description: "Swiss luxury watch",
        currentBid: 2450,
        buyNowPrice: 3500,
        imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
        endTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 59 * 60 * 1000 + 36 * 1000), // 1:59:36
        bidCount: 89,
        seller: "john_doe",
        category: "Watches",
      },
      {
        id: "4",
        title: "Laptop Gaming RTX 4090",
        description: "High performance gaming laptop",
        currentBid: 1899,
        buyNowPrice: 2500,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80",
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000 + 59 * 60 * 1000), // 5:59:00
        bidCount: 134,
        seller: "gamer_pro",
        category: "Electronics",
      },
      {
        id: "5",
        title: "Camera Canon EOS R5",
        description: "Professional mirrorless camera",
        currentBid: 1650,
        buyNowPrice: 2200,
        imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2:00:00
        bidCount: 78,
        seller: "photo_expert",
        category: "Electronics",
      },
      {
        id: "6",
        title: "Áo khoác da thật",
        description: "Genuine leather jacket",
        currentBid: 450,
        buyNowPrice: 650,
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4:00:00
        bidCount: 23,
        seller: "fashion_store",
        category: "Fashion",
      },
    ];

    // Set different products for each section
    setTopExpiring([...mockProducts].slice(0, 5));
    setTopBidding([...mockProducts].reverse().slice(0, 5));
    setTopPrice([...mockProducts].sort((a, b) => b.currentBid - a.currentBid).slice(0, 5));
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
      <section className="relative bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 dark:from-pink-900 dark:via-purple-900 dark:to-blue-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Chào mừng đến với BiddenBid
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Nền tảng đấu giá trực tuyến uy tín, đáng tin cậy
          </p>
          <button className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
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

        <ProductList
          title="Top 5 nhiều lượt ra giá"
          subtitle="Những sản phẩm được quan tâm nhất"
          products={topBidding}
          onBidClick={handleBidClick}
          onViewDetails={handleViewDetails}
        />

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

import { useState, useEffect } from "react";
import { ProductList } from "../../components/Product";
import type { Product } from "../../types";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api";
import bgImg from "../../assets/hero_bg_home.png"

const HomePage = () => {
  const [topExpiring, setTopExpiring] = useState<Product[]>([]);
  const [topBidding, setTopBidding] = useState<Product[]>([]);
  const [topPrice, setTopPrice] = useState<Product[]>([]);
  const [loadingExpiring, setLoadingExpiring] = useState(true);
  const [loadingBidding, setLoadingBidding] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const navigate = useNavigate();

  // Fetch top products data
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const [expiringRes, biddingRes, priceRes] = await Promise.allSettled([
          fetch(apiUrl('/api/products/top-expiring?limit=5')),
          fetch(apiUrl('/api/products/top-bidding?limit=5')),
          fetch(apiUrl('/api/products/top-price?limit=5')),
        ]);

        if (expiringRes.status === "fulfilled") {
          const expiringData = await expiringRes.value.json();
          if (expiringData.success) {
            setTopExpiring(expiringData.data);
          }
        }
        setLoadingExpiring(false);

        if (biddingRes.status === "fulfilled") {
          const biddingData = await biddingRes.value.json();
          if (biddingData.success) {
            setTopBidding(biddingData.data);
          }
        }
        setLoadingBidding(false);

        if (priceRes.status === "fulfilled") {
          const priceData = await priceRes.value.json();
          if (priceData.success) {
            setTopPrice(priceData.data);
          }
        }
        setLoadingPrice(false);
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    fetchTopProducts();
  }, []);

  // Implement bid logic
  const handleBidClick = (productId: string) => {
    console.log("Bid clicked for product:", productId);
  };

  // Navigate to product details page
  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section
        className="relative h-[25vh] py-20 px-4 mb-4"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100%",
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Chào mừng đến với GoldenBid
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Nền tảng đấu giá trực tuyến uy tín, đáng tin cậy
          </p>
          <button
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => {
              navigate("/categories");
            }}
          >
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* Product Lists Sections */}
      <div className="">
        <ProductList
          title="Top 5 gần kết thúc"
          subtitle="Đừng bỏ lỡ cơ hội đấu giá"
          products={topExpiring}
          onBidClick={handleBidClick}
          onViewDetails={handleViewDetails}
          loading={loadingExpiring}
        />

        <div id="topBidding">
          <ProductList
            title="Top 5 nhiều lượt ra giá"
            subtitle="Những sản phẩm được quan tâm nhất"
            products={topBidding}
            onBidClick={handleBidClick}
            onViewDetails={handleViewDetails}
            loading={loadingBidding}
          />
        </div>

        <ProductList
          title="Top 5 giá cao nhất"
          subtitle="Các sản phẩm có giá trị cao nhất hiện tại"
          products={topPrice}
          onBidClick={handleBidClick}
          onViewDetails={handleViewDetails}
          loading={loadingPrice}
        />
      </div>
    </div>
  );
};

export default HomePage;

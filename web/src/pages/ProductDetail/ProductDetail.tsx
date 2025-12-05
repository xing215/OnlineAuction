import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AccessTime, Star } from "@mui/icons-material";
import { apiUrl } from "../../config/api";
import { formatCurrency } from "../../utilities/FormatCurrency";
import { formatDate } from "../../utilities/FormatDate";
import type { Product } from "../../types";
import { ProductCard } from "../../components/Product/ProductCard";
import { getTimeRemaining } from "../../utilities";
import { Gavel } from "lucide-react";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  //   const [isLiked, setIsLiked] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "bidHistory">(
    "description"
  );
  const [, setTick] = useState(0);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/api/products/${id}`));
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        console.log(data);
        setProduct(data.data);
        setBidAmount(data.data.step_price?.toString() || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category) return;

      try {
        const categoryId =
          typeof product.category === "object"
            ? (product.category as { id: string; _id?: string }).id || (product.category as { id: string; _id?: string })._id
            : product.category;

        const response = await fetch(
          apiUrl(`/api/products?category=${categoryId}&limit=3`)
        );
        if (response.ok) {
          const data = await response.json();
          setRelatedProducts(
            data.products?.filter((p: Product) => p.id !== product.id) || []
          );
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  // Timer for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBid = () => {
    // TODO: Implement bid logic
    console.log("Placing bid:", bidAmount);
  };

  // const handleBuyNow = () => {
  //   // TODO: Implement buy now logic
  //   console.log("Buy now clicked");
  // };

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

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[selectedImageIndex]
      : "";

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="max-w-7xl mx-auto px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5 text-sm text-gray-600">
          <span
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>
          <span className="text-gray-400">›</span>
          <span className="cursor-pointer hover:text-blue-600 transition-colors">
            {categoryName}
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-5 rounded-lg shadow">
          {/* Left: Product Images */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-20 h-15 rounded border-2 overflow-hidden cursor-pointer transition-colors ${
                      index === selectedImageIndex
                        ? "border-blue-600"
                        : "border-transparent hover:border-blue-600"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
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
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-semibold mb-2 text-gray-800">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Người bán:</span>
                <span className="text-blue-600 font-medium">
                  {product?.seller}
                </span>
                <span className="text-orange-400">
                  {" "}
                  <Star></Star>
                </span>
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
                <span className="text-sm text-gray-600 mb-1">Giá hiện tại</span>
                <span className="text-3xl font-bold text-[#D5AD41]">
                  {formatCurrency(currentPrice)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Người đặt giá cao nhất:</span>
                  <span className="text-gray-800 font-medium">
                    {product.highest_bidder_name || "Chưa có ai đặt giá"}
                  </span>
                  <span className="text-gray-600 ml-auto">
                    {product.bid_count} lượt đặt giá
                  </span>
                </div>
              </div>
            </div>

            {/* Bid Form */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="col-span-3 flex flex-col gap-2">
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 text-black text-base"
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Tối thiểu: ${formatCurrency(
                    currentPrice + product.step_price
                  )}`}
                />
              </div>
              <button
                className="flex justify-between items-center rounded-xl border border-gray-300 bg-white p-2 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={handleBid}
              >
                <span>Đặt giá</span>
                <Gavel />
              </button>
            </div>

            {/* Buy Now */}
            {product.buy_now_price && (
              <div className="flex items-center justify-center gap-4 rounded-full bg-[#D5AD41] py-2.5 text-xl font-semibold text-white shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg">
                <span>Mua ngay</span>
                <span className="text-2xl">
                  {formatCurrency(product.buy_now_price)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
                activeTab === "description"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
            <button
              className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
                activeTab === "bidHistory"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("bidHistory")}
            >
              Lịch sử đấu giá
              {activeTab === "bidHistory" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
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
                  {product.description || "Chưa có mô tả chi tiết."}
                </p>
                {product.description_updates &&
                  product.description_updates.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <h4 className="text-base font-semibold mb-4 text-gray-800">
                        Cập nhật mô tả:
                      </h4>
                      {product.description_updates.map((update, index) => (
                        <div
                          key={index}
                          className="mb-4 p-2 bg-gray-50 rounded"
                        >
                          <p className="mb-1 text-gray-700">{update.content}</p>
                          <span className="text-xs text-gray-400">
                            {formatDate(update.created_at.toISOString())}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
            {activeTab === "bidHistory" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Lịch sử đấu giá
                </h3>
                <p className="text-gray-400 italic">Chưa có lịch sử đấu giá</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">
              Sản phẩm cùng chuyên mục
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onViewDetails={(productId) =>
                    navigate(`/product/${productId}`)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

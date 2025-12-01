import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AccessTime,
} from "@mui/icons-material";
import { apiUrl } from "../../config/api";
import { formatCurrency } from "../../utilities/FormatCurrency";
import { formatDate } from "../../utilities/FormatDate";
import type { Product } from "../../types";
import { ProductCard } from "../../components/Product/ProductCard";
import { getTimeRemaining } from "../../utilities";

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
        setProduct(data);
        setBidAmount(data.step_price?.toString() || "");
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
            ? (product.category as any).id || (product.category as any)._id
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

  const timeRemaining = getTimeRemaining(new Date(product?.end_date || ""));

  const handleBid = () => {
    // TODO: Implement bid logic
    console.log("Placing bid:", bidAmount);
  };

//   const handleBuyNow = () => {
//     // TODO: Implement buy now logic
//     console.log("Buy now clicked");
//   };

  const categoryName = useMemo(() => {
    if (!product?.category) return "";
    return typeof product.category === "object"
      ? (product.category as any).name
      : product.category;
  }, [product?.category]);

  const sellerName = useMemo(() => {
    if (!product?.seller) return "Tech Store HN";
    return typeof product.seller === "object"
      ? (product.seller as any).name || "Tech Store HN"
      : "Tech Store HN";
  }, [product?.seller]);

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
        <p className="text-lg text-gray-600">Không thể tải thông tin sản phẩm</p>
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
          <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate("/")}>
            Trang chủ
          </span>
          <span className="text-gray-400">›</span>
          <span className="cursor-pointer hover:text-blue-600 transition-colors">{categoryName}</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-5 rounded-lg shadow">
          {/* Left: Product Images */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              {mainImage && <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-20 h-15 rounded border-2 overflow-hidden cursor-pointer transition-colors ${
                      index === selectedImageIndex ? "border-blue-600" : "border-transparent hover:border-blue-600"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-semibold mb-2 text-gray-800">{product.name}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Người bán:</span>
                <span className="text-blue-600 font-medium">{sellerName}</span>
                <span className="text-orange-400">⭐ 5.0</span>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <span className="block text-sm text-gray-600 mb-2">Thời gian còn lại</span>
              <div className="flex items-center gap-2">
                <AccessTime className="text-orange-600 !text-xl" />
                <span className="text-2xl font-semibold text-orange-600">{timeRemaining}</span>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col mb-4">
                <span className="text-sm text-gray-600 mb-1">Giá hiện tại</span>
                <span className="text-3xl font-bold text-red-600">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Người đặt giá cao nhất:</span>
                  <span className="text-gray-800 font-medium">{product.highest_bidder_name || "gamer_pro"}</span>
                  <span className="text-blue-600 ml-auto">15 lượt đặt giá</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Cao nhất của bạn:</span>
                  <span className="text-gray-800 font-medium">Chưa có giá</span>
                </div>
              </div>
            </div>

            {/* Bid Form */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs text-gray-600">Tối thiểu: $1900</span>
                <input
                  type="text"
                  className="px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-base"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Nhập giá"
                />
              </div>
              <button 
                className="px-8 py-3 bg-yellow-400 text-gray-800 rounded font-semibold hover:bg-yellow-500 transition-colors self-end"
                onClick={handleBid}
              >
                Đặt giá
              </button>
            </div>

            {/* Buy Now */}
            {product.buy_now_price && (
              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                <span className="text-orange-700 text-sm font-medium">
                  Mua ngay {formatCurrency(product.buy_now_price)}
                </span>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bước giá:</span>
                <span className="text-gray-800 font-medium">$100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ngày kết đầu giá:</span>
                <span className="text-gray-800 font-medium">{formatDate(product.end_date as any)}</span>
              </div>
            </div>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thông tin chi tiết</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{product.description || "Chưa có mô tả chi tiết."}</p>
                {product.description_updates &&
                  product.description_updates.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <h4 className="text-base font-semibold mb-4 text-gray-800">Cập nhật mô tả:</h4>
                      {product.description_updates.map((update, index) => (
                        <div key={index} className="mb-4 p-2 bg-gray-50 rounded">
                          <p className="mb-1 text-gray-700">{update.content}</p>
                          <span className="text-xs text-gray-400">
                            {formatDate(update.created_at as any)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                <div className="mt-5">
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">Thông tin kỹ thuật</h4>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Laptop Gaming cao cấp ASUS ROG, RTX 4090, i9-13900HX, 32GB
                    RAM, 2TB SSD, Độ sánh cao, màn hình FHD, cân mọi game, Như
                    mới
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                    <div className="text-sm text-gray-600">
                      <strong className="text-gray-800">Tình trạng:</strong> Như mới
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong className="text-gray-800">Danh mục:</strong> {categoryName}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "bidHistory" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Lịch sử đấu giá</h3>
                <p className="text-gray-400 italic">Chưa có lịch sử đấu giá</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">Sản phẩm cùng chuyên mục</h2>
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

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTimeRemaining } from "../../utilities";
import { Gavel } from "lucide-react";
import { ProductList, QnABox } from "../../components/Product";


export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "qna">(
    "description"
  );
  const [, setTick] = useState(0);

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
        setBidAmount(currentProduct.step_price?.toString() || "");

        const categoryId = currentProduct.category?._id;
        const sellerId = currentProduct.seller?._id;

        const relatedPromise = categoryId
          ? fetch(apiUrl(`/api/products?category=${categoryId}&limit=6`)).then(
              (res) =>
                res.ok ? res.json() : Promise.reject("Related fetch failed")
            )
          : Promise.reject("No category");

        const sellerPromise = sellerId
          ? fetch(apiUrl(`/api/products/seller/${sellerId}`)).then((res) =>
              res.ok ? res.json() : Promise.reject("Seller fetch failed")
            )
          : Promise.reject("No seller");

        const [relatedResult, sellerResult] = await Promise.allSettled([
          relatedPromise,
          sellerPromise,
        ]);

        if (relatedResult.status === "fulfilled") {
          const res = relatedResult.value;
          setRelatedProducts(
            res.data?.filter((p: any) => p.id !== currentProduct.id) || []
          );
        } else {
          console.warn("Lỗi tải sản phẩm liên quan:", relatedResult.reason);
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
        <div className="w-10 h-10 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
                        ? "border-yellow-600"
                        : "border-transparent hover:border-yellow-600"
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
          <div className="flex flex-col gap-4">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-semibold mb-2 text-gray-800">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex gap-0.5">
                  <span className="text-gray-600">Người bán:</span>
                  <span className="text-yellow-600 font-medium">
                    {seller?.full_name}
                  </span>
                </div>
                <span className="flex justify-center items-center text-orange-400">
                  <Star></Star>
                  {seller?.rating_percentage || 0}%
                </span>
                <div className="flex gap-0.5">
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

            {/* Bid Form */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="col-span-3 flex flex-col gap-2">
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-600 text-black text-base"
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Tối thiểu: ${formatCurrency(
                    currentPrice + product.step_price
                  )}`}
                />

                {/* Related Products */}
                <ProductList
                    title="Sản phẩm cùng chuyên mục"
                    subtitle="Các sản phẩm có giá trị cao nhất hiện tại"
                    products={relatedProducts}
                    onBidClick={handleBidClick}
                    onViewDetails={handleViewDetails}
                />

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
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
              className={`flex-1 px-4 py-4 text-base font-medium transition-colors relative ${
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
            {activeTab === "qna" && (
              <div className="animate-fade-in">
                <div className="-mt-8"> 
                  <QnABox 
                    productId={product.id} 
                    sellerId={typeof product.seller === 'object' ? (product.seller as any)?._id || (product.seller as any)?.id : product.seller}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
    );
};

export default ProductDetail;

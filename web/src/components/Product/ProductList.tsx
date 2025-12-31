import { ChevronLeft, ChevronRight, ArrowForward } from "@mui/icons-material";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { useInfiniteLoop } from "../../hooks/useInfiniteLoops";
import type { Product } from "../../types";

export interface ProductListProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  onBidClick?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  loading?: boolean;
  showViewMore?: boolean;
  onViewMore?: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  title = "Top 5 gần kết thúc",
  subtitle = "Đừng bỏ lỡ cơ hội đấu giá những sản phẩm này",
  products,
  onBidClick,
  onViewDetails,
  loading = false,
  showViewMore = false,
  onViewMore,
}) => {
  const ITEM_WIDTH = 300;

  const { containerRef, extendedItems, scroll } = useInfiniteLoop(
    products,
    ITEM_WIDTH
  );

  return (
    <section className="w-full bg-gray-50">
      <div className=" mx-auto p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>

          {/* Navigation Buttons or View More Button */}
          {showViewMore ? (
            <button
              onClick={onViewMore}
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer"
            >
              <span>Xem thêm</span>
              <ArrowForward fontSize="small" />
            </button>
          ) : (
            products.length >= 5 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  aria-label="Next products"
                >
                  <ChevronRight className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            )
          )}
        </div>
        {/* Products Carousel */}

        {loading ? (
          <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : showViewMore ? (
          <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide">
            {products.slice(0, 5).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                {...(onBidClick ? { onBidClick } : {})}
                {...(onViewDetails ? { onViewDetails } : {})}
              />
            ))}
          </div>
        ) : products.length < 5 ? (
          <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                {...(onBidClick ? { onBidClick } : {})}
                {...(onViewDetails ? { onViewDetails } : {})}
              />
            ))}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide"
          >
            {extendedItems.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                product={product}
                {...(onBidClick ? { onBidClick } : {})}
                {...(onViewDetails ? { onViewDetails } : {})}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </section>
  );
};

export default ProductList;

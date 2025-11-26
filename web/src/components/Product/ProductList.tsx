import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ProductCard } from "./ProductCard";
import { useInfiniteLoop } from "../../hooks/useInfiniteLoops";
import type { Product } from "../../types";

export interface ProductListProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  onBidClick?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  title = "Top 5 gần kết thúc",
  subtitle = "Đừng bỏ lỡ cơ hội đấu giá những sản phẩm này",
  products,
  onBidClick,
  onViewDetails,
}) => {
  const ITEM_WIDTH = 300;

  const { containerRef, extendedItems, scroll } = useInfiniteLoop(products, ITEM_WIDTH);

  return (
    <section className="w-full bg-gray-50 ">
      <div className="max-w-7xl mx-auto p-4">
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

          {/* Navigation Buttons */}
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
        </div>

        {/* Products Carousel */}
        <div
          ref={containerRef}
          className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide hide-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {extendedItems.map((product, index) => (
            <ProductCard
              key={`${product.id} - ${index}`}
              product={product}
              onBidClick={onBidClick}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default ProductList;

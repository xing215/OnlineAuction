import ProductFilters from '../components/Product/ProductFilter';
import ProductCardGrid from '../components/Product/ProductCardGrid'; 
import Pagination from '../components/Product/Pagination';
import { useProductFiltering } from '../hooks/useProductFiltering';
import { useCategories } from '../hooks/useCategories';

export default function ProductListPage() {
  const { categories } = useCategories(); // Lấy danh mục

  const {
    currentProducts,
    totalResults,
    totalPages,
    activeCategory,
    searchQuery,
    sortOption,
    currentPage,
    isLoading,
    error,
    setActiveCategory,
    setSearchQuery,
    setSortOption,
    setCurrentPage,
  } = useProductFiltering(); // Lấy sản phẩm

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Danh sách sản phẩm</h1>
        <p className="text-gray-500 mb-6">Khám phá và đấu giá các sản phẩm yêu thích</p>
        
        <ProductFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalProducts={totalResults}
        />

        {isLoading ? (
          <div className="flex justify-center py-20">Đang tải...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : (
          <>
            <ProductCardGrid products={currentProducts} />
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </>
        )}
      </div>
    </div>
  );
}
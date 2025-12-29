import ProductFilters from '../components/Product/ProductFilter';
import ProductCardGrid from '../components/Product/ProductCardGrid'; 
import Pagination from '../components/Product/Pagination';
import { useProductFiltering } from '../hooks/useProductFiltering';
import { useCategories } from '../hooks/useCategories';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProductListPage() {
  const { categories, isLoadingCategories } = useCategories(); // Lấy danh mục
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Sync activeCategory and sortOption with URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    const sortParam = searchParams.get('sort') || 'newest';
    
    if (categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }
    if (sortParam !== sortOption) {
      setSortOption(sortParam);
    }
  }, [searchParams, activeCategory, sortOption, setActiveCategory, setSortOption]);

  // Update URL when activeCategory changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    setSearchParams(newParams);
  };

  // Update URL when sortOption changes
  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    const newParams = new URLSearchParams(searchParams);
    if (sort === 'time_desc') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', sort);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Danh sách sản phẩm</h1>
        <p className="text-gray-500 mb-6">Khám phá và đấu giá các sản phẩm yêu thích</p>
        
        <ProductFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          totalProducts={totalResults}
          isLoadingCategories={isLoadingCategories}
        />

        {error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : (
          <>
            <ProductCardGrid products={currentProducts} loading={isLoading} />
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
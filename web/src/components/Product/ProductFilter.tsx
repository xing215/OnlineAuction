import type { Category } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryID: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  totalProducts: number;
}

export default function ProductFilters({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  totalProducts,
}: ProductFiltersProps) {
  return (
    <div className="mb-8 space-y-6">
      {/* 1. Search */}
      <div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Horizontal Filter Categories */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4" />
            </svg>
          </span>
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap mr-2">Danh mục:</span>
            {categories.map((cat) => {
              const categoryId = cat.id;

              return (
                <button
                  key={categoryId} 
                  
                  onClick={() => onCategoryChange(categoryId)}
                  
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === categoryId
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
        </div>
      </div>

      {/* 3. Count & Sort */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
        <span className="text-sm text-gray-500">Tìm thấy <b className="text-gray-900">{totalProducts}</b> kết quả</span>

        <div>
          <span className="text-sm text-gray-500 mr-2">Sắp xếp theo:</span>
          <select
            className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sắp xếp theo"
          >
            <option value="newest">Mới đăng</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="end_date_asc">Thời gian kết thúc giảm dần</option>
            <option value="end_date_desc">Thời gian kết thúc tăng dần</option>
          </select>
        </div>
      </div>
    </div>
  );
}
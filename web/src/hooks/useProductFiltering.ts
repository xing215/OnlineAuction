import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useDebounce } from './useDebounce';

// Cấu hình URL API trực tiếp tại đây
// Lưu ý: Port 3000 là port của Backend Node.js bạn đã cài đặt
const API_URL = 'http://localhost:3000/api/products';
const ITEMS_PER_PAGE = 8;

export const useProductFiltering = () => {
  // --- 1. STATE UI (Bộ lọc) ---
  // Lưu ý: activeCategory ban đầu nên là 'all' để khớp với logic Backend
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // --- 2. STATE DATA (Dữ liệu từ API) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search (Chờ 500ms sau khi ngừng gõ mới gọi API)
  const debouncedSearch = useDebounce(searchQuery, 500);

  // --- 3. EFFECT: Gọi API trực tiếp ---
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // A. Xây dựng tham số (Query String)
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', ITEMS_PER_PAGE.toString());
        params.append('sort', sortOption);

        // Chỉ gửi search nếu có nội dung
        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        // Chỉ gửi category nếu khác 'all'
        // (activeCategory lúc này đang chứa _id của danh mục)
        if (activeCategory && activeCategory !== 'all') {
          params.append('category', activeCategory);
        }

        // B. Thực hiện gọi Fetch
        const response = await fetch(`${API_URL}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Lỗi kết nối đến Server');
        }

        const data = await response.json();

        // C. Cập nhật State dựa trên phản hồi từ Server
        if (data.success) {
          setProducts(data.data);
          // Lưu ý: Đảm bảo Backend trả về đúng tên trường này (xem lại productController.js)
          setTotalResults(data.total_items); 
          setTotalPages(data.total_pages);
        } else {
          setProducts([]);
          setTotalResults(0);
        }

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || 'Không tải được dữ liệu');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

  }, [activeCategory, debouncedSearch, sortOption, currentPage]); 

  // Reset về trang 1 khi thay đổi bộ lọc (Search, Category, Sort)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, debouncedSearch, sortOption]);

  // --- 4. RETURN ---
  return {
    currentProducts: products,
    totalResults,
    totalPages,
    isLoading,
    error,
    
    activeCategory,
    searchQuery,
    sortOption,
    currentPage,
    
    setActiveCategory,
    setSearchQuery,
    setSortOption,
    setCurrentPage,
  };
};
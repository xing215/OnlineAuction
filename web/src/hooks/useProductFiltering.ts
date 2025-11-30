import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useDebounce } from './useDebounce';
import { apiUrl } from "../config/api";

const API_URL = apiUrl('/api/products');

const ITEMS_PER_PAGE = 8;

export const useProductFiltering = () => {
  // --- 1. STATE UI (Bộ lọc) ---
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
        // Lưu ý: activeCategory phải là ID
        if (activeCategory && activeCategory !== 'all') {
          params.append('category', activeCategory);
        }

        // B. Thực hiện gọi Fetch
        const response = await fetch(`${API_URL}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // C. Cập nhật State dựa trên phản hồi từ Server
        if (data.success) {
          setProducts(data.data);
          setTotalResults(data.total_items); 
          setTotalPages(data.total_pages);
        } else {
          setProducts([]);
          setTotalResults(0);
          setError(data.message || 'Lỗi không xác định từ server');
        }

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || 'Không thể tải dữ liệu sản phẩm');
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
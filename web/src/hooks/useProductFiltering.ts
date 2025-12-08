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
    // 1. Tạo biến cờ để kiểm soát Race Condition
    let isCancelled = false;

    const fetchProducts = async () => {
      // 2. Clear dữ liệu cũ NGAY LẬP TỨC để tránh hiện nội dung cũ
      setProducts([]); 
      setTotalResults(0);
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', ITEMS_PER_PAGE.toString());
        params.append('sort', sortOption);

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        if (activeCategory && activeCategory !== 'all') {
          params.append('category', activeCategory);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // cập nhật State nếu chưa bị cancel
        if (!isCancelled) {
          if (data.success) {
            setProducts(data.data);
            setTotalResults(data.total_items); 
            setTotalPages(data.total_pages);
          } else {
            setProducts([]);
            setTotalResults(0);
            setError(data.message || 'Lỗi không xác định từ server');
          }
        }

      } catch (err: unknown) {
        // Chỉ báo lỗi nếu chưa cancel
        if (!isCancelled) {
          console.error("Fetch error:", err);
          setError((err as Error).message || 'Không thể tải dữ liệu sản phẩm');
          setProducts([]);
        }
      } finally {
        // Chỉ tắt loading nếu chưa cancel
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };

  }, [activeCategory, debouncedSearch, sortOption, currentPage]); 

  // Reset về trang 1 khi thay đổi bộ lọc
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
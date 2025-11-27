import ProductFilters from '../components/Product/ProductFilter';
import ProductList from '../components/Product/ProductList';
import type { Product } from '../types/index';
import Pagination from '../components/Product/Pagination';
import { useState, useEffect, useMemo } from 'react';

// --- MOCK DATA ---
const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Vintage Rolex Submariner Watch',
      description: 'Rare 1960s Rolex Submariner in excellent condition with original box and papers. A true collector\'s item.',
      currentBid: 15750.00,
      buyNowPrice: 10000.00,
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      bidCount: 23,
      seller: 'LuxuryTimepieces',
      category: 'Watches'
    },
    {
      id: '2',
      title: 'MacBook Pro 16-inch M3 Max',
      description: 'Brand new sealed MacBook Pro with M3 Max chip, 64GB RAM, 2TB SSD. Space Black.',
      currentBid: 3200.00,
      buyNowPrice: 2500.00,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      bidCount: 45,
      seller: 'TechDeals',
      category: 'Electronics'
    },
    {
      id: '3',
      title: 'Vintage Gibson Les Paul Guitar',
      description: '1959 Gibson Les Paul Standard in sunburst finish. Professionally restored.',
      currentBid: 125000.00,
      buyNowPrice: 80000.00,
      imageUrl: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() - 1000), // Already ended
      bidCount: 156,
      seller: 'VintageGuitarsUSA',
      category: 'Musical Instruments'
    },
    {
      id: '4',
      title: 'Rare First Edition Book Collection',
      description: 'Complete set of Harry Potter first editions, all signed by J.K. Rowling.',
      currentBid: 8500.00,
      buyNowPrice: 5000.00,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bidCount: 12
    },
    {
      id: '5',
      title: 'Rare First Edition Book Collection',
      description: 'Complete set of Harry Potter first editions, all signed by J.K. Rowling.',
      currentBid: 8500.00,
      buyNowPrice: 5000.00,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bidCount: 12
    },
    {
      id: '6',
      title: 'Rare First Edition Book Collection',
      description: 'Complete set of Harry Potter first editions, all signed by J.K. Rowling.',
      currentBid: 8500.00,
      buyNowPrice: 5000.00,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bidCount: 12
    },
    {
      id: '7',
      title: 'Rare First Edition Book Collection',
      description: 'Complete set of Harry Potter first editions, all signed by J.K. Rowling.',
      currentBid: 8500.00,
      buyNowPrice: 5000.00,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bidCount: 12
    },
    {
      id: '8',
      title: 'Rare First Edition Book Collection',
      description: 'Complete set of Harry Potter first editions, all signed by J.K. Rowling.',
      currentBid: 8500.00,
      buyNowPrice: 5000.00,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bidCount: 12
    },
    {
      id: '9',
      title: 'Rare First Edition Book Collection',
      description: 'Complete set of Harry Potter first editions, all signed by J.K. Rowling.',
      currentBid: 8500.00,
      buyNowPrice: 5000.00,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      bidCount: 12
    }
  ];
const categories = ['Tất cả', 'Electronics', 'Fashion', 'Collectibles', 'Sports', 'Jewelry & Watches', 'Home & Garden'];
const ITEMS_PER_PAGE = 8;

export default function ProductListPage() {
  // 1. STATE MANAGEMENT
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // 2. LOGIC FILTER & SORT
  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      const matchCategory = activeCategory === 'Tất cả' || product.category === activeCategory;
      const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    const sorted = [...filtered];

    if (sortOption === 'price_asc') sorted.sort((a, b) => a.currentBid - b.currentBid);
    if (sortOption === 'price_desc') sorted.sort((a, b) => b.currentBid - a.currentBid);

    return sorted;
  }, [activeCategory, searchQuery, sortOption]);
  // 3. PAGINATION LOGIC
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortOption]);

  // 3. RENDER UI
  return (
    <div className="min-h-screen bg-white p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Danh sách sản phẩm</h1>
        <p className="text-gray-500 mb-6">Khám phá và đấu giá các sản phẩm yêu thích</p>
        
        {/* Phần Bộ Lọc */}
        <ProductFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalProducts={filteredProducts.length}
        />

        {/* Phần Danh Sách */}
        <ProductList products={currentProducts} />
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />

      </div>
    </div>
  );
}
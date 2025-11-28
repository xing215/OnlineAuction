import ProductFilters from '../components/Product/ProductFilter';
import ProductList from '../components/Product/ProductList';
import type { Product } from '../types/index';
import Pagination from '../components/Product/Pagination';
import { useState, useEffect, useMemo } from 'react';

// --- MOCK DATA ---
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Vintage Rolex Submariner Watch",
    category: "Watches",
    seller: "LuxuryTimepieces",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop",
    ],
    description:
      "Rare 1960s Rolex Submariner in excellent condition with original box and papers.",
    description_updates: [],
    start_price: 9500,
    step_price: 250,
    buy_now_price: 18500,
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 15750,
    bid_count: 23,
    highest_bidder_name: "collector_vn",
  },
  {
    id: "2",
    name: "MacBook Pro 16-inch M3 Max",
    category: "Electronics",
    seller: "TechDeals",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
    ],
    description:
      "Brand new sealed MacBook Pro with M3 Max chip, 64GB RAM, 2TB SSD.",
    description_updates: [],
    start_price: 2500,
    step_price: 50,
    buy_now_price: 3600,
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 30 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 3200,
    bid_count: 45,
    highest_bidder_name: "tech_master",
  },
  {
    id: "3",
    name: "Vintage Gibson Les Paul Guitar",
    category: "Musical Instruments",
    seller: "VintageGuitarsUSA",
    images: [
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop",
    ],
    description: "1959 Gibson Les Paul Standard in sunburst finish.",
    description_updates: [],
    start_price: 80000,
    step_price: 500,
    buy_now_price: 150000,
    posted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() - 1000),
    status: "sold",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 125000,
    bid_count: 156,
    highest_bidder_name: "vintage_fan",
  },
  {
    id: "4",
    name: "Rare First Edition Book Collection",
    category: "Collectibles",
    seller: "BookVault",
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop",
    ],
    description: "Complete set of Harry Potter first editions, signed by J.K. Rowling.",
    description_updates: [],
    start_price: 5000,
    step_price: 100,
    buy_now_price: 9800,
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 8500,
    bid_count: 12,
    highest_bidder_name: "bookworm",
  },
  {
    id: "5",
    name: "Limited Edition Sneaker Set",
    category: "Fashion",
    seller: "SneakerSpot",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop",
    ],
    description: "Collection of three limited release sneakers in pristine condition.",
    description_updates: [],
    start_price: 700,
    step_price: 25,
    buy_now_price: 1200,
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 950,
    bid_count: 31,
    highest_bidder_name: "sneaker_head",
  },
  {
    id: "6",
    name: "Canon EOS R5 Camera Kit",
    category: "Electronics",
    seller: "PhotoStore",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop",
    ],
    description: "Professional mirrorless camera with RF 24-70mm lens.",
    description_updates: [],
    start_price: 1500,
    step_price: 50,
    buy_now_price: 2300,
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 1650,
    bid_count: 18,
    highest_bidder_name: "photo_expert",
  },
  {
    id: "7",
    name: "Genuine Leather Jacket",
    category: "Fashion",
    seller: "StyleHub",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop",
    ],
    description: "Handcrafted leather jacket with modern fit.",
    description_updates: [],
    start_price: 350,
    step_price: 20,
    buy_now_price: 620,
    posted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 450,
    bid_count: 23,
    highest_bidder_name: "fashionista",
  },
  {
    id: "8",
    name: "Swiss Luxury Watch",
    category: "Luxury",
    seller: "TimepieceWorld",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop",
    ],
    description: "Swiss-made automatic chronograph with sapphire crystal.",
    description_updates: [],
    start_price: 2000,
    step_price: 100,
    buy_now_price: 3200,
    posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 12 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 2450,
    bid_count: 41,
    highest_bidder_name: "timekeeper",
  },
  {
    id: "9",
    name: "High-End Gaming Laptop",
    category: "Electronics",
    seller: "GameNation",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop",
    ],
    description: "RTX 4090 gaming laptop with 32GB RAM and 4K display.",
    description_updates: [],
    start_price: 1800,
    step_price: 75,
    buy_now_price: 2600,
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: "active",
    banned_bidders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    current_price: 1990,
    bid_count: 52,
    highest_bidder_name: "gamer_pro",
  },
];
const categories = ['Tất cả', 'Electronics', 'Fashion', 'Collectibles', 'Watches', 'Musical Instruments', 'Luxury'];
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
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    const sorted = [...filtered];

    const valueOf = (item: Product) => item.current_price ?? item.start_price;

    if (sortOption === 'price_asc') sorted.sort((a, b) => valueOf(a) - valueOf(b));
    if (sortOption === 'price_desc') sorted.sort((a, b) => valueOf(b) - valueOf(a));

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
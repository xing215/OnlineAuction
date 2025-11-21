import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

/**
 * Example usage of ProductCard component with Tailwind CSS
 */
export const ProductCardExample = () => {
  const handleBid = (productId: string) => {
    console.log('Placing bid on product:', productId);
    // Implement bid logic here
  };

  const handleViewDetails = (productId: string) => {
    console.log('Viewing details for product:', productId);
    // Implement navigation to product details page
  };

  // Sample product data
  const products: Product[] = [
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
    }
  ];

  return (
    <div className="flex gap-6 flex-wrap p-5 justify-center bg-gray-50 dark:bg-gray-900 min-h-screen">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onBidClick={handleBid}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
};

export default ProductCardExample;

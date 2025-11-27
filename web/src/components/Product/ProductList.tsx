import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

interface ProductListProps {
  products: Product[];
}
export const ProductList = ({ products }: ProductListProps) => {
  const handleBid = (productId: string) => {
    console.log('Placing bid on product:', productId);
    // Implement bid logic here
  };

  const handleViewDetails = (productId: string) => {
    console.log('Viewing details for product:', productId);
    // Implement navigation to product details page
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 content-start">
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

export default ProductList;

import { ProductCard } from "./ProductCard";
import type { Product } from "../../types";
import { useNavigate } from "react-router-dom";

interface ProductListProps {
    products: Product[];
}
export const ProductCardGrid = ({ products }: ProductListProps) => {
    const navigate = useNavigate();

    const handleBid = (productId: string) => {
        console.log("Placing bid on product:", productId);
        // Navigate to product detail page for bidding
        navigate(`/product/${productId}`);
    };

    const handleViewDetails = (productId: string) => {
        console.log("Viewing details for product:", productId);
        // Navigate to product details page
        navigate(`/product/${productId}`);
    };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 content-start">
            {products.map((product) => (
                <ProductCard
                    key={product._id}
                    product={product}
                    onBidClick={handleBid}
                    onViewDetails={handleViewDetails}
                />
            ))}
        </div>
    );
};

export default ProductCardGrid;

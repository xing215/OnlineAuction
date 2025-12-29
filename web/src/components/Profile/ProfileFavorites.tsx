import { useState, useMemo } from "react";
import { ProductCard } from "../Product/ProductCard";
import Pagination from "../Product/Pagination";
import { useFavorites } from "../../hooks/useFavorites";
import type { Product } from "../../types/index";

const PRODUCTS_PER_PAGE = 8;

export default function ProfileFavorites() {
    const [favCurrentPage, setFavCurrentPage] = useState(1);
    const {
        favorites,
        isLoading: favLoading,
        error: favError,
    } = useFavorites();

    // Calculate pagination for favorites
    const favTotalPages = useMemo(
        () => Math.ceil(favorites.length / PRODUCTS_PER_PAGE),
        [favorites.length]
    );

    const paginatedFavorites = useMemo(() => {
        const startIndex = (favCurrentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        return favorites.slice(startIndex, endIndex);
    }, [favorites, favCurrentPage]);

    const handleFavPageChange = (page: number) => {
        setFavCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Hàm xử lý sự kiện card
    const handleBid = (id: string) => console.log("Đặt giá sản phẩm:", id);
    const handleView = (id: string) => console.log("Xem chi tiết:", id);

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
                Sản phẩm yêu thích ({favorites.length})
            </h3>
            {favLoading ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            ) : favError ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-red-300">
                    <p className="text-red-500">{favError}</p>
                </div>
            ) : favorites.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500">
                        Chưa có sản phẩm yêu thích nào.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedFavorites.map((product: Product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onBidClick={handleBid}
                                onViewDetails={handleView}
                            />
                        ))}
                    </div>
                    {favTotalPages > 1 && (
                        <Pagination
                            currentPage={favCurrentPage}
                            totalPages={favTotalPages}
                            onPageChange={handleFavPageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}

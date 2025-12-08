import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useFavorites } from "../hooks/useFavorites";
import ProductCardGrid from "../components/Product/ProductCardGrid";
import Pagination from "../components/Product/Pagination";
import {
    FavListHeader,
    FavListEmptyState,
    FavListLoginPrompt,
} from "../components/Favorites";

const PRODUCTS_PER_PAGE = 8;

export default function FavList() {
    const navigate = useNavigate();
    const { favorites, isLoading, error, hasUser } = useFavorites();
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = useMemo(
        () => Math.ceil(favorites.length / PRODUCTS_PER_PAGE),
        [favorites.length]
    );

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        return favorites.slice(startIndex, endIndex);
    }, [favorites, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!hasUser) {
        return <FavListLoginPrompt />;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1480px] px-8 py-8">
                <FavListHeader
                    productCount={favorites.length}
                    isLoading={isLoading}
                />

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="text-lg text-[#6B6B6B]">
                            Đang tải...
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-lg font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                ) : favorites.length === 0 ? (
                    <FavListEmptyState onExploreClick={() => navigate("/")} />
                ) : (
                    <>
                        <ProductCardGrid products={paginatedProducts} />
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

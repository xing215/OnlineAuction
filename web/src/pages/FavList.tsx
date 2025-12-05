import { useNavigate } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import ProductCardGrid from "../components/Product/ProductCardGrid";
import {
    FavListHeader,
    FavListEmptyState,
    FavListLoginPrompt,
} from "../components/Favorites";

export default function FavList() {
    const navigate = useNavigate();
    const { favorites, isLoading, error, hasUser } = useFavorites();

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
                    <ProductCardGrid products={favorites} />
                )}
            </div>
        </div>
    );
}

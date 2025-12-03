import { useState, useEffect } from "react";
import type { Product } from "../types";
import { useUser } from "../context/useUser";
import { apiUrl } from "../config/api";

export const useFavorites = () => {
    const { user, token } = useUser();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user || !user.watch_list || user.watch_list.length === 0) {
                setIsLoading(false);
                setFavorites([]);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch all products and filter by watch_list IDs
                const response = await fetch(apiUrl("/api/products"), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách sản phẩm");
                }

                const data = await response.json();
                const allProducts = data.data || data.products || [];

                // Filter products that are in user's watch_list
                const favoriteProducts = allProducts.filter(
                    (product: Product) => user.watch_list?.includes(product.id)
                );

                setFavorites(favoriteProducts);
            } catch (err) {
                console.error("Error fetching favorites:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Đã xảy ra lỗi khi tải sản phẩm yêu thích"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, [user, token]);

    return {
        favorites,
        isLoading,
        error,
        hasUser: !!user,
    };
};

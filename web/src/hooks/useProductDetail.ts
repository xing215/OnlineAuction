import { useState, useEffect } from "react";
import { apiUrl } from "../config/api";
import type { Product, User } from "../types";

interface UseProductDetailReturn {
    product: Product | null;
    seller: User | null;
    relatedProducts: Product[];
    loading: boolean;
    error: string | null;
    setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

export const useProductDetail = (
    productId: string | undefined
): UseProductDetailReturn => {
    const [product, setProduct] = useState<Product | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAllData = async () => {
            if (!productId) return;

            setLoading(true);
            setRelatedProducts([]);
            setError(null);

            try {
                const productRes = await fetch(
                    apiUrl(`/api/products/${productId}`)
                );
                if (!productRes.ok) throw new Error("Failed to fetch product");

                const productData = await productRes.json();
                const currentProduct = productData.data;

                setProduct(currentProduct);

                const categoryId = currentProduct.category?._id;
                const sellerId = currentProduct.seller?._id;

                const relatedPromise = categoryId
                    ? fetch(
                          apiUrl(`/api/products?category=${categoryId}&limit=6`)
                      ).then((res) =>
                          res.ok
                              ? res.json()
                              : Promise.reject("Related fetch failed")
                      )
                    : Promise.reject("No category");

                const sellerPromise = sellerId
                    ? fetch(apiUrl(`/api/products/seller/${sellerId}`)).then(
                          (res) =>
                              res.ok
                                  ? res.json()
                                  : Promise.reject("Seller fetch failed")
                      )
                    : Promise.reject("No seller");

                const [relatedResult, sellerResult] = await Promise.allSettled([
                    relatedPromise,
                    sellerPromise,
                ]);

                if (relatedResult.status === "fulfilled") {
                    const res = relatedResult.value;
                    setRelatedProducts(
                        res.data?.filter(
                            (p: any) => p.id !== currentProduct.id
                        ) || []
                    );
                } else {
                    console.warn(
                        "Lỗi tải sản phẩm liên quan:",
                        relatedResult.reason
                    );
                }

                if (sellerResult.status === "fulfilled") {
                    const res = sellerResult.value;
                    setSeller(res.data);
                } else {
                    console.warn("Lỗi tải tên người bán:", sellerResult.reason);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [productId]);

    return {
        product,
        seller,
        relatedProducts,
        loading,
        error,
        setProduct,
    };
};

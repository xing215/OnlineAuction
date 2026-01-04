import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import { useUser } from "../context/useUser";
import type { Product } from "../types/index";

interface BiddingProduct extends Product {
    my_highest_bid: number;
}

interface WonProduct extends Product {
    final_price: number;
    order_id: string;
    order_status: string;
    won_at: string;
}

export const useUserBids = () => {
    const { user, token, loading: authLoading } = useUser();
    const [biddingProducts, setBiddingProducts] = useState<BiddingProduct[]>([]);
    const [wonProducts, setWonProducts] = useState<WonProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }

        // If no user/token after auth loaded, stop loading
        if (!token || !user?._id) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem lịch sử đấu giá");
            return;
        }

        const fetchUserBids = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch bidding products (products user has bid on that are still active)
                const biddingResponse = await fetch(
                    apiUrl("/api/products/my-bidding"),
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (biddingResponse.ok) {
                    const biddingData = await biddingResponse.json();
                    if (biddingData.success) {
                        setBiddingProducts(biddingData.data);
                    }
                } else {
                    console.error("Failed to fetch bidding products");
                }

                // Fetch won products
                const wonResponse = await fetch(
                    apiUrl("/api/products/my-won"),
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (wonResponse.ok) {
                    const wonData = await wonResponse.json();
                    if (wonData.success) {
                        setWonProducts(wonData.data);
                    }
                } else {
                    console.error("Failed to fetch won products");
                }
            } catch (err) {
                console.error("Error fetching user bids:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch bid data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserBids();
    }, [user?._id, token, authLoading]);

    return {
        biddingProducts,
        wonProducts,
        loading,
        error,
    };
};
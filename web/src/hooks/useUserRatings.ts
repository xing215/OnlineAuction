import { useState, useEffect } from "react";
import { useUser } from "../context/useUser";
import { apiUrl } from "../config/api";
import type { OrderView } from "../types";

interface RatingItem {
    id: string;
    orderId: string;
    productName: string;
    raterName: string; // Người đánh giá
    raterId: string;
    score: 1 | -1;
    comment: string;
    created_at: Date;
    role: "seller" | "winner"; // User nhận đánh giá với vai trò gì
}

export const useUserRatings = () => {
    const { user, token } = useUser();
    const [ratings, setRatings] = useState<RatingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRatings = async () => {
            if (!user || !token) {
                setIsLoading(false);
                setRatings([]);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch all orders where user is either seller or winner
                const response = await fetch(apiUrl("/api/orders/my-orders"), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách đánh giá");
                }

                const data = await response.json();
                const orders: OrderView[] = data.data || [];

                const ratingsList: RatingItem[] = [];

                orders.forEach((order) => {
                    // Nếu user là seller và có winner_feedback
                    if (order.seller === user.id && order.winner_feedback) {
                        const winnerName =
                            typeof order.winner_detail === "object" &&
                            order.winner_detail
                                ? order.winner_detail.full_name
                                : "Người mua";

                        ratingsList.push({
                            id: `${order.id}-winner-feedback`,
                            orderId: order.id,
                            productName:
                                typeof order.product_detail === "object" &&
                                order.product_detail
                                    ? order.product_detail.name
                                    : "Sản phẩm",
                            raterName: winnerName,
                            raterId: order.winner,
                            score: order.winner_feedback.score,
                            comment: order.winner_feedback.comment,
                            created_at: new Date(
                                order.winner_feedback.created_at
                            ),
                            role: "seller",
                        });
                    }

                    // Nếu user là winner và có seller_feedback
                    if (order.winner === user.id && order.seller_feedback) {
                        const sellerName =
                            typeof order.seller_detail === "object" &&
                            order.seller_detail
                                ? order.seller_detail.full_name
                                : "Người bán";

                        ratingsList.push({
                            id: `${order.id}-seller-feedback`,
                            orderId: order.id,
                            productName:
                                typeof order.product_detail === "object" &&
                                order.product_detail
                                    ? order.product_detail.name
                                    : "Sản phẩm",
                            raterName: sellerName,
                            raterId: order.seller,
                            score: order.seller_feedback.score,
                            comment: order.seller_feedback.comment,
                            created_at: new Date(
                                order.seller_feedback.created_at
                            ),
                            role: "winner",
                        });
                    }
                });

                // Sắp xếp theo thời gian mới nhất
                ratingsList.sort(
                    (a, b) => b.created_at.getTime() - a.created_at.getTime()
                );

                setRatings(ratingsList);
            } catch (err) {
                console.error("Error fetching ratings:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Đã xảy ra lỗi khi tải đánh giá"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchRatings();
    }, [user, token]);

    return { ratings, isLoading, error };
};

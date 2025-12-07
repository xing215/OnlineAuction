import { apiUrl } from "../config/api";

export interface PlaceBidRequest {
    productId: string;
    bidAmount: number;
}

export interface PlaceBidResponse {
    success: boolean;
    message: string;
    data?: {
        currentPrice: number;
        bidCount: number;
        highestBidder: string;
    };
}

/**
 * Place a manual bid on a product
 */
export const placeBid = async (
    productId: string,
    bidAmount: number,
    token: string
): Promise<PlaceBidResponse> => {
    try {
        const response = await fetch(apiUrl("/api/bids/place"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId,
                bidAmount,
                isAutoBid: false, // Currently only manual bidding
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to place bid");
        }

        return data;
    } catch (error) {
        console.error("Place bid error:", error);
        throw error;
    }
};

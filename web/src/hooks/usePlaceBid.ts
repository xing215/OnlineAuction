import { apiUrl } from "../config/api";

export interface PlaceBidRequest {
    productId: string;
    bidAmount: number;
    isAutoBid?: boolean;
    maxBid?: number;
}

export interface PlaceBidResponse {
    success: boolean;
    message: string;
    data?: {
        currentPrice: number;
        bidCount: number;
        highestBidder: string;
        isLeading?: boolean;
        isAutoBid?: boolean;
    };
}

/**
 * Place a bid on a product (manual or auto-bid)
 */
export const placeBid = async (
    productId: string,
    bidAmount: number,
    token: string,
    isAutoBid: boolean = false,
    maxBid?: number
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
                isAutoBid,
                ...(isAutoBid && maxBid ? { maxBid } : {}),
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

export interface MyAutoBidResponse {
    success: boolean;
    message?: string;
    data?: {
        maxBid: number;
        currentBidPrice: number;
        isLeading: boolean;
        createdAt: string;
    } | null;
}

/**
 * Get user's current auto-bid for a product
 */
export const getMyAutoBid = async (
    productId: string,
    token: string
): Promise<MyAutoBidResponse> => {
    try {
        const response = await fetch(
            apiUrl(`/api/bids/product/${productId}/my-auto-bid`),
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch auto-bid");
        }

        return data;
    } catch (error) {
        console.error("Get my auto-bid error:", error);
        throw error;
    }
};

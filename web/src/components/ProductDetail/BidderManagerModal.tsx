import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../../config/api";
import { formatCurrency } from "../../utilities/FormatCurrency";
import { useUser } from "../../context/useUser";
import toast from "react-hot-toast";

interface Bidder {
    _id: string;
    user: {
        _id: string;
        username: string;
        full_name: string;
    };
    price: number;
    created_at: string;
    is_banned?: boolean;
}

interface BidderManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
}

export const BidderManagerModal: React.FC<BidderManagerModalProps> = ({
    isOpen,
    onClose,
    productId,
    productName,
}) => {
    const [bidders, setBidders] = useState<Bidder[]>([]);
    const [loading, setLoading] = useState(false);
    const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
    const { token } = useUser();

    useEffect(() => {
        if (isOpen && productId) {
            fetchBidders();
            fetchBannedList();
        }
    }, [isOpen, productId]);

    const fetchBidders = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                apiUrl(`/api/bids/product/${productId}`)
            );
            if (response.ok) {
                const data = await response.json();
                // Sort by price descending
                const sortedBidders = data.data?.sort(
                    (a: Bidder, b: Bidder) => b.price - a.price
                );
                setBidders(sortedBidders || []);
            }
        } catch (error) {
            console.error("Failed to fetch bidders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBannedList = async () => {
        try {
            const res = await fetch(apiUrl(`/api/products/banned/${productId}`));
            if (res.ok) {
                const data = await res.json();
                setBannedUsers(new Set(data.data || []));
            }
        } catch (e) {
            console.error("Failed to load banned list:", e);
        }
    };

    const handleBanBidder = async (userId: string) => {
        const newBanned = new Set(bannedUsers);
        newBanned.add(userId);
        setBannedUsers(newBanned);
        
        try {
            const response = await fetch(apiUrl("/api/products/ban-bidder"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    userId,
                }),
            });

            if (!response.ok) {
                // rollback if API fail
                const rollback = new Set(bannedUsers);
                rollback.delete(userId);
                setBannedUsers(rollback);

                const data = await response.json();
                toast.error(data.message || "Cannot ban user");
            } else {
            await fetchBannedList(); 
        }
        } catch (error) {
        // rollback
        const rollback = new Set(bannedUsers);
        rollback.delete(userId);
        setBannedUsers(rollback);

        toast.error("An error occurred while banning the user");
    }
    };

    const handleUnbanBidder = async (userId: string) => {
        const newBanned = new Set(bannedUsers);
        newBanned.delete(userId);
        setBannedUsers(newBanned);

        try {
            const response = await fetch(
                apiUrl("/api/products/unban-bidder"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        productId,
                        userId,
                    }),
                }
            );

            if (!response.ok) {
            // rollback
            const rollback = new Set(bannedUsers);
            rollback.add(userId);
            setBannedUsers(rollback);

            const data = await response.json();
            toast.error(data.message || "Cannot unban user");
        } else {
            await fetchBannedList(); 
        }
    } catch (error) {
        // rollback
        const rollback = new Set(bannedUsers);
        rollback.add(userId);
        setBannedUsers(rollback);

        toast.error("An error occurred while unbanning the user");
    }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${hours}:${minutes} ${day}-${month}`;
    };

    const bidCount = (userId: string) => {
        return bidders.filter((b) => b.user._id === userId).length;
    };

    const getHighestBid = (userId: string) => {
        const userBids = bidders.filter((b) => b.user._id === userId);
        return userBids.length > 0
            ? Math.max(...userBids.map((b) => b.price))
            : 0;
    };

    const getHighestBidDate = (userId: string) => {
        const userBids = bidders.filter((b) => b.user._id === userId);
        if (userBids.length === 0) return "";
        const highestPrice = Math.max(...userBids.map((b) => b.price));
        const highestBidRecord = userBids.find((b) => b.price === highestPrice);
        return highestBidRecord?.created_at || "";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-[598px] rounded-3xl bg-white shadow-lg flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Quản lý người đặt giá
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Danh sách người đã đặt giá cho "{productName}"
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Bidders List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
                        </div>
                    ) : bidders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có ai đặt giá cho sản phẩm này</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Array.from(
                                new Map(
                                    bidders.map((b) => [b.user._id, b])
                                ).values()
                            ).map((bidder) => {
                                const isBanned = bannedUsers.has(
                                    bidder.user._id
                                );
                                const userBidCount = bidCount(bidder.user._id);
                                const highestBid = getHighestBid(
                                    bidder.user._id
                                );
                                const highestBidDate = getHighestBidDate(
                                    bidder.user._id
                                );
                                return (
                                    <div
                                        key={bidder._id}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                                            isBanned
                                                ? "bg-red-50 border-red-300"
                                                : "bg-white border-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Avatar */}
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                                    isBanned
                                                        ? "bg-red-200"
                                                        : "bg-slate-200"
                                                }`}
                                            >
                                                <svg
                                                    className="w-6 h-6 text-gray-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                </svg>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className={`font-semibold text-base ${
                                                            isBanned
                                                                ? "text-red-600"
                                                                : "text-gray-800"
                                                        }`}
                                                    >
                                                        {bidder.user.full_name}
                                                    </span>
                                                    {isBanned && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                                                            Đã cấm
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>
                                                        {userBidCount} lượt đặt
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-yellow-600">
                                                        {formatCurrency(
                                                            highestBid
                                                        )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatTime(
                                                            highestBidDate
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {isBanned ? (
                                            <button
                                                onClick={() =>
                                                    handleUnbanBidder(
                                                        bidder.user._id
                                                    )
                                                }
                                                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors shrink-0"
                                            >
                                                <span>Bỏ cấm</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleBanBidder(
                                                        bidder.user._id
                                                    )
                                                }
                                                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors shrink-0"
                                            >
                                                <span>Cấm</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BidderManagerModal;

import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../utilities";

interface BidRecord {
    _id: string;
    price: number;
    user: {
        full_name: string;
    };
    created_at: string;
}

interface BidHistoryTableProps {
    productId: string;
}

export const BidHistoryTable: React.FC<BidHistoryTableProps> = ({
    productId,
}) => {
    const [bids, setBids] = useState<BidRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBids, setTotalBids] = useState(0);

    const limit = 10;

    useEffect(() => {
        fetchBidHistory();
    }, [productId, page]);

    const fetchBidHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/bids/product/${productId}?page=${page}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch bid history");
            }

            const data = await response.json();

            if (data.success) {
                setBids(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalBids(data.pagination.total);
            } else {
                setError(data.message || "Failed to load bid history");
            }
        } catch (err) {
            console.error("Fetch bid history error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load bid history"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    if (loading && bids.length === 0) {
        return (
            <div className="text-center py-8 text-gray-600">Đang tải...</div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">Lỗi: {error}</div>
        );
    }

    if (bids.length === 0) {
        return (
            <div className="text-center py-8 text-gray-600">
                Chưa có lịch sử đấu giá
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white">
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-800">
                                Thời điểm
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-800">
                                Người mua
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-800">
                                Giá
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {bids.map((bid, index) => (
                            <tr
                                key={bid._id}
                                className={`${
                                    index % 2 === 0
                                        ? "bg-gray-50"
                                        : "bg-gray-100"
                                } hover:bg-gray-150 transition-colors`}
                            >
                                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                                    {formatDateTime(bid.created_at)}
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                                    {bid.user.full_name}
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                                    {formatCurrency(bid.price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Hiển thị{" "}
                        <span className="font-semibold">{bids.length}</span>{" "}
                        trên <span className="font-semibold">{totalBids}</span>{" "}
                        đấu giá
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Trước
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        page === p
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

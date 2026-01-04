import { X, ThumbsUp, ThumbsDown, Package } from "lucide-react";
import { useUserRatingsByUserId } from "../../hooks/useUserRatingsByUserId";

interface UserRatingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string;
}

export const UserRatingsModal: React.FC<UserRatingsModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
}) => {
    const { ratings, isLoading, error } = useUserRatingsByUserId(userId);

    if (!isOpen) return null;

    // Tính thống kê
    const positiveCount = ratings.filter((r) => r.score === 1).length;
    const negativeCount = ratings.filter((r) => r.score === -1).length;
    const positivePercentage =
        ratings.length > 0
            ? Math.round((positiveCount / ratings.length) * 100)
            : 0;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Đánh giá của {userName}
                        </h2>
                        {!isLoading && !error && (
                            <div className="flex items-center gap-4 text-sm mt-2">
                                <div className="flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-600">
                                        {positiveCount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsDown className="w-4 h-4 text-red-600" />
                                    <span className="font-medium text-red-600">
                                        {negativeCount}
                                    </span>
                                </div>
                                <span className="text-gray-600">
                                    ({positivePercentage}% tích cực)
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Đang tải...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-20">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && ratings.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Chưa có đánh giá nào.</p>
                        </div>
                    )}

                    {!isLoading && !error && ratings.length > 0 && (
                        <div className="space-y-4">
                            {ratings.map((rating) => (
                                <div
                                    key={rating.id}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon đánh giá */}
                                        <div
                                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                                rating.score === 1
                                                    ? "bg-green-100"
                                                    : "bg-red-100"
                                            }`}
                                        >
                                            {rating.score === 1 ? (
                                                <ThumbsUp className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <ThumbsDown className="w-6 h-6 text-red-600" />
                                            )}
                                        </div>

                                        {/* Nội dung */}
                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {rating.raterName}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {rating.role === "seller"
                                                            ? "Người mua đánh giá"
                                                            : "Người bán đánh giá"}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(
                                                        rating.created_at
                                                    ).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            {/* Sản phẩm */}
                                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                                <Package className="w-4 h-4" />
                                                <span>{rating.productName}</span>
                                            </div>

                                            {/* Comment */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {rating.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

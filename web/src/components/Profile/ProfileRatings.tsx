import { useUserRatings } from "../../hooks/useUserRatings";
import { ThumbsUp, ThumbsDown, Package } from "lucide-react";

export default function ProfileRatings() {
    const { ratings, isLoading, error } = useUserRatings();

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                    Đánh giá của tôi
                </h3>
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                    Đánh giá của tôi
                </h3>
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-red-300">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (ratings.length === 0) {
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                    Đánh giá của tôi
                </h3>
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Chưa có đánh giá nào.</p>
                </div>
            </div>
        );
    }

    // Tính thống kê
    const positiveCount = ratings.filter((r) => r.score === 1).length;
    const negativeCount = ratings.filter((r) => r.score === -1).length;
    const positivePercentage =
        ratings.length > 0
            ? Math.round((positiveCount / ratings.length) * 100)
            : 0;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-700">
                    Đánh giá của tôi ({ratings.length})
                </h3>
                <div className="flex items-center gap-4 text-sm">
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
            </div>

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
        </div>
    );
}

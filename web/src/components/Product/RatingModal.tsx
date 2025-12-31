import { useState } from "react";
import { apiUrl } from "../../config/api";
import toast from "react-hot-toast";

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    token: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    orderId,
    token,
}) => {
    const [feedbackScore, setFeedbackScore] = useState<1 | -1>(1);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const submitFeedback = async () => {
        if (!feedbackComment.trim())
            return toast.error("Vui lòng nhập nội dung đánh giá");
        setActionLoading(true);
        try {
            const response = await fetch(
                apiUrl(`api/orders/${orderId}/feedback`),
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        score: feedbackScore,
                        comment: feedbackComment,
                    }),
                }
            );
            const resData = await response.json();
            if (response.ok) {
                toast.success("Đánh giá thành công!");
                window.location.reload();
            } else toast.error(resData.message || "Lỗi gửi đánh giá");
        } catch {
            toast.error("Lỗi kết nối");
        } finally {
            setActionLoading(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in duration-200">
                <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">
                    Đánh giá giao dịch
                </h3>
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => setFeedbackScore(1)}
                        className={`flex flex-col items-center p-4 rounded-lg border-2 transition cursor-pointer ${
                            feedbackScore === 1
                                ? "border-green-500 bg-green-50"
                                : "border-gray-100"
                        }`}
                    >
                        <span className="text-3xl">👍</span>
                        <span className="text-sm font-bold mt-2 text-green-700">
                            Hài lòng (+1)
                        </span>
                    </button>
                    <button
                        onClick={() => setFeedbackScore(-1)}
                        className={`flex flex-col items-center p-4 rounded-lg border-2 transition cursor-pointer ${
                            feedbackScore === -1
                                ? "border-red-500 bg-red-50"
                                : "border-gray-100"
                        }`}
                    >
                        <span className="text-3xl">👎</span>
                        <span className="text-sm font-bold mt-2 text-red-700">
                            Thất vọng (-1)
                        </span>
                    </button>
                </div>
                <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Nhập nhận xét của bạn về đối tác..."
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] mb-4 text-sm focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900 bg-white placeholder-gray-400"
                />
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={submitFeedback}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold cursor-pointer disabled:cursor-not-allowed"
                    >
                        {actionLoading ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;

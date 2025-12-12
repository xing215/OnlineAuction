import React, { useState, useEffect } from "react";
import { Zap, AlertCircle, CheckCircle } from "lucide-react";
import { apiUrl } from "../../config/api";
import { useUser } from "../../context/useUser";

interface UpgradeRequestButtonProps {
    userRole?: string | undefined;
    onRequestSubmitted?: () => void;
}

export const UpgradeRequestButton: React.FC<UpgradeRequestButtonProps> = ({
    userRole,
    onRequestSubmitted,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState<
        "none" | "pending" | "approved" | "rejected"
    >("none");
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { token, user } = useUser();

    useEffect(() => {
        if (userRole) {
            checkRequestStatus();
        }
    }, [userRole, token]);

    const checkRequestStatus = async () => {
        try {
            const response = await fetch(
                apiUrl("/api/upgrade-requests/my-request"),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setRequestStatus(data.data.status || "none");
                }
            }
        } catch (error) {
            console.error("Failed to check request status:", error);
        }
    };

    const handleSubmitRequest = async () => {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(apiUrl("/api/upgrade-requests"), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (response.ok) {
                setRequestStatus("pending");
                setSuccessMessage("Yêu cầu của bạn đã được gửi thành công!");
                setShowModal(false);
                onRequestSubmitted?.();
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setErrorMessage(
                    data.message || "Có lỗi xảy ra khi gửi yêu cầu"
                );
            }
        } catch (error) {
            setErrorMessage("Lỗi kết nối. Vui lòng thử lại.");
            console.error("Failed to submit request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Only show for bidders
    if (userRole !== "bidder") {
        return null;
    }

    if (requestStatus === "approved") {
        return (
            <div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-green-800">
                            Yêu cầu đã được phê duyệt
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Bạn có 7 ngày để hoàn tất quá trình nâng cấp thành
                            người bán.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (requestStatus === "pending") {
        return (
            <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-yellow-800">
                            Yêu cầu đang chờ xử lý
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                            Quản trị viên sẽ xem xét yêu cầu của bạn sớm.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (requestStatus === "rejected") {
        return (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800">
                            Yêu cầu đã bị từ chối
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            Vui lòng liên hệ với quản trị viên để biết thêm chi
                            tiết.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {successMessage && (
                <div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-6">
                    <p className="text-green-800 font-medium">
                        {successMessage}
                    </p>
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-6">
                    <p className="text-red-800 font-medium">{errorMessage}</p>
                </div>
            )}

            <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-[#d5ad41] to-[#c49a35] text-white font-semibold shadow-lg hover:shadow-xl transition-all mb-6"
            >
                <Zap className="w-5 h-5" />
                <span>Nâng cấp thành Người bán</span>
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                            Nâng cấp thành Người bán
                        </h2>

                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800 text-justify">
                                Bạn sắp nâng cấp tài khoản lên thành Người bán.
                                Sau khi được quản trị viên phê duyệt, bạn sẽ có
                                7 ngày trong vai trò Người bán.
                            </p>
                        </div>

                        <p className="text-gray-600 text-sm mb-6 text-justify">
                            Bằng cách nhấp "Gửi yêu cầu", bạn xác nhận rằng bạn
                            muốn nâng cấp tài khoản và tuân thủ các điều khoản
                            dịch vụ của chúng tôi.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitRequest}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 rounded-2xl bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <span>Gửi yêu cầu</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UpgradeRequestButton;

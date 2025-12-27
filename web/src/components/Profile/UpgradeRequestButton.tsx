import React, { useState, useEffect, useCallback } from "react";
import { Zap, AlertCircle, CheckCircle } from "lucide-react";
import { apiUrl } from "../../config/api";
import { useUser } from "../../context/useUser";
import { UpgradeRequestModal } from "./UpgradeRequestModal";

interface UpgradeRequestButtonProps {
    userRole?: string | undefined;
    onRequestSubmitted?: () => void;
}

interface RequestData {
    status: "pending" | "approved" | "rejected";
    admin_note?: string;
    createdAt: string;
}

export const UpgradeRequestButton: React.FC<UpgradeRequestButtonProps> = ({
    userRole,
    onRequestSubmitted,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [requestData, setRequestData] = useState<RequestData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { token } = useUser();

    const checkRequestStatus = useCallback(async () => {
        try {
            const response = await fetch(apiUrl("/api/upgrade/my-request"), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setRequestData(data.data);
                } else {
                    setRequestData(null);
                }
            }
        } catch (error) {
            console.error("Failed to check request status:", error);
        }
    }, [token]);

    useEffect(() => {
        if (userRole) {
            checkRequestStatus();
        }
    }, [userRole, checkRequestStatus]);

    const handleSubmitRequest = async () => {
        if (!reason.trim() || reason.trim().length < 10) {
            setErrorMessage("Lý do phải có ít nhất 10 ký tự");
            return;
        }

        if (reason.trim().length > 500) {
            setErrorMessage("Lý do không được vượt quá 500 ký tự");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(apiUrl("/api/upgrade/request"), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reason: reason.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setRequestData({ status: "pending", createdAt: new Date().toISOString() });
                setSuccessMessage("Yêu cầu của bạn đã được gửi thành công!");
                setShowModal(false);
                setReason("");
                await checkRequestStatus();
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

    if (requestData?.status === "approved") {
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
                        <p className="text-sm text-red-600 mt-1">
                            Vui lòng đăng nhập lại.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (requestData?.status === "pending") {
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

    if (requestData?.status === "rejected") {
        return (
            <>
                <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-800">
                                Yêu cầu đã bị từ chối
                            </p>
                            {requestData?.admin_note && (
                                <p className="text-sm text-red-700 mt-1">
                                    <strong>Lý do:</strong>{" "}
                                    {requestData.admin_note}
                                </p>
                            )}
                            <p className="text-xs text-red-600 mt-2">
                                Bạn có thể gửi yêu cầu mới
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-[#d5ad41] to-[#c49a35] text-white font-semibold shadow-lg hover:shadow-xl transition-all mb-6"
                >
                    <Zap className="w-5 h-5" />
                    <span>Gửi yêu cầu nâng cấp mới</span>
                </button>

                <UpgradeRequestModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setReason("");
                        setErrorMessage("");
                    }}
                    reason={reason}
                    onReasonChange={setReason}
                    onSubmit={handleSubmitRequest}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    isResubmission={true}
                />
            </>
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

            <UpgradeRequestModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setReason("");
                    setErrorMessage("");
                }}
                reason={reason}
                onReasonChange={setReason}
                onSubmit={handleSubmitRequest}
                isLoading={isLoading}
                errorMessage={errorMessage}
                isResubmission={false}
            />
        </>
    );
};

export default UpgradeRequestButton;

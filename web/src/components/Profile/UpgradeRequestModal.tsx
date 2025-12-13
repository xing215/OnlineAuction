import React from "react";

interface UpgradeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: string;
    onReasonChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    errorMessage: string;
    isResubmission?: boolean;
}

export const UpgradeRequestModal: React.FC<UpgradeRequestModalProps> = ({
    isOpen,
    onClose,
    reason,
    onReasonChange,
    onSubmit,
    isLoading,
    errorMessage,
    isResubmission = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                    {isResubmission
                        ? "Gửi yêu cầu nâng cấp mới"
                        : "Nâng cấp thành Người bán"}
                </h2>

                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 text-justify">
                        {isResubmission
                            ? "Bạn sắp gửi yêu cầu nâng cấp mới. Sau khi được quản trị viên phê duyệt, bạn sẽ có thể đăng bán sản phẩm trên nền tảng."
                            : "Bạn sắp nâng cấp tài khoản lên thành Người bán. Sau khi được quản trị viên phê duyệt, bạn sẽ có thể đăng bán sản phẩm trên nền tảng."}
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lý do muốn trở thành Người bán{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => onReasonChange(e.target.value)}
                        placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn nâng cấp tài khoản (10-500 ký tự)..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-yellow-500 focus:outline-none resize-none text-sm text-gray-700"
                        rows={4}
                        minLength={10}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {reason.length}/500 ký tự (tối thiểu 10 ký tự)
                    </p>
                </div>

                <p className="text-gray-600 text-sm mb-6 text-justify">
                    Bằng cách nhấp "Gửi yêu cầu", bạn xác nhận rằng bạn muốn
                    nâng cấp tài khoản và tuân thủ các điều khoản dịch vụ của
                    chúng tôi.
                </p>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800">{errorMessage}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isLoading || reason.trim().length < 10}
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
    );
};

export default UpgradeRequestModal;

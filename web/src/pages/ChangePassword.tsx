import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useChangePasswordForm } from "../hooks/useChangePasswordForm";

export default function ChangePasswordPage() {
    const {
        formData,
        errors,
        successMessage,
        isSubmitting,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        setShowCurrentPassword,
        setShowNewPassword,
        setShowConfirmPassword,
        handleInputChange,
        handleSubmit,
    } = useChangePasswordForm();

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#D5AD41] to-[#F4D483] px-8 py-6">
                        <h2 className="text-xl font-bold text-white">Đổi mật khẩu</h2>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-600">{errors.general}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-600">{successMessage}</p>
                            </div>
                        )}

                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Mật khẩu hiện tại
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.currentPassword
                                            ? "border-red-300 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-[#D5AD41]"
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-sm text-red-500">{errors.currentPassword}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.newPassword
                                            ? "border-red-300 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-[#D5AD41]"
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-sm text-red-500">{errors.newPassword}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Mật khẩu phải có ít nhất 6 ký tự
                            </p>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.confirmPassword
                                            ? "border-red-300 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-[#D5AD41]"
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-[#3E3C31] transition-all shadow-md hover:shadow-lg ${
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:from-amber-500 hover:to-amber-600"
                                }`}
                            >
                                {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </button>
                        </div>

                        {/* Security Tips */}
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Lưu ý bảo mật
                            </h3>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Sử dụng mật khẩu mạnh với ít nhất 6 ký tự</li>
                                <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                <li>• Không sử dụng lại mật khẩu cũ</li>
                                <li>• Không chia sẻ mật khẩu với người khác</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

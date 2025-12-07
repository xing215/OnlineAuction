import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";
import AuthLayout from "../components/AuthLayout";
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const {
        step,
        loading,
        errors,
        formData,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        handleInputChange,
        requestOTP,
        resetPassword,
        goBackToEmail,
    } = useForgotPasswordForm();

    return (
        <AuthLayout activeTab="login">
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {step === "email" ? "Quên mật khẩu?" : "Xác thực OTP"}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {step === "email"
                            ? "Nhập email để nhận mã OTP khôi phục mật khẩu"
                            : "Nhập mã OTP và mật khẩu mới"}
                    </p>
                </div>

                {/* General Error */}
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {errors.general}
                    </div>
                )}

                {/* Email Input */}
                {step === "email" && (
                    <form onSubmit={requestOTP} noValidate className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                    disabled={loading}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.email
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </button>

                        <div className="text-center">
                            <Link
                                to="/signin"
                                className="text-sm font-medium text-[#D5AD41] hover:underline inline-flex items-center gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </form>
                )}

                {/* OTP & New Password */}
                {step === "verify" && (
                    <form onSubmit={resetPassword} noValidate className="space-y-6">
                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                                Mã OTP
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                    placeholder="Nhập 6 chữ số"
                                    maxLength={6}
                                    disabled={loading}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.otp
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            </div>
                            {errors.otp && (
                                <p className="text-sm text-red-500">{errors.otp}</p>
                            )}
                        </div>

                        {/* New Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className={`w-full pl-10 pr-10 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.newPassword
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-sm text-red-500">{errors.newPassword}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className={`w-full pl-10 pr-10 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.confirmPassword
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </button>

                        <div className="flex items-center justify-between text-sm">
                            <button
                                type="button"
                                onClick={goBackToEmail}
                                disabled={loading}
                                className="text-sm font-medium text-[#D5AD41] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}

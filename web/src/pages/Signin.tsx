import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLoginForm } from "../hooks/useSigninForm";
import AuthLayout from "../components/AuthLayout";
import SocialButtons from "../components/SocialButtons";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from 'react-router-dom';

export default function SignInPage() {
    const {
        formData,
        errors,
        showPassword,
        setShowPassword,
        isLoading,
        requiresVerification,
        verificationEmail,
        handleInputChange,
        handleSubmit,
        handleBackToLogin,
        recaptchaRef,
        recaptchaSiteKey,
    } = useLoginForm();

    return (
        <AuthLayout activeTab="login">
            <form onSubmit={handleSubmit} noValidate className={`p-8 space-y-6 ${isLoading ? 'cursor-wait' : ''}`}>
                {requiresVerification ? (
                    <>
                        {/* Back to Login Button */}
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="flex items-center text-sm font-medium text-[#D5AD41] hover:underline mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại đăng nhập
                        </button>

                        {/* Verification Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Xác thực email
                            </h2>
                            <p className="text-sm text-gray-600">
                                Mã OTP đã được gửi đến email <strong>{verificationEmail}</strong>
                            </p>
                        </div>

                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                                Mã OTP
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                    placeholder="123456"
                                    disabled={isLoading}
                                    maxLength={6}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-center tracking-widest ${
                                        errors.otp
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                                />
                            </div>
                            {errors.otp && (
                                <p className="text-sm text-red-500">{errors.otp}</p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Email Input */}
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
                                    disabled={isLoading}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        errors.email
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className={`w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-[#D5AD41] hover:underline"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </>
                )}

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                    {recaptchaSiteKey ? (
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={recaptchaSiteKey}
                            size="invisible"
                        />
                    ) : (
                        <div className="text-sm text-red-500 text-center">
                            reCAPTCHA chưa được cấu hình. Vui lòng liên hệ quản trị viên.
                        </div>
                    )}
                </div>
                {errors.recaptcha && (
                    <p className="text-sm text-red-500 text-center">{errors.recaptcha}</p>
                )}

                {/* Login/Verify Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isLoading 
                        ? (requiresVerification ? 'Đang xác thực...' : 'Đang đăng nhập...') 
                        : (requiresVerification ? 'Xác thực & Đăng nhập' : 'Đăng nhập')
                    }
                </button>

                {!requiresVerification && <SocialButtons />}
            </form>
        </AuthLayout>
    );
}

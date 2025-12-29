import { Eye, EyeOff, Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { useRegisterForm } from "../hooks/useSignupForm";
import AuthLayout from "../components/AuthLayout";
import SocialButtons from "../components/SocialButtons";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUpPage() {
    const {
        step,
        registerData,
        regErrors,
        showRegPassword,
        setShowRegPassword,
        showRegConfirm,
        setShowRegConfirm,
        isLoading,
        handleRegisterInputChange,
        requestOTP,
        handleRegisterSubmit,
        goBackToForm,
        recaptchaRef,
        recaptchaSiteKey,
    } = useRegisterForm();

    return (
        <AuthLayout activeTab="register">
            {/* Step 1: Registration Form */}
            {step === "form" && (
                <form
                    onSubmit={requestOTP}
                    noValidate
                    className={`p-8 space-y-6 ${isLoading ? 'cursor-wait' : ''}`}
                >
                    {/* General Error */}
                    {regErrors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {regErrors.general}
                        </div>
                    )}

                    {/* Full Name Input */}
                    <div className="space-y-2 text-left">
                        <label className="block text-sm font-medium text-gray-800">
                            Họ tên
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="full_name"
                                value={registerData.full_name}
                                onChange={handleRegisterInputChange}
                                placeholder="Nhập họ tên đầy đủ"
                                disabled={isLoading}
                                className={`w-full pl-4 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    regErrors.full_name
                                        ? "border-red-400 focus:ring-red-400"
                                        : "border-gray-200 focus:ring-amber-400"
                                } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                            />
                        </div>
                        {regErrors.full_name && (
                            <p className="text-sm text-red-500">
                                {regErrors.full_name}
                            </p>
                        )}
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2 text-left">
                        <label className="block text-sm font-medium text-gray-800">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={registerData.email}
                                onChange={handleRegisterInputChange}
                                placeholder="email@example.com"
                                disabled={isLoading}
                                className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    regErrors.email
                                        ? "border-red-400 focus:ring-red-400"
                                        : "border-gray-200 focus:ring-amber-400"
                                } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                            />
                        </div>
                        {regErrors.email && (
                            <p className="text-sm text-red-500">
                                {regErrors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2 text-left">
                        <label className="block text-sm font-medium text-gray-800">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showRegPassword ? "text" : "password"}
                                name="password"
                                value={registerData.password}
                                onChange={handleRegisterInputChange}
                                placeholder="Ít nhất 8 ký tự"
                                disabled={isLoading}
                                className={`w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showRegPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {regErrors.password && (
                            <p className="text-sm text-red-500">
                                {regErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2 text-left">
                        <label className="block text-sm font-medium text-gray-800">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showRegConfirm ? "text" : "password"}
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={handleRegisterInputChange}
                                placeholder="Nhập lại mật khẩu"
                                disabled={isLoading}
                                className={`w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowRegConfirm(!showRegConfirm)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showRegConfirm ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {regErrors.confirmPassword && (
                            <p className="text-sm text-red-500">
                                {regErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={registerData.agreeToTerms}
                                    onChange={handleRegisterInputChange}
                                    disabled={isLoading}
                                    className={`w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 ${isLoading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                                />
                                <span className="text-sm text-gray-600">
                                    Tôi đồng ý với{" "}
                                    <a
                                        href="#!"
                                        className="text-[#D5AD41] hover:underline"
                                    >
                                        Điều khoản dịch vụ
                                    </a>{" "}
                                    và{" "}
                                    <a
                                        href="#!"
                                        className="text-[#D5AD41] hover:underline"
                                    >
                                        Chính sách bảo mật
                                    </a>
                                </span>
                            </label>
                        </div>
                        {regErrors.agreeToTerms && (
                            <p className="text-sm text-red-500">
                                {regErrors.agreeToTerms}
                            </p>
                        )}
                    </div>

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
                    {regErrors.recaptcha && (
                        <p className="text-sm text-red-500 text-center">{regErrors.recaptcha}</p>
                    )}

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>

                    <SocialButtons />
                </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
                <div className="p-8 space-y-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Xác thực OTP
                        </h2>
                        <p className="text-sm text-gray-600">
                            Mã OTP đã được gửi đến email: <strong>{registerData.email}</strong>
                        </p>
                    </div>

                    {/* General Error */}
                    {regErrors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {regErrors.general}
                        </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} noValidate className="space-y-6">
                        {/* OTP Input */}
                        <div className="space-y-2 text-left">
                            <label className="block text-sm font-medium text-gray-800">
                                Mã OTP
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="otp"
                                    value={registerData.otp}
                                    onChange={handleRegisterInputChange}
                                    placeholder="Nhập 6 chữ số"
                                    maxLength={6}
                                    disabled={isLoading}
                                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        regErrors.otp
                                            ? "border-red-400 focus:ring-red-400"
                                            : "border-gray-200 focus:ring-amber-400"
                                    } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                                />
                            </div>
                            {regErrors.otp && (
                                <p className="text-sm text-red-500">{regErrors.otp}</p>
                            )}
                        </div>

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
                        {regErrors.recaptcha && (
                            <p className="text-sm text-red-500 text-center">{regErrors.recaptcha}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Đang xác thực...' : 'Xác thực và đăng ký'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={goBackToForm}
                                disabled={isLoading}
                                className="text-sm font-medium text-[#D5AD41] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AuthLayout>
    );
}

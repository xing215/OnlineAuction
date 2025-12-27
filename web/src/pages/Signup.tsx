import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRegisterForm } from "../hooks/useSignupForm";
import AuthLayout from "../components/AuthLayout";
import SocialButtons from "../components/SocialButtons";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUpPage() {
    const {
        registerData,
        regErrors,
        showRegPassword,
        setShowRegPassword,
        showRegConfirm,
        setShowRegConfirm,
        handleRegisterInputChange,
        handleRegisterSubmit,
        recaptchaRef,
        recaptchaSiteKey,
    } = useRegisterForm();

    return (
        <AuthLayout activeTab="register">
            <form
                onSubmit={handleRegisterSubmit}
                noValidate
                className="p-8 space-y-6"
            >
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
                            className={`w-full pl-4 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                regErrors.full_name
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-gray-200 focus:ring-amber-400"
                            }`}
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
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                regErrors.email
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-gray-200 focus:ring-amber-400"
                            }`}
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
                            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
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
                    className="w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg"
                >
                    Đăng ký
                </button>

                <SocialButtons />
            </form>
        </AuthLayout>
    );
}

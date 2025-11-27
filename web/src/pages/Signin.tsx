import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "../hooks/useSigninForm";
import AuthLayout from "../components/AuthLayout";
import SocialButtons from "../components/SocialButtons";

export default function SignInPage() {
    const {
        formData,
        errors,
        showPassword,
        setShowPassword,
        handleInputChange,
        handleSubmit,
    } = useLoginForm();

    return (
        <AuthLayout activeTab="login">
            <form onSubmit={handleSubmit} noValidate className="p-8 space-y-6">
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
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.email
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-gray-200 focus:ring-amber-400"
                            }`}
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
                            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                </div>

                {/* Remember & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">
                            Ghi nhớ đăng nhập
                        </span>
                    </label>
                    <a
                        href="#!"
                        className="text-sm font-medium text-[#D5AD41] hover:underline"
                    >
                        Quên mật khẩu?
                    </a>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-br from-[#D5AD41] to-[#F4D483] py-3 font-semibold text-white transition-all shadow-md hover:from-amber-500 hover:to-amber-600 hover:shadow-lg"
                >
                    Đăng nhập
                </button>

                <SocialButtons />
            </form>
        </AuthLayout>
    );
}

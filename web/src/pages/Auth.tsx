import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Authentication() {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);

    const [errors, setErrors] = useState<{ email?: string }>({});
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const [regErrors, setRegErrors] = useState<{
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        agreeToTerms?: string;
    }>({});

    const [registerData, setRegisterData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear error when user starts typing
        if (name === "email" && errors.email) {
            setErrors((prev) => ({ ...prev, email: undefined }));
        }
    };

    const handleRegisterInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type, checked } = e.target;
        setRegisterData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear specific errors while typing
        if (name === "email" && regErrors.email) {
            setRegErrors((prev) => ({ ...prev, email: undefined }));
        }
        if (name === "fullName" && regErrors.fullName) {
            setRegErrors((prev) => ({ ...prev, fullName: undefined }));
        }
        if (
            (name === "password" || name === "confirmPassword") &&
            (regErrors.password || regErrors.confirmPassword)
        ) {
            setRegErrors((prev) => ({
                ...prev,
                password: undefined,
                confirmPassword: undefined,
            }));
        }
        if (name === "agreeToTerms" && regErrors.agreeToTerms) {
            setRegErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Vui lòng nhập email hợp lệ!" });
            return;
        }

        // Clear errors if validation passes
        setErrors({});
        console.log("Form submitted:", formData);
        // Add your login logic here
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: typeof regErrors = {};

        if (!registerData.fullName.trim()) {
            newErrors.fullName = "Vui lòng nhập họ và tên";
        }

        if (!emailRegex.test(registerData.email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ!";
        }

        if (registerData.password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        }

        if (registerData.confirmPassword !== registerData.password) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
        }

        if (!registerData.agreeToTerms) {
            newErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản";
        }

        setRegErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log("Register submitted:", registerData);
            // Add registration logic here
        }
    };

    return (
        <div className="min-h-screen  bg-linear-[135deg,white_0%,white_40%,#D5AD41_150%] bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-[448px]">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-linear-135 from-[#D5AD41] to-[#F4D483] bg-clip-text text-transparent mb-2">
                        BiddenBid
                    </h1>
                    <p className="text-gray-500 text-base">
                        Nền tảng đấu giá trực tuyến
                    </p>
                </div>

                {/* Card Container */}
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 gap-1">
                        <button
                            onClick={() => setIsLoginTab(true)}
                            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                                isLoginTab
                                    ? "bg-white text-gray-700 shadow-sm"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => setIsLoginTab(false)}
                            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                                !isLoginTab
                                    ? "bg-white text-gray-700 shadow-sm"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* Form Content */}
                    {isLoginTab && (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="p-8 space-y-6"
                        >
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
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
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
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
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
                                <button
                                    type="button"
                                    className="text-sm font-medium text-amber-500 hover:text-amber-600"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="w-full bg-linear-135 from-[#D5AD41] to-[#F4D483] text-white font-semibold py-3 rounded-full hover:from-amber-500 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                            >
                                Đăng nhập
                            </button>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-white text-sm text-gray-500">
                                        Hoặc đăng nhập với
                                    </span>
                                </div>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <svg
                                        viewBox="-3 0 262 262"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="xMidYMid"
                                        fill="#000000"
                                        className="w-5 h-5"
                                    >
                                        <g
                                            id="SVGRepo_bgCarrier"
                                            stroke-width="0"
                                        ></g>
                                        <g
                                            id="SVGRepo_tracerCarrier"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        ></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path
                                                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                                                fill="#4285F4"
                                            ></path>
                                            <path
                                                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                                fill="#34A853"
                                            ></path>
                                            <path
                                                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                                                fill="#FBBC05"
                                            ></path>
                                            <path
                                                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                                fill="#EB4335"
                                            ></path>
                                        </g>
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Google
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Facebook
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Registration Tab Content (Placeholder) */}
                    {!isLoginTab && (
                        <form
                            onSubmit={handleRegisterSubmit}
                            noValidate
                            className="p-8 space-y-6"
                        >
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

                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-gray-800">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={
                                            showRegPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterInputChange}
                                        placeholder="Ít nhất 8 ký tự"
                                        className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowRegPassword(!showRegPassword)
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-gray-800">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={
                                            showRegConfirm ? "text" : "password"
                                        }
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterInputChange}
                                        placeholder="Nhập lại mật khẩu"
                                        className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowRegConfirm(!showRegConfirm)
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                            {" "}
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

                            <button
                                type="submit"
                                className="w-full bg-linear-135 from-[#D5AD41] to-[#F4D483] text-white font-semibold py-3 rounded-full hover:from-amber-500 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                            >
                                Đăng ký
                            </button>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-white text-sm text-gray-500">
                                        Hoặc đăng ký với
                                    </span>
                                </div>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <svg
                                        viewBox="-3 0 262 262"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="xMidYMid"
                                        fill="#000000"
                                        className="w-5 h-5"
                                    >
                                        <g
                                            id="SVGRepo_bgCarrier"
                                            stroke-width="0"
                                        ></g>
                                        <g
                                            id="SVGRepo_tracerCarrier"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        ></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path
                                                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                                                fill="#4285F4"
                                            ></path>
                                            <path
                                                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                                fill="#34A853"
                                            ></path>
                                            <path
                                                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                                                fill="#FBBC05"
                                            ></path>
                                            <path
                                                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                                fill="#EB4335"
                                            ></path>
                                        </g>
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Google
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Facebook
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

import { Link } from "react-router-dom";

interface AuthLayoutProps {
    children: React.ReactNode;
    activeTab: "login" | "register";
}

export default function AuthLayout({ children, activeTab }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-white to-[#D5AD41]/40 p-4">
            <div className="w-full max-w-[450px]">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 bg-gradient-to-br from-[#D5AD41] to-[#F4D483] bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                        BiddenBid
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Nền tảng đấu giá trực tuyến
                    </p>
                </div>

                {/* Card Container */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {/* Tabs Navigation */}
                    <div className="flex gap-1 bg-gray-100 p-1">
                        <Link to="/signin" className="flex-1">
                            <div
                                className={`w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                                    activeTab === "login"
                                        ? "bg-white text-gray-700 shadow-sm"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Đăng nhập
                            </div>
                        </Link>
                        <Link to="/signup" className="flex-1">
                            <div
                                className={`w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                                    activeTab === "register"
                                        ? "bg-white text-gray-700 shadow-sm"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Đăng ký
                            </div>
                        </Link>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}

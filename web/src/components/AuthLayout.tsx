import { Link } from "react-router-dom";

interface AuthLayoutProps {
    children: React.ReactNode;
    activeTab: "login" | "register";
}

export default function AuthLayout({ children, activeTab }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-linear-[135deg,white_0%,white_40%,#D5AD41_150%] bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-[448px]">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-135 from-[#D5AD41] to-[#F4D483] bg-clip-text text-transparent mb-2">
                        BiddenBid
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Nền tảng đấu giá trực tuyến
                    </p>
                </div>

                {/* Card Container */}
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg">
                    {/* Tabs Navigation */}
                    <div className="flex bg-gray-100 p-1 gap-1">
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

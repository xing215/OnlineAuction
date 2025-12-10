import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useUser } from "../../context/useUser";

interface SidebarLink {
    label: string;
    path: string;
    icon: string;
    isActive: boolean;
    isComingSoon?: boolean;
}

export const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useUser();
    const currentPath = window.location.pathname;

    const navLinks: SidebarLink[] = [
        {
            label: "Quản lý Người dùng",
            path: "/admin/manage-user",
            icon: "",
            isActive: currentPath === "/admin/manage-user",
        },
        {
            label: "Quản lý Danh mục",
            path: "/admin/manage-category",
            icon: "",
            isActive: currentPath === "/admin/manage-category",
            isComingSoon: true,
        },
        {
            label: "Quản lý Sản phẩm",
            path: "/admin/manage-product",
            icon: "",
            isActive: currentPath === "/admin/manage-product",
            isComingSoon: true,
        },
        {
            label: "Yêu cầu nâng cấp",
            path: "/admin/upgrade-requests",
            icon: "",
            isActive: currentPath === "/admin/upgrade-requests",
            isComingSoon: true,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate("/signin");
    };

    return (
        <div className="bg-white border-r border-gray-200 w-[250px] h-screen flex flex-col sticky top-0">
            {/* Header */}
            <div className="border-b border-gray-200 h-[72px] px-6 py-6 flex items-center gap-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-[15.7px] font-normal text-[#3e3c31]">
                        Golden
                    </span>
                    <span className="text-[15.7px] font-normal text-[#d5ad41]">
                        bid
                    </span>
                </div>
                <div className="bg-[#d5ad41] px-3 py-1 rounded-[13.75px] ml-auto">
                    <span className="text-[11.8px] font-normal text-white">
                        ADMIN
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                    {navLinks.map((link) => (
                        <div key={link.path}>
                            {link.isComingSoon ? (
                                // Commented out for future implementation
                                <div
                                    className="flex items-center gap-3 px-4 py-3 rounded-[15.7px] text-[13.75px] text-[#4a5565] opacity-50 cursor-not-allowed"
                                    title="Coming soon"
                                >
                                    <span className="text-[19.65px]">
                                        {link.icon}
                                    </span>
                                    <span>{link.label}</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate(link.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[15.7px] text-[13.75px] font-normal transition-all ${
                                        link.isActive
                                            ? "bg-linear-to-r from-[#d5ad41] to-[#c49a35] text-white shadow-[0px_9.825px_14.737px_-2.947px_rgba(0,0,0,0.1),0px_3.93px_5.895px_-3.93px_rgba(0,0,0,0.1)]"
                                            : "text-[#4a5565] hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="text-[19.65px]">
                                        {link.icon}
                                    </span>
                                    <span>{link.label}</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-200 bg-white text-[#3e3c31] font-medium text-[13.75px] hover:bg-gray-50 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;

import type { PropsWithChildren } from "react";
import {
    People,
    Folder,
    Inventory,
    ArrowUpward,
} from "@mui/icons-material";
import GavelIcon from "@mui/icons-material/Gavel";
import { Outlet } from "react-router-dom";
import { useUser } from "../../context/useUser";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export const AdminLayout = ({ children }: PropsWithChildren) => {
    const { logout } = useUser();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setIsSidebarAnimating(true);
            setIsSidebarCollapsed(!isSidebarCollapsed);
            setTimeout(() => setIsSidebarAnimating(false), 300);
        }
    };

    const navLinks = [
        { label: "Quản lý Người dùng", path: "/admin/manage-user", icon: People },
        { label: "Quản lý Danh mục", path: "/admin/manage-category", icon: Folder },
        { label: "Quản lý Sản phẩm", path: "/admin/manage-product", icon: Inventory },
        { label: "Yêu cầu nâng cấp", path: "/admin/upgrade-requests", icon: ArrowUpward },
    ];

    const currentPath = window.location.pathname;

    const handleNavClick = (path: string) => {
        navigate(path);
        if (isMobile) setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/signin");
    };

    const renderNavButton = (link: typeof navLinks[0]) => {
        const isActive = currentPath === link.path;
        const baseClass =
            "flex w-full items-center gap-3 rounded-2xl py-3 text-sm font-medium transition-all";
        const activeClass =
            "bg-gradient-to-b from-[#d5ad41] to-[#f4d799] text-gray-900 shadow-[0_10px_15px_-3px_rgba(213,173,65,0.3)]";
        const inactiveClass = "text-gray-700 hover:bg-gray-100";

        const layoutSpacingClass = isSidebarCollapsed
            ? "justify-center px-0"
            : "justify-between px-4";

        return (
            <button
                key={link.path}
                type="button"
                onClick={() => handleNavClick(link.path)}
                aria-label={isSidebarCollapsed ? link.label : undefined}
                className={`${baseClass} ${layoutSpacingClass} ${
                    isActive ? activeClass : inactiveClass
                } cursor-pointer`}
            >
                <span
                    className={
                        isSidebarCollapsed
                            ? "flex items-center justify-center"
                            : "flex items-center gap-3"
                    }
                >
                    <link.icon
                        className={
                            isActive
                                ? "h-5 w-5 text-gray-900"
                                : "h-5 w-5 text-gray-700"
                        }
                    />
                    {!isSidebarCollapsed && (
                        <span
                            className={
                                isActive ? "text-gray-900" : "text-gray-700"
                            }
                        >
                            {link.label}
                        </span>
                    )}
                </span>
            </button>
        );
    };

    const desktopWidthClasses = isSidebarCollapsed
        ? "w-[80px] px-2"
        : "w-[256px] min-w-[256px] px-3";
    const sidebarClasses = isMobile
        ? `fixed top-0 left-0 z-40 flex h-screen w-[256px] flex-col bg-white px-6 py-6 transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`
        : `sticky top-0 flex h-screen flex-col overflow-hidden bg-white py-6 transition-all duration-300 ease-in-out ${desktopWidthClasses}`;
    const navScrollClass =
        isSidebarCollapsed || isSidebarAnimating
            ? "overflow-hidden"
            : "overflow-y-auto";

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            {isMobile && (
                <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-white px-4 py-3 md:hidden border-b border-gray-200">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        aria-label={
                            isMobileMenuOpen ? "Đóng menu" : "Mở menu"
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#d5ad41] to-[#f4d799] text-gray-900 shadow-[0_10px_15px_-3px_rgba(213,173,65,0.3)] cursor-pointer"
                    >
                        <GavelIcon className="h-5 w-5" />
                    </button>
                    <p className="text-lg font-semibold text-transparent bg-gradient-to-b from-[#d5ad41] to-[#f4d799] bg-clip-text pr-2">
                        Golden Bid Admin
                    </p>
                </header>
            )}

            {isMobile && isMobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Đóng menu"
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden cursor-pointer"
                />
            )}

            <div className="md:flex">
                <aside className={sidebarClasses}>
                    <div className={`flex-1 space-y-6 pr-2 ${navScrollClass}`}>
                        <div
                            className={
                                isSidebarCollapsed
                                    ? "flex items-center justify-center"
                                    : "flex items-center gap-3"
                            }
                        >
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                aria-label={
                                    isSidebarCollapsed
                                        ? "Mở menu"
                                        : "Thu gọn menu"
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#d5ad41] to-[#f4d799] shadow-[0_10px_15px_-3px_rgba(213,173,65,0.3)] cursor-pointer"
                            >
                                <GavelIcon className="h-5 w-5 text-gray-900" />
                            </button>
                            {!isSidebarCollapsed && (
                                <div>
                                    <p className="text-2xl font-bold text-transparent bg-gradient-to-b from-[#d5ad41] to-[#f4d799] bg-clip-text">
                                        Golden Bid
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Admin Panel
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isSidebarCollapsed && (
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="flex w-full items-center justify-center rounded-2xl py-3 px-4 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-all cursor-pointer"
                            >
                                <span>Về trang chủ</span>
                            </button>
                        )}

                        <div className="space-y-2">
                            {navLinks.map((link) => renderNavButton(link))}
                        </div>
                    </div>

                    {!isSidebarCollapsed && (
                        <div className="space-y-4 pt-6">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d5ad41] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer"
                            >
                                <LogOut className="h-5 w-5 text-white" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </aside>

                <main
                    className={`layout-main flex-1 bg-transparent md:pt-0 ${
                        isMobile ? "pt-16" : ""
                    }`}
                >
                    {children ?? <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

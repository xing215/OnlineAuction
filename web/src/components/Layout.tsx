import type { PropsWithChildren } from "react";
import {
    ExpandMoreRounded,
    PersonOutlineRounded,
    ChevronRightRounded,
} from "@mui/icons-material";
import GavelIcon from "@mui/icons-material/Gavel";
import { Outlet } from "react-router-dom";
import { useLayout } from "../hooks/useLayout";
import { WEB_PAGE, type WebPageKey } from "../constants/webPages";
import { useUser } from "../context/useUser";
import { useCategories } from "../hooks/useCategories";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const sectionTitleStyles = "text-xs uppercase tracking-[0.2em] text-white/60";

export const Layout = ({ children }: PropsWithChildren) => {
    const {
        activePage,
        primaryNav,
        secondaryNav,
        isAccountOpen,
        isSidebarCollapsed,
        isSidebarAnimating,
        isMobile,
        handleNavigate,
        toggleAccount,
        toggleSidebar,
    } = useLayout();

    const { user, token, refreshUser } = useUser();
    const { categoriesTree } = useCategories();
    const navigate = useNavigate();
    const [isCategoriesHover, setIsCategoriesHover] = useState(false);
    const [categoryClicked, setCategoryClicked] = useState(false);
    const hoverTimeoutRef = useRef<number | null>(null);
    const categoryPanelRef = useRef<HTMLDivElement | null>(null);
    const accountName = user?.full_name || user?.fullName || user?.name || "";
    const isLoggedIn = !!user;

    // Close category panel when clicking outside
    useEffect(() => {
        if (!categoryClicked) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                categoryPanelRef.current &&
                !categoryPanelRef.current.contains(event.target as Node)
            ) {
                setCategoryClicked(false);
            }
        };
        setIsCategoriesHover(false);    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [categoryClicked]);

    useEffect(() => {
        if (!user && token) {
            refreshUser();
        }
    }, [user, token, refreshUser]);

    const renderPrimaryButton = (key: WebPageKey, label: string) => {
        const isActive = activePage === key;
        const isCategoryButton = key === "CATEGORIES";
        const IconComponent = WEB_PAGE[key].Icon;

        const baseClass =
            "flex w-full items-center gap-3 rounded-2xl py-3 text-sm font-medium transition-all";
        const activeClass =
            "bg-gradient-to-b from-[#d5ad41] to-[#f4d799] text-[#3E3C31] shadow-[0_10px_15px_-3px_rgba(213,173,65,0.3)]";
        const inactiveClass = "text-white hover:bg-white/10";

        const layoutSpacingClass = isSidebarCollapsed
            ? "justify-center px-0"
            : "justify-between px-4";

        const handleClick = () => {
            if (isCategoryButton) {
                setCategoryClicked(!categoryClicked);
                return;
            }
            handleNavigate(key);
        };

        const handleMouseEnter = () => {
            if (isCategoryButton && !isMobile && !categoryClicked) {
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                }
                setIsCategoriesHover(true);
            }
        };

        const handleMouseLeave = () => {
            if (isCategoryButton && !isMobile && !categoryClicked) {
                hoverTimeoutRef.current = setTimeout(() => {
                    setIsCategoriesHover(false);
                }, 100);
            }
        };

        const buttonElement = (
            <button
                key={key}
                type="button"
                onClick={handleClick}
                aria-label={isSidebarCollapsed ? label : undefined}
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
                    <IconComponent
                        className={
                            isActive
                                ? "h-5 w-5 text-[#3E3C31]"
                                : "h-5 w-5 text-white"
                        }
                        data-testid={`${key.toLowerCase()}-icon`}
                    />
                    {!isSidebarCollapsed && (
                        <span
                            className={
                                isActive ? "text-[#3E3C31]" : "text-white"
                            }
                        >
                            {label}
                        </span>
                    )}
                </span>
                {isCategoryButton && !isSidebarCollapsed && (
                    <ChevronRightRounded
                        className="h-5 w-5"
                        style={{
                            color: isActive
                                ? "#3E3C31"
                                : "rgba(255,255,255,0.7)",
                        }}
                    />
                )}
            </button>
        );

        if (isCategoryButton && !isMobile) {
            return (
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="relative"
                >
                    {buttonElement}
                </div>
            );
        }

        return buttonElement;
    };

    const desktopWidthClasses = isSidebarCollapsed
        ? "w-[80px] px-2"
        : "w-[256px] min-w-[256px] px-3";
    const sidebarClasses = isMobile
        ? `fixed top-0 left-0 z-40 flex h-screen w-[256px] flex-col bg-[#3E3C31] px-6 py-6 transition-transform duration-300 ease-in-out ${
              isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`
        : `sticky top-0 flex h-screen flex-col overflow-hidden bg-[#3E3C31] py-6 transition-all duration-300 ease-in-out ${desktopWidthClasses}`;
    const navScrollClass =
        isSidebarCollapsed || isSidebarAnimating
            ? "overflow-hidden"
            : "overflow-y-auto";

    return (
        <div className="min-h-screen bg-[#26241A] text-white">
            {isMobile && (
                <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-[#3E3C31] px-4 py-3 md:hidden">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        aria-label={
                            isSidebarCollapsed ? "Mở menu" : "Đóng menu"
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#d5ad41] to-[#f4d799] text-[#3E3C31] shadow-[0_10px_15px_-3px_rgba(213,173,65,0.3)] cursor-pointer"
                    >
                        <GavelIcon className="h-5 w-5" />
                    </button>
                    <p className="text-lg font-semibold text-transparent bg-gradient-to-b from-[#d5ad41] to-[#f4d799] bg-clip-text pr-2">
                        Golden Bid
                    </p>
                </header>
            )}

            {isMobile && !isSidebarCollapsed && (
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
                                <GavelIcon className="h-5 w-5 text-[#3E3C31]" />
                            </button>
                            {!isSidebarCollapsed && (
                                <div>
                                    <p className="text-2xl font-bold text-transparent bg-gradient-to-b from-[#d5ad41] to-[#f4d799] bg-clip-text">
                                        Golden Bid
                                    </p>
                                    <p className="text-sm text-[#99A1AF]">
                                        Đấu giá trực tuyến
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isSidebarCollapsed && (
                            <button
                                type="button"
                                onClick={() => navigate("/admin/manage-user")}
                                className="flex w-full items-center justify-center rounded-2xl py-3 px-4 text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                            >
                                <span>Quản lý hệ thống</span>
                            </button>
                        )}

                        <div className="space-y-2">
                            {primaryNav.map((item) =>
                                renderPrimaryButton(item.key, item.label)
                            )}
                        </div>
                    </div>

                    {!isSidebarCollapsed && (
                        <div className="space-y-4 pt-6">
                            <div className="space-y-2 border-l border-[#d5ad41]/60 pl-4">
                                <p className={sectionTitleStyles}>Tài khoản</p>
                                {isAccountOpen &&
                                    isLoggedIn &&
                                    secondaryNav.map((item) => {
                                        const SecondaryIcon =
                                            WEB_PAGE[item.key].Icon;
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() =>
                                                    handleNavigate(item.key)
                                                }
                                                className="flex items-center gap-2 text-sm text-[#B3B3B3] transition-colors hover:text-white cursor-pointer"
                                            >
                                                <SecondaryIcon className="h-5 w-5 text-[#B3B3B3]" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                            </div>

                            <button
                                type="button"
                                onClick={
                                    isLoggedIn
                                        ? toggleAccount
                                        : () => navigate("/signin")
                                }
                                className={`w-full flex items-center ${
                                    isLoggedIn
                                        ? "justify-between"
                                        : "justify-center"
                                } rounded-2xl bg-[#d5ad41] px-4 py-3 text-sm font-semibold text-[#3E3C31] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer`}
                            >
                                <span className="flex items-center gap-2">
                                    <PersonOutlineRounded className="h-5 w-5 text-[#3E3C31]" />
                                    {isLoggedIn
                                        ? accountName || (user?.role === 'admin' ? 'Admin' : 'Tài khoản')
                                        : "Đăng nhập"}
                                </span>
                                {isLoggedIn && (
                                    <ExpandMoreRounded
                                        className={`h-4 w-4 text-[#3E3C31] transition-transform ${
                                            isAccountOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                )}
                            </button>
                        </div>
                    )}
                </aside>

                {/* Categories Hover Panel */}
                {(isCategoriesHover || categoryClicked) &&
                    !isSidebarCollapsed && (
                        <div
                            ref={categoryPanelRef}
                            className="fixed top-0 left-[256px] z-50 bg-white shadow-lg rounded-r-lg p-4 min-w-[200px] h-screen overflow-y-auto"
                            onMouseEnter={() => {
                                if (!categoryClicked) {
                                    if (hoverTimeoutRef.current) {
                                        clearTimeout(hoverTimeoutRef.current);
                                        hoverTimeoutRef.current = null;
                                    }
                                    setIsCategoriesHover(true);
                                }
                            }}
                            onMouseLeave={() => {
                                if (!categoryClicked) {
                                    hoverTimeoutRef.current = setTimeout(() => {
                                        setIsCategoriesHover(false);
                                    }, 100);
                                }
                            }}
                        >
                            <button
                                onClick={() => {
                                    navigate(WEB_PAGE.CATEGORIES.path);
                                    setIsCategoriesHover(false);
                                    setCategoryClicked(false);
                                }}
                                className="w-full text-left px-5 py-3 mb-2 bg-gradient-to-b from-[#d5ad41] to-[#f4d799] hover:from-[#f4d799] hover:to-[#d5ad41] rounded-xl font-semibold text-[#3E3C31] shadow-md cursor-pointer"
                            >
                                Xem tất cả sản phẩm
                            </button>
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                Danh mục
                            </h3>
                            <ul className="space-y-1">
                                {categoriesTree.map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() => {
                                                navigate(
                                                    `${WEB_PAGE.CATEGORIES.path}?category=${cat.id}`
                                                );
                                                setIsCategoriesHover(false);
                                                setCategoryClicked(false);
                                            }}
                                            className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
                                        >
                                            {cat.name}
                                        </button>
                                        {cat.child.length > 0 && (
                                            <ul className="ml-4 space-y-1">
                                                {cat.child.map((sub) => (
                                                    <li key={sub.id}>
                                                        <button
                                                            onClick={() => {
                                                                navigate(
                                                                    `${WEB_PAGE.CATEGORIES.path}?category=${sub.id}`
                                                                );
                                                                setIsCategoriesHover(
                                                                    false
                                                                );
                                                                setCategoryClicked(
                                                                    false
                                                                );
                                                            }}
                                                            className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-gray-600 text-sm cursor-pointer"
                                                        >
                                                            {sub.name}
                                                        </button>
                                                        {sub.child.length >
                                                            0 && (
                                                            <ul className="ml-4 space-y-1">
                                                                {sub.child.map(
                                                                    (grand) => (
                                                                        <li
                                                                            key={
                                                                                grand.id
                                                                            }
                                                                        >
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        `${WEB_PAGE.CATEGORIES.path}?category=${grand.id}`
                                                                                    );
                                                                                    setIsCategoriesHover(
                                                                                        false
                                                                                    );
                                                                                    setCategoryClicked(
                                                                                        false
                                                                                    );
                                                                                }}
                                                                                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-gray-500 text-xs cursor-pointer"
                                                                            >
                                                                                {
                                                                                    grand.name
                                                                                }
                                                                            </button>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

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

export default Layout;

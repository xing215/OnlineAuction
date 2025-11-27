import type { PropsWithChildren } from "react";
import { ExpandMoreRounded, HomeRounded, PersonOutlineRounded, SearchRounded } from "@mui/icons-material";
import { useLayout } from "../hooks/useLayout";
import { WEB_PAGE, type WebPageKey } from "../constants/webPages";

const sectionTitleStyles = "text-xs uppercase tracking-[0.2em] text-white/60";

export const Layout = ({ children }: PropsWithChildren) => {
  const {
    activePage,
    primaryNav,
    secondaryNav,
    searchValue,
    isCategoryOpen,
    isAccountOpen,
    handleNavigate,
    handleSearchChange,
    toggleCategory,
    toggleAccount,
  } = useLayout();

  const renderPrimaryButton = (key: WebPageKey, label: string) => {
    const isActive = activePage === key;
    const isCategoryButton = key === "CATEGORIES";
    const IconComponent = WEB_PAGE[key].Icon;

    const baseClass =
      "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all";
    const activeClass =
      "bg-gradient-to-b from-[#d5ad41] to-[#f4d799] text-[#3E3C31] shadow-[0_10px_15px_-3px_rgba(213,173,65,0.3)]";
    const inactiveClass = "text-white hover:bg-white/10";

    const handleClick = () => {
      if (isCategoryButton) {
        toggleCategory();
        handleNavigate(key);
        return;
      }
      handleNavigate(key);
    };

    return (
      <button
        key={key}
        type="button"
        onClick={handleClick}
        className={`${baseClass} ${isActive ? activeClass : inactiveClass} cursor-pointer`}
      >
        <span className="flex items-center gap-3">
          <IconComponent
            className={isActive ? "h-5 w-5 text-[#3E3C31]" : "h-5 w-5 text-white"}
            data-testid={`${key.toLowerCase()}-icon`}
          />
          <span className={isActive ? "text-[#3E3C31]" : "text-white"}>{label}</span>
        </span>
        {isCategoryButton && (
          <ExpandMoreRounded
            className={`h-5 w-5 transition-transform ${
              isCategoryOpen ? "rotate-180" : ""
            }`}
            style={{ color: isActive ? "#3E3C31" : "rgba(255,255,255,0.7)" }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#26241A] text-white">
      <aside className="w-[256px] h-screen sticky top-0 bg-[#3E3C31] px-6 py-6 flex flex-col justify-between">
        <div className="space-y-6 overflow-y-auto pr-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#d5ad41] to-[#f4d799]">
              <HomeRounded className="h-5 w-5 text-[#3E3C31]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-transparent bg-gradient-to-b from-[#d5ad41] to-[#f4d799] bg-clip-text">
                Golden Bid
              </p>
              <p className="text-sm text-[#99A1AF]">Đấu giá trực tuyến</p>
            </div>
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-[#99A1AF] focus-within:border-[#f4d799] cursor-text">
            <SearchRounded className="h-4 w-4 text-[#99A1AF]" />
            <input
              className="flex-1 bg-transparent text-white placeholder:text-[#99A1AF] focus:outline-none"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </label>

          <div className="space-y-2">
            {primaryNav.map((item) => renderPrimaryButton(item.key, item.label))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 border-l border-[#d5ad41]/60 pl-4">
            <p className={sectionTitleStyles}>Tài khoản</p>
            {isAccountOpen &&
              secondaryNav.map((item) => {
                const SecondaryIcon = WEB_PAGE[item.key].Icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
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
            onClick={() => {
              toggleAccount();
            }}
            className="flex items-center justify-between rounded-2xl bg-[#d5ad41] px-4 py-3 text-sm font-semibold text-[#3E3C31] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <PersonOutlineRounded className="h-5 w-5 text-[#3E3C31]" />
              Nguyễn Văn A
            </span>
            <ExpandMoreRounded
              className={`h-4 w-4 text-[#3E3C31] transition-transform ${
                isAccountOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </aside>
      {children && <main className="flex-1 bg-transparent">{children}</main>}
    </div>
  );
};

export default Layout;

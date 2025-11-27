import { useEffect, useMemo, useState } from "react";
import {
  PRIMARY_NAV_KEYS,
  SECONDARY_NAV_KEYS,
  WEB_PAGE,
  type WebPageKey,
} from "../constants/webPages";

export interface LayoutNavItem {
  key: WebPageKey;
  label: string;
  path: string;
}

const getPageKeyFromPath = (path: string): WebPageKey => {
  const keys = Object.keys(WEB_PAGE) as WebPageKey[];
  const match = keys.find((key) => WEB_PAGE[key].path === path);

  return match ?? "HOME";
};

const getInitialPage = (): WebPageKey => {
  if (typeof window === "undefined") {
    return "HOME";
  }

  return getPageKeyFromPath(window.location.pathname);
};

export const useLayout = () => {
  const [activePage, setActivePage] = useState<WebPageKey>(() => getInitialPage());
  const [searchValue, setSearchValue] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const primaryNav = useMemo<LayoutNavItem[]>(
    () =>
      PRIMARY_NAV_KEYS.map((key) => ({
        key,
        label: WEB_PAGE[key].label,
        path: WEB_PAGE[key].path,
      })),
    []
  );

  const secondaryNav = useMemo<LayoutNavItem[]>(
    () =>
      SECONDARY_NAV_KEYS.map((key) => ({
        key,
        label: WEB_PAGE[key].label,
        path: WEB_PAGE[key].path,
      })),
    []
  );

  const handleNavigate = (key: WebPageKey) => {
    setActivePage(key);

    if (typeof window !== "undefined") {
      const targetPath = WEB_PAGE[key].path;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, "", targetPath);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const toggleCategory = () => {
    setIsCategoryOpen((prev) => !prev);
  };

  const toggleAccount = () => {
    setIsAccountOpen((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handlePopState = () => {
      setActivePage(getPageKeyFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return {
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
  };
};

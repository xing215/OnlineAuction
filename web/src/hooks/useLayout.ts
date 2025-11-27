import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

export const useLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState<WebPageKey>(() => getPageKeyFromPath(location.pathname));
  const [searchValue, setSearchValue] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);
  const sidebarAnimationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    const targetPath = WEB_PAGE[key].path;
    navigate(targetPath);
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

  const toggleSidebar = () => {
    setIsSidebarAnimating(true);
    setIsSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setActivePage(getPageKeyFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (!isSidebarAnimating) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setIsSidebarAnimating(false);
      sidebarAnimationTimer.current = undefined;
    }, 320);

    sidebarAnimationTimer.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isSidebarAnimating]);

  useEffect(() => {
    return () => {
      if (sidebarAnimationTimer.current !== undefined) {
        clearTimeout(sidebarAnimationTimer.current);
      }
    };
  }, []);

  return {
    activePage,
    primaryNav,
    secondaryNav,
    searchValue,
    isCategoryOpen,
    isAccountOpen,
    isSidebarCollapsed,
    isSidebarAnimating,
    handleNavigate,
    handleSearchChange,
    toggleCategory,
    toggleAccount,
    toggleSidebar,
  };
};

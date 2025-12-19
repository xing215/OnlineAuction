import type { SvgIconComponent } from "@mui/icons-material";
import {
  AccountCircleRounded,
  FavoriteBorderRounded,
  HistoryRounded,
  HomeRounded,
  Inventory2Rounded,
  LockResetRounded,
  LogoutRounded,
  MenuRounded,
  Receipt,
} from "@mui/icons-material";

export interface WebPageConfig {
  path: string;
  label: string;
  Icon: SvgIconComponent;
}

export const WEB_PAGE = {
  HOME: { path: "/", label: "Trang chủ", Icon: HomeRounded },
  CATEGORIES: { path: "/categories", label: "Danh mục", Icon: MenuRounded },
  FAVORITES: { path: "/favorites", label: "Yêu thích", Icon: FavoriteBorderRounded },
  BID_HISTORY: { path: "/bid-history", label: "Lịch sử đấu giá", Icon: HistoryRounded },
  MY_PRODUCTS: { path: "/my-products", label: "Sản phẩm của tôi", Icon: Inventory2Rounded },
  PROFILE: { path: "/profile", label: "Hồ sơ", Icon: AccountCircleRounded },
  CHANGE_PASSWORD: { path: "/change-password", label: "Đổi mật khẩu", Icon: LockResetRounded },
  LOGOUT: { path: "/logout", label: "Đăng xuất", Icon: LogoutRounded },
  CREATE_PRODUCT: { path: "/my-products/new", label: "Đăng sản phẩm", Icon: Inventory2Rounded },
  ORDER: { path: "/order", label: "Đơn hàng", Icon: Receipt},
} as const satisfies Record<string, WebPageConfig>;

export type WebPageKey = keyof typeof WEB_PAGE;

export const PRIMARY_NAV_KEYS: WebPageKey[] = [
  "HOME",
  "CATEGORIES",
  "FAVORITES",
  "BID_HISTORY",
  "MY_PRODUCTS",
  "ORDER"
];

export const SECONDARY_NAV_KEYS: WebPageKey[] = [
  "PROFILE",
  "CHANGE_PASSWORD",
  "LOGOUT",
];

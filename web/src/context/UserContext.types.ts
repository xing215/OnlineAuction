import type { User } from "../types";

export type AuthUser = Partial<User> & {
  _id?: string;
  fullName?: string;
  full_name?: string;
  name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  recaptchaToken?: string;
};

export type LoginVerifyPayload = {
  email: string;
  otp: string;
  recaptchaToken?: string;
};

export type LoginResult = AuthUser | { requires_verification: true; email: string };

export type UserContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  loginVerify: (payload: LoginVerifyPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (next: AuthUser | null) => void;
};

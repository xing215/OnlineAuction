import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiUrl } from "../config/api";
import { UserContext } from "./UserContext.context";
import type { AuthUser, LoginPayload } from "./UserContext.types";
const TOKEN_KEY = "token";
const USER_KEY = "user";

type StorageKey = "local" | "session";

const isBrowser = typeof window !== "undefined";

const getStorage = (key: StorageKey) => {
  if (!isBrowser) {
    return undefined;
  }
  return key === "local" ? window.localStorage : window.sessionStorage;
};

const resolveUser = (raw: unknown): AuthUser | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const directCandidate = record.user;

  if (directCandidate && typeof directCandidate === "object") {
    return directCandidate as AuthUser;
  }

  const dataCandidate = record.data;

  if (dataCandidate && typeof dataCandidate === "object") {
    const nestedUser = (dataCandidate as Record<string, unknown>).user;
    if (nestedUser && typeof nestedUser === "object") {
      return nestedUser as AuthUser;
    }
  }

  return raw as AuthUser;
};

const parseStoredUser = (raw: string | null): AuthUser | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return resolveUser(parsed);
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
};

const detectTokenSource = () => {
  if (!isBrowser) {
    return { token: null as string | null, source: null as StorageKey | null };
  }
  const localToken = window.localStorage.getItem(TOKEN_KEY);
  if (localToken) {
    return { token: localToken, source: "local" as StorageKey };
  }
  const sessionToken = window.sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) {
    return { token: sessionToken, source: "session" as StorageKey };
  }
  return { token: null, source: null };
};

const persistAuth = (authUser: AuthUser, token: string, target: StorageKey) => {
  const storage = getStorage(target);
  const opposite = getStorage(target === "local" ? "session" : "local");

  if (!storage) {
    return;
  }

  try {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(authUser));
  } catch (error) {
    console.warn("Failed to persist auth state", error);
  }

  if (opposite) {
    try {
      opposite.removeItem(TOKEN_KEY);
      opposite.removeItem(USER_KEY);
    } catch (error) {
      console.warn("Failed to clear alternate storage", error);
    }
  }
};

const persistUser = (authUser: AuthUser | null, target: StorageKey | null) => {
  if (!isBrowser || !target) {
    return;
  }

  const storage = getStorage(target);

  if (!storage) {
    return;
  }

  try {
    if (authUser) {
      storage.setItem(USER_KEY, JSON.stringify(authUser));
    } else {
      storage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist user profile", error);
  }
};

const clearAuth = () => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.warn("Failed to clear local storage", error);
  }

  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.warn("Failed to clear session storage", error);
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<StorageKey | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserWithToken = useCallback(async (authToken: string) => {
    const response = await fetch(apiUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải thông tin người dùng");
    }

    const payload = await response.json();
    return resolveUser(payload);
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        if (!isBrowser) {
          return;
        }

        const { token: storedToken, source } = detectTokenSource();

        if (!active) {
          return;
        }

        setToken(storedToken);
        setStorageKey(source);

        let hydratedUser: AuthUser | null = null;

        if (source) {
          const storage = getStorage(source);
          const raw = storage?.getItem(USER_KEY) ?? null;
          hydratedUser = parseStoredUser(raw);
        } else {
          const raw = window.localStorage.getItem(USER_KEY);
          hydratedUser = parseStoredUser(raw);
        }

        if (hydratedUser) {
          if (active) {
            setUser(hydratedUser);
          }
          return;
        }

        if (storedToken) {
          try {
            const fetchedUser = await fetchUserWithToken(storedToken);
            if (fetchedUser && active) {
              setUser(fetchedUser);
              if (source) {
                persistUser(fetchedUser, source);
              }
            }
          } catch (error) {
            console.warn("Failed to refresh user during bootstrap", error);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [fetchUserWithToken]);

  const login = useCallback(
    async ({ email, password, recaptchaToken }: LoginPayload) => {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof data?.message === "string" ? data.message : "Đăng nhập thất bại";
        throw new Error(message);
      }

      const receivedToken = data?.token ?? data?.data?.token;
      if (!receivedToken || typeof receivedToken !== "string") {
        throw new Error("Máy chủ không trả về token hợp lệ");
      }

      const receivedUser = resolveUser(data) ?? resolveUser(data?.data) ?? null;

      let finalUser = receivedUser;

      if (!finalUser) {
        try {
          finalUser = await fetchUserWithToken(receivedToken);
        } catch (error) {
          console.warn("Failed to fetch profile after login", error);
        }
      }

      if (!finalUser) {
        throw new Error("Không thể tải thông tin người dùng");
      }

      const targetStorage: StorageKey = "session";

      setToken(receivedToken);
      setUser(finalUser);
      setStorageKey(targetStorage);
      persistAuth(finalUser, receivedToken, targetStorage);

      return finalUser;
    },
    [fetchUserWithToken]
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
    setStorageKey(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const updatedUser = await fetchUserWithToken(token);
      setUser(updatedUser);
      const target = storageKey ?? detectTokenSource().source ?? "local";
      if (updatedUser) {
        persistAuth(updatedUser, token, target);
      } else {
        persistUser(null, target);
      }
      return updatedUser;
    } catch (error) {
      console.warn("Failed to refresh user", error);
      return null;
    }
  }, [fetchUserWithToken, storageKey, token]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refreshUser, setUser }),
    [user, token, loading, login, logout, refreshUser, setUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

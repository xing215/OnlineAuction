const buildBaseUrl = (): string => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (typeof envBase === "string" && envBase.trim().length > 0) {
    return envBase.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const envPort = import.meta.env.VITE_API_PORT;
    const apiPort = typeof envPort === "string" && envPort.trim().length > 0 ? envPort : "3000";

    if (port === apiPort) {
      return `${protocol}//${hostname}`;
    }

    return `${protocol}//${hostname}:${apiPort}`;
  }

  return "http://127.0.0.1:3000";
};

export const API_BASE_URL = buildBaseUrl();

export const apiUrl = (path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

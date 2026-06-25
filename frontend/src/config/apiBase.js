
const DEFAULT_DEV_API_URL = "http://localhost:5001/api";

const normalizeUrl = (url) => (url || "").trim().replace(/\/+$/, "");
const isLocalhostUrl = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);

const rawApiUrl = normalizeUrl(import.meta.env.VITE_API_URL);
const defaultProdApiUrl = import.meta.env.PROD ? `${window.location.origin}/api` : DEFAULT_DEV_API_URL;
const safeApiUrl =
  rawApiUrl && !(import.meta.env.PROD && isLocalhostUrl(rawApiUrl))
    ? rawApiUrl
    : defaultProdApiUrl;

const rawBackendUrl = normalizeUrl(import.meta.env.VITE_BACKEND_URL);
const derivedBackendUrl = safeApiUrl.replace(/\/api\/?$/, "");

export const API_BASE_URL = safeApiUrl;
export const BACKEND_BASE_URL =
  rawBackendUrl
    ? rawBackendUrl
    : import.meta.env.PROD
      ? window.location.origin
      : derivedBackendUrl;

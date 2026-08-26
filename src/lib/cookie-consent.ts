export const COOKIE_CONSENT_VERSION = 1 as const;

const CONSENT_COOKIE_NAME = "delphi_cookie_consent";
const SHARED_COOKIE_DOMAIN = ".delphiverify.com";
const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export type OptionalConsentCategory =
  | "analytics"
  | "maps"
  | "preferences";

export type CookieConsent = {
  version: typeof COOKIE_CONSENT_VERSION;
  decided: boolean;
  analytics: boolean;
  maps: boolean;
  preferences: boolean;
  updatedAt: string | null;
};

export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  version: COOKIE_CONSENT_VERSION,
  decided: false,
  analytics: false,
  maps: false,
  preferences: false,
  updatedAt: null,
};

function cookieDomain() {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname.toLowerCase();
  return hostname === "delphiverify.com" || hostname.endsWith(".delphiverify.com")
    ? `; Domain=${SHARED_COOKIE_DOMAIN}`
    : "";
}

function secureAttribute() {
  return typeof window !== "undefined" && window.location.protocol === "https:"
    ? "; Secure"
    : "";
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : null;
}

export function parseCookieConsent(raw: string | null): CookieConsent {
  if (!raw) return DEFAULT_COOKIE_CONSENT;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsent>;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return DEFAULT_COOKIE_CONSENT;

    const analyticsWasDecided = typeof parsed.analytics === "boolean";
    return {
      version: COOKIE_CONSENT_VERSION,
      decided: parsed.decided === true && analyticsWasDecided,
      analytics: parsed.analytics === true,
      maps: parsed.maps === true,
      preferences: parsed.preferences === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return DEFAULT_COOKIE_CONSENT;
  }
}

export function readCookieConsent() {
  return parseCookieConsent(readCookie(CONSENT_COOKIE_NAME));
}

export function writeCookieConsent(consent: CookieConsent) {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${cookieDomain()}${secureAttribute()}`;
}

export function hasCookieConsent(category: OptionalConsentCategory) {
  return readCookieConsent()[category];
}

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type CookieConsent,
  DEFAULT_COOKIE_CONSENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";
import { setAnalyticsConsent } from "@/lib/posthog";

export type ConsentSelection = Pick<
  CookieConsent,
  "analytics" | "maps" | "preferences"
>;

type CookieConsentContextValue = {
  consent: CookieConsent;
  ready: boolean;
  preferencesOpen: boolean;
  acceptAll: () => void;
  allowMaps: () => void;
  closePreferences: () => void;
  openPreferences: () => void;
  rejectOptional: () => void;
  savePreferences: (selection: ConsentSelection) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function syncOptionalServices(consent: CookieConsent) {
  setAnalyticsConsent(consent.analytics);
  if (!consent.preferences && typeof localStorage !== "undefined") {
    localStorage.removeItem("dv-theme");
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState(DEFAULT_COOKIE_CONSENT);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const stored = readCookieConsent();
    setConsent(stored);
    syncOptionalServices(stored);
    setReady(true);
  }, []);

  const applyConsent = useCallback((next: CookieConsent) => {
    const persisted = { ...next, updatedAt: new Date().toISOString() };
    writeCookieConsent(persisted);
    syncOptionalServices(persisted);
    setConsent(persisted);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      ready,
      preferencesOpen,
      acceptAll() {
        applyConsent({
          ...consent,
          decided: true,
          analytics: true,
          maps: true,
          preferences: true,
        });
        setPreferencesOpen(false);
      },
      allowMaps() {
        applyConsent({ ...consent, maps: true });
      },
      closePreferences() {
        setPreferencesOpen(false);
      },
      openPreferences() {
        setPreferencesOpen(true);
      },
      rejectOptional() {
        applyConsent({
          ...consent,
          decided: true,
          analytics: false,
          maps: false,
          preferences: false,
        });
        setPreferencesOpen(false);
      },
      savePreferences(selection) {
        applyConsent({ ...consent, ...selection, decided: true });
        setPreferencesOpen(false);
      },
    }),
    [applyConsent, consent, preferencesOpen, ready],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return context;
}

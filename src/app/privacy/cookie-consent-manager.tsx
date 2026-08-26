import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  type ConsentSelection,
  useCookieConsent,
} from "./cookie-consent-context";

const EMPTY_SELECTION: ConsentSelection = {
  analytics: false,
  maps: false,
  preferences: false,
};

export function CookieConsentManager() {
  const {
    acceptAll,
    closePreferences,
    consent,
    openPreferences,
    preferencesOpen,
    ready,
    rejectOptional,
    savePreferences,
  } = useCookieConsent();
  const [draft, setDraft] = useState(EMPTY_SELECTION);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!preferencesOpen) return;
    setDraft({
      analytics: consent.analytics,
      maps: consent.maps,
      preferences: consent.preferences,
    });
    closeButton.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreferences();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closePreferences, consent, preferencesOpen]);

  if (!ready) return null;

  return (
    <>
      {!consent.decided && !preferencesOpen ? (
        <section
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-[74rem] rounded-lg border border-line bg-surface-raised p-5 shadow-overlay md:bottom-6 md:flex md:items-center md:gap-8 md:p-6"
        >
          <div className="flex min-w-0 flex-1 gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-ink-accent">
              <ShieldIcon />
            </span>
            <div>
              <h2 className="text-subheading text-ink">Your privacy choices</h2>
              <p className="mt-2 text-body-sm text-ink-secondary">
                We use an essential cookie to remember your choices. Optional technologies support
                preferences, analytics and embedded maps. Read our{" "}
                <Link className="font-semibold text-ink-accent underline" to="/privacy#cookies">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="mt-5 grid shrink-0 gap-2 sm:grid-cols-3 md:mt-0 md:flex">
            <Button variant="secondary" onClick={rejectOptional}>Reject optional</Button>
            <Button variant="secondary" onClick={openPreferences}>Manage choices</Button>
            <Button onClick={acceptAll}>Accept all</Button>
          </div>
        </section>
      ) : null}

      {preferencesOpen ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <section
            aria-describedby="cookie-settings-description"
            aria-labelledby="cookie-settings-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-line bg-surface-raised shadow-overlay"
            role="dialog"
          >
            <div className="flex items-start justify-between border-b border-line p-6">
              <div>
                <p className="text-eyebrow uppercase text-ink-accent">Privacy</p>
                <h2 className="mt-2 text-heading text-ink" id="cookie-settings-title">
                  Cookie settings
                </h2>
                <p className="mt-2 text-body-sm text-ink-secondary" id="cookie-settings-description">
                  Choose which optional services Delphi Verify may use on this device.
                </p>
              </div>
              <button
                aria-label="Close cookie settings"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-ink-secondary hover:border-line-strong hover:text-ink"
                onClick={closePreferences}
                ref={closeButton}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-3 p-6">
              <ConsentRow
                checked
                description="Remembers your privacy choice for 180 days. This cookie cannot be disabled."
                disabled
                label="Essential"
                onChange={() => undefined}
              />
              <ConsentRow
                checked={draft.preferences}
                description="Remembers display choices such as light or dark theme."
                label="Preferences"
                onChange={(preferences) => setDraft((current) => ({ ...current, preferences }))}
              />
              <ConsentRow
                checked={draft.analytics}
                description="Sends limited page and interaction events to our EU-hosted PostHog project."
                label="Analytics"
                onChange={(analytics) => setDraft((current) => ({ ...current, analytics }))}
              />
              <ConsentRow
                checked={draft.maps}
                description="Loads Google Maps and OpenStreetMap content, which discloses your IP address to those providers."
                label="Embedded maps"
                onChange={(maps) => setDraft((current) => ({ ...current, maps }))}
              />
            </div>

            <div className="grid gap-2 border-t border-line p-6 sm:grid-cols-3">
              <Button variant="secondary" onClick={rejectOptional}>Reject optional</Button>
              <Button variant="secondary" onClick={() => savePreferences(draft)}>Save choices</Button>
              <Button onClick={acceptAll}>Accept all</Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function ConsentRow({
  checked,
  description,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-md border border-line p-4 has-[:disabled]:cursor-default has-[:checked]:border-line-strong has-[:checked]:bg-accent-subtle">
      <input
        checked={checked}
        className="mt-1 h-5 w-5 accent-accent"
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>
        <span className="block text-body-sm font-semibold text-ink">{label}</span>
        <span className="mt-1 block text-caption text-ink-secondary">{description}</span>
      </span>
    </label>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 20 20">
      <path d="M10 2.25 16 4.5v4.25c0 4.1-2.35 7.1-6 9-3.65-1.9-6-4.9-6-9V4.5l6-2.25Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="m7.25 10 1.75 1.75 3.75-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  );
}

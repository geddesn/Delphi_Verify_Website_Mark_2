import { useEffect, useState } from "react";

type Choice = "light" | "dark" | "system";

const STORAGE_KEY = "dv-theme";

function apply(choice: Choice) {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
}

export function readStoredTheme(): Choice {
  if (typeof localStorage === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/** Cycles system → light → dark. Because the whole palette lives in the token
 *  layer, this only sets an attribute — no component re-renders for theming. */
export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>(readStoredTheme);

  useEffect(() => {
    apply(choice);
    if (choice === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  }, [choice]);

  const next: Record<Choice, Choice> = {
    system: "light",
    light: "dark",
    dark: "system",
  };

  const label =
    choice === "system"
      ? "Theme: follows system"
      : choice === "light"
        ? "Theme: light"
        : "Theme: dark";

  return (
    <button
      type="button"
      onClick={() => setChoice(next[choice])}
      aria-label={`${label}. Activate to change.`}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
      style={{ transitionDuration: "var(--duration-fast)" }}
    >
      {choice === "dark" ? <MoonIcon /> : choice === "light" ? <SunIcon /> : <SystemIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1m11.95-4.95-1.06 1.06M4.11 11.89l-1.06 1.06m9.9 0-1.06-1.06M4.11 4.11 3.05 3.05"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M13.5 9.7A5.8 5.8 0 0 1 6.3 2.5a5.8 5.8 0 1 0 7.2 7.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <rect
        x="1.75"
        y="2.75"
        width="12.5"
        height="8.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M5.5 13.75h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

if (!posthogKey && import.meta.env.DEV) {
  throw new Error(
    "VITE_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_KEY is configured",
  );
}
if (!posthogHost && import.meta.env.DEV) {
  throw new Error(
    "VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured",
  );
}

export const isPostHogEnabled = Boolean(
  posthogKey && posthogHost && typeof window !== "undefined",
);

const posthogClient = isPostHogEnabled
  ? import("posthog-js").then(({ default: posthog }) => {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        defaults: "2026-05-30",
        capture_pageview: "history_change",
        capture_exceptions: {
          capture_unhandled_errors: true,
          capture_unhandled_rejections: true,
          capture_console_errors: false,
        },
      });
      return posthog;
    })
  : null;

const posthog = {
  capture(event: string, properties?: Record<string, unknown>) {
    void posthogClient?.then((client) => client.capture(event, properties));
  },
};

export default posthog;

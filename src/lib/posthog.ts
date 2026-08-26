import { redactAnalyticsProperties } from "@/lib/analytics-privacy";

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

type PostHogClient = (typeof import("posthog-js"))["default"];

let analyticsAllowed = false;
let posthogClient: Promise<PostHogClient> | null = null;

function loadPostHog() {
  if (!isPostHogEnabled) return null;
  posthogClient ??= import("posthog-js").then(({ default: client }) => {
    client.init(posthogKey, {
      api_host: posthogHost,
      defaults: "2026-05-30",
      advanced_disable_flags: true,
      autocapture: false,
      capture_exceptions: false,
      capture_pageview: "history_change",
      disable_external_dependency_loading: true,
      disable_session_recording: true,
      disable_surveys: true,
      mask_all_element_attributes: true,
      mask_all_text: true,
      opt_out_capturing_by_default: true,
      opt_out_persistence_by_default: true,
      persistence: "localStorage",
      person_profiles: "never",
      respect_dnt: true,
      before_send(event) {
        if (!event) return event;
        event.properties = redactAnalyticsProperties(event.properties ?? {});
        return event;
      },
    });
    return client;
  });
  return posthogClient;
}

export function setAnalyticsConsent(allowed: boolean) {
  if (analyticsAllowed === allowed) return;
  analyticsAllowed = allowed;

  if (!allowed) {
    void posthogClient?.then((client) => client.opt_out_capturing());
    return;
  }

  void loadPostHog()?.then((client) => {
    if (!analyticsAllowed) {
      client.opt_out_capturing();
      return;
    }
    client.opt_in_capturing({ captureEventName: false });
    client.capture("$pageview", { title: document.title });
  });
}

const posthog = {
  capture(event: string, properties?: Record<string, unknown>) {
    if (!analyticsAllowed) return;
    void loadPostHog()?.then((client) => {
      if (analyticsAllowed) client.capture(event, properties);
    });
  },
};

export default posthog;

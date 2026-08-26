const CERTIFICATE_PATH = /\/v\/[a-z0-9-]+/gi;

export function redactAnalyticsString(value: string) {
  return value.replace(CERTIFICATE_PATH, "/v/[redacted]");
}

export function redactAnalyticsProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      typeof value === "string" ? redactAnalyticsString(value) : value,
    ]),
  );
}

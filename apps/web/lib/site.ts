const fallbackOrigin = "http://localhost:8090";

export function getPublicOrigin() {
  const configuredOrigin = process.env.PUBLIC_ORIGIN?.trim() || fallbackOrigin;

  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return fallbackOrigin;
  }
}


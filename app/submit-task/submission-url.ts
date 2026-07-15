const HTTP_PROTOCOL_PATTERN = /^https?:\/\//i;

export type SubmissionUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function hasValidPublicHostname(hostname: string) {
  if (!hostname.includes(".") || hostname.length > 253) {
    return false;
  }

  return hostname.split(".").every((label) => {
    return (
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
    );
  });
}

export function normalizeSubmissionUrl(value: string): SubmissionUrlResult {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { ok: false, error: "A link to your completed work is required." };
  }

  const candidate = HTTP_PROTOCOL_PATTERN.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(candidate);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !hasValidPublicHostname(url.hostname)
    ) {
      return {
        ok: false,
        error: "Enter a valid public website address, such as drive.google.com/your-file.",
      };
    }

    return { ok: true, url: url.toString() };
  } catch {
    return {
      ok: false,
      error: "Enter a valid public website address, such as drive.google.com/your-file.",
    };
  }
}

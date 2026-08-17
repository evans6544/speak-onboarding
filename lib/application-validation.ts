export type ApplicationInput = {
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  socialMedia: string;
  currentOccupation: string;
  applicationComment: string;
  introductionVideoUrl: string;
};

export type ApplicationFieldErrors = Partial<
  Record<keyof ApplicationInput, string>
>;

export type ApplicationValidationResult =
  | { ok: true; data: ApplicationInput }
  | { ok: false; fieldErrors: ApplicationFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePublicUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const candidate = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    return new URL(candidate).toString();
  } catch {
    return candidate;
  }
}

function isValidPublicUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export function parseApplicationFormData(
  formData: FormData,
): ApplicationInput {
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
    position: String(formData.get("position") ?? "").trim(),
    socialMedia: String(formData.get("socialMedia") ?? "").trim(),
    currentOccupation: String(formData.get("occupation") ?? "").trim(),
    applicationComment: String(
      formData.get("applicationComment") ?? "",
    ).trim(),
    introductionVideoUrl: normalizePublicUrl(
      String(formData.get("introductionVideoUrl") ?? ""),
    ),
  };
}

export function validateApplicationInput(
  input: ApplicationInput,
): ApplicationValidationResult {
  const fieldErrors: ApplicationFieldErrors = {};

  if (!input.fullName) {
    fieldErrors.fullName = "Full name is required.";
  } else if (input.fullName.length < 2) {
    fieldErrors.fullName = "Full name must be at least 2 characters.";
  } else if (input.fullName.length > 200) {
    fieldErrors.fullName = "Full name must be 200 characters or fewer.";
  }

  if (!input.email) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(input.email)) {
    fieldErrors.email = "Please enter a valid email address.";
  } else if (input.email.length > 254) {
    fieldErrors.email = "Email must be 254 characters or fewer.";
  }

  if (!input.position) {
    fieldErrors.position = "Position is required.";
  } else if (input.position.length > 200) {
    fieldErrors.position = "Position must be 200 characters or fewer.";
  }

  if (input.socialMedia.length > 2000) {
    fieldErrors.socialMedia =
      "Social media profiles must be 2000 characters or fewer.";
  }

  if (!input.currentOccupation) {
    fieldErrors.currentOccupation = "Current occupation or status is required.";
  } else if (input.currentOccupation.length > 200) {
    fieldErrors.currentOccupation =
      "Current occupation must be 200 characters or fewer.";
  }

  if (input.applicationComment.length > 2000) {
    fieldErrors.applicationComment =
      "Comment must be 2000 characters or fewer.";
  }

  if (!input.introductionVideoUrl) {
    fieldErrors.introductionVideoUrl = "Introduction video link is required.";
  } else if (!isValidPublicUrl(input.introductionVideoUrl)) {
    fieldErrors.introductionVideoUrl =
      "Please enter a valid public video link.";
  } else if (input.introductionVideoUrl.length > 2000) {
    fieldErrors.introductionVideoUrl =
      "Introduction video link must be 2000 characters or fewer.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, data: input };
}

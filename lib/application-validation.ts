export type ApplicationInput = {
  fullName: string;
  email: string;
  position: string;
  socialMedia: string;
  currentOccupation: string;
};

export type ApplicationFieldErrors = Partial<
  Record<keyof ApplicationInput, string>
>;

export type ApplicationValidationResult =
  | { ok: true; data: ApplicationInput }
  | { ok: false; fieldErrors: ApplicationFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseApplicationFormData(
  formData: FormData,
): ApplicationInput {
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    position: String(formData.get("position") ?? "").trim(),
    socialMedia: String(formData.get("socialMedia") ?? "").trim(),
    currentOccupation: String(formData.get("occupation") ?? "").trim(),
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

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, data: input };
}

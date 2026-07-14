import { Resend } from "resend";
import type { ApplicationInput } from "@/lib/application-validation";

type EmailResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
    };

type EmailConfig =
  | {
      ok: true;
      resend: Resend;
      ceoEmail: string;
      fromEmail: string;
    }
  | {
      ok: false;
      error: string;
    };

const requiredEmailEnv = ["RESEND_API_KEY", "CEO_EMAIL", "FROM_EMAIL"] as const;

function getEmailConfig(): EmailConfig {
  const missing = requiredEmailEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing email configuration: ${missing.join(", ")}.`,
    };
  }

  return {
    ok: true,
    resend: new Resend(process.env.RESEND_API_KEY as string),
    ceoEmail: process.env.CEO_EMAIL as string,
    fromEmail: process.env.FROM_EMAIL as string,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applicantConfirmationText(input: ApplicationInput) {
  return [
    `Hi ${input.fullName},`,
    "",
    "Thank you for applying to SPEAK Lithuania. We received your application and will review it soon.",
    "",
    "Application details:",
    `Position: ${input.position}`,
    `Current occupation/status: ${input.currentOccupation}`,
    input.socialMedia ? `Social media: ${input.socialMedia}` : "",
    "",
    "SPEAK Lithuania",
  ]
    .filter(Boolean)
    .join("\n");
}

function applicantConfirmationHtml(input: ApplicationInput) {
  return `
    <div>
      <p>Hi ${escapeHtml(input.fullName)},</p>
      <p>Thank you for applying to SPEAK Lithuania. We received your application and will review it soon.</p>
      <h2>Application details</h2>
      <ul>
        <li><strong>Position:</strong> ${escapeHtml(input.position)}</li>
        <li><strong>Current occupation/status:</strong> ${escapeHtml(input.currentOccupation)}</li>
        ${
          input.socialMedia
            ? `<li><strong>Social media:</strong> ${escapeHtml(input.socialMedia)}</li>`
            : ""
        }
      </ul>
      <p>SPEAK Lithuania</p>
    </div>
  `;
}

function ceoNotificationText(input: ApplicationInput) {
  return [
    "A new application was submitted to SPEAK Lithuania.",
    "",
    `Full name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Position: ${input.position}`,
    `Current occupation/status: ${input.currentOccupation}`,
    `Social media: ${input.socialMedia || "Not provided"}`,
  ].join("\n");
}

function ceoNotificationHtml(input: ApplicationInput) {
  return `
    <div>
      <p>A new application was submitted to SPEAK Lithuania.</p>
      <dl>
        <dt><strong>Full name</strong></dt>
        <dd>${escapeHtml(input.fullName)}</dd>
        <dt><strong>Email</strong></dt>
        <dd>${escapeHtml(input.email)}</dd>
        <dt><strong>Position</strong></dt>
        <dd>${escapeHtml(input.position)}</dd>
        <dt><strong>Current occupation/status</strong></dt>
        <dd>${escapeHtml(input.currentOccupation)}</dd>
        <dt><strong>Social media</strong></dt>
        <dd>${escapeHtml(input.socialMedia || "Not provided")}</dd>
      </dl>
    </div>
  `;
}

function stage1TaskText({
  fullName,
  task,
  submissionLink,
}: {
  fullName: string;
  task: string;
  submissionLink: string;
}) {
  return [
    `Dear ${fullName},`,
    "",
    "Congratulations!",
    "",
    "You have successfully passed the first stage of the SPEAK onboarding process.",
    "",
    "Please complete the following assessment task:",
    "",
    task,
    "",
    `After completing the task, please submit it here: ${submissionLink}`,
    "",
    "Best regards,",
    "SPEAK Lithuania",
  ].join("\n");
}

function stage1TaskHtml({
  fullName,
  task,
  submissionLink,
}: {
  fullName: string;
  task: string;
  submissionLink: string;
}) {
  return `
    <div>
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Congratulations!</p>
      <p>You have successfully passed the first stage of the SPEAK onboarding process.</p>
      <p>Please complete the following assessment task:</p>
      <div style="white-space: pre-wrap;">${escapeHtml(task)}</div>
      <p>After completing the task, please submit it here: <a href="${escapeHtml(submissionLink)}">${escapeHtml(submissionLink)}</a></p>
      <p>Best regards,<br />SPEAK Lithuania</p>
    </div>
  `;
}

function stage1RejectionText({ fullName }: { fullName: string }) {
  return [
    `Dear ${fullName},`,
    "",
    "Thank you for applying to SPEAK Lithuania.",
    "",
    "After reviewing your application, we will not be moving forward to the next stage of the onboarding process at this time.",
    "",
    "We appreciate your interest in SPEAK Lithuania and the time you took to apply.",
    "",
    "Best regards,",
    "SPEAK Lithuania",
  ].join("\n");
}

function stage1RejectionHtml({ fullName }: { fullName: string }) {
  return `
    <div>
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Thank you for applying to SPEAK Lithuania.</p>
      <p>After reviewing your application, we will not be moving forward to the next stage of the onboarding process at this time.</p>
      <p>We appreciate your interest in SPEAK Lithuania and the time you took to apply.</p>
      <p>Best regards,<br />SPEAK Lithuania</p>
    </div>
  `;
}

function taskSubmittedText({
  fullName,
  email,
  submissionLink,
  comments,
  dashboardLink,
}: {
  fullName: string;
  email: string;
  submissionLink: string;
  comments: string;
  dashboardLink: string;
}) {
  return [
    "A Stage 1 task has been submitted.",
    "",
    `Full name: ${fullName}`,
    `Email: ${email}`,
    `Submission link: ${submissionLink}`,
    `Comments: ${comments || "Not provided"}`,
    `Dashboard: ${dashboardLink}`,
  ].join("\n");
}

function taskSubmittedHtml({
  fullName,
  email,
  submissionLink,
  comments,
  dashboardLink,
}: {
  fullName: string;
  email: string;
  submissionLink: string;
  comments: string;
  dashboardLink: string;
}) {
  return `
    <div>
      <p>A Stage 1 task has been submitted.</p>
      <dl>
        <dt><strong>Full name</strong></dt>
        <dd>${escapeHtml(fullName)}</dd>
        <dt><strong>Email</strong></dt>
        <dd>${escapeHtml(email)}</dd>
        <dt><strong>Submission link</strong></dt>
        <dd><a href="${escapeHtml(submissionLink)}">${escapeHtml(submissionLink)}</a></dd>
        <dt><strong>Comments</strong></dt>
        <dd>${escapeHtml(comments || "Not provided")}</dd>
        <dt><strong>Dashboard</strong></dt>
        <dd><a href="${escapeHtml(dashboardLink)}">${escapeHtml(dashboardLink)}</a></dd>
      </dl>
    </div>
  `;
}

function finalDecisionText({
  fullName,
  decision,
}: {
  fullName: string;
  decision: "accepted" | "rejected";
}) {
  if (decision === "accepted") {
    return [
      `Dear ${fullName},`,
      "",
      "Congratulations!",
      "",
      "We are happy to let you know that your SPEAK Lithuania onboarding application has been accepted.",
      "",
      "The SPEAK Lithuania team will contact you with the next steps soon.",
      "",
      "Best regards,",
      "SPEAK Lithuania",
    ].join("\n");
  }

  return [
    `Dear ${fullName},`,
    "",
    "Thank you for taking part in the SPEAK Lithuania onboarding process.",
    "",
    "After reviewing your application and assessment task, we will not be moving forward with your application at this time.",
    "",
    "Thank you again for your interest in SPEAK Lithuania.",
    "",
    "Best regards,",
    "SPEAK Lithuania",
  ].join("\n");
}

function finalDecisionHtml({
  fullName,
  decision,
}: {
  fullName: string;
  decision: "accepted" | "rejected";
}) {
  if (decision === "accepted") {
    return `
      <div>
        <p>Dear ${escapeHtml(fullName)},</p>
        <p>Congratulations!</p>
        <p>We are happy to let you know that your SPEAK Lithuania onboarding application has been accepted.</p>
        <p>The SPEAK Lithuania team will contact you with the next steps soon.</p>
        <p>Best regards,<br />SPEAK Lithuania</p>
      </div>
    `;
  }

  return `
    <div>
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Thank you for taking part in the SPEAK Lithuania onboarding process.</p>
      <p>After reviewing your application and assessment task, we will not be moving forward with your application at this time.</p>
      <p>Thank you again for your interest in SPEAK Lithuania.</p>
      <p>Best regards,<br />SPEAK Lithuania</p>
    </div>
  `;
}

export async function sendApplicationSubmittedEmails(
  input: ApplicationInput,
): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    return config;
  }

  const { resend, ceoEmail, fromEmail } = config;

  try {
    const applicantEmail = await resend.emails.send({
      from: fromEmail,
      to: input.email,
      subject: "We received your SPEAK Lithuania application",
      text: applicantConfirmationText(input),
      html: applicantConfirmationHtml(input),
    });

    if (applicantEmail.error) {
      return {
        ok: false,
        error: `Applicant confirmation email failed: ${applicantEmail.error.message}`,
      };
    }

    const ceoEmailResult = await resend.emails.send({
      from: fromEmail,
      to: ceoEmail,
      subject: `New SPEAK application: ${input.fullName}`,
      text: ceoNotificationText(input),
      html: ceoNotificationHtml(input),
    });

    if (ceoEmailResult.error) {
      return {
        ok: false,
        error: `CEO notification email failed: ${ceoEmailResult.error.message}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }

  return { ok: true };
}

export async function sendStage1TaskEmail({
  applicantId,
  fullName,
  email,
  task,
}: {
  applicantId: string;
  fullName: string;
  email: string;
  task: string;
}): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    return config;
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return {
      ok: false,
      error: "Missing email configuration: NEXT_PUBLIC_APP_URL.",
    };
  }

  const submissionLink = `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/submit-task?applicantId=${encodeURIComponent(applicantId)}`;

  try {
    const taskEmail = await config.resend.emails.send({
      from: config.fromEmail,
      to: email,
      subject: "Congratulations! You've progressed to the next stage",
      text: stage1TaskText({ fullName, task, submissionLink }),
      html: stage1TaskHtml({ fullName, task, submissionLink }),
    });

    if (taskEmail.error) {
      return {
        ok: false,
        error: `Stage 1 task email failed: ${taskEmail.error.message}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }

  return { ok: true };
}

export async function sendStage1RejectionEmail({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    return config;
  }

  try {
    const rejectionEmail = await config.resend.emails.send({
      from: config.fromEmail,
      to: email,
      subject: "Update on your SPEAK Lithuania application",
      text: stage1RejectionText({ fullName }),
      html: stage1RejectionHtml({ fullName }),
    });

    if (rejectionEmail.error) {
      return {
        ok: false,
        error: `Stage 1 rejection email failed: ${rejectionEmail.error.message}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }

  return { ok: true };
}

export async function sendTaskSubmittedEmail({
  applicantId,
  fullName,
  email,
  submissionLink,
  comments,
}: {
  applicantId: string;
  fullName: string;
  email: string;
  submissionLink: string;
  comments: string;
}): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    return config;
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return {
      ok: false,
      error: "Missing email configuration: NEXT_PUBLIC_APP_URL.",
    };
  }

  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/dashboard/${encodeURIComponent(applicantId)}`;

  try {
    const taskSubmittedEmail = await config.resend.emails.send({
      from: config.fromEmail,
      to: config.ceoEmail,
      subject: `Task submitted: ${fullName}`,
      text: taskSubmittedText({
        fullName,
        email,
        submissionLink,
        comments,
        dashboardLink,
      }),
      html: taskSubmittedHtml({
        fullName,
        email,
        submissionLink,
        comments,
        dashboardLink,
      }),
    });

    if (taskSubmittedEmail.error) {
      return {
        ok: false,
        error: `CEO task submission email failed: ${taskSubmittedEmail.error.message}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }

  return { ok: true };
}

export async function sendFinalDecisionEmail({
  fullName,
  email,
  decision,
}: {
  fullName: string;
  email: string;
  decision: "accepted" | "rejected";
}): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    return config;
  }

  try {
    const finalDecisionEmail = await config.resend.emails.send({
      from: config.fromEmail,
      to: email,
      subject:
        decision === "accepted"
          ? "Your SPEAK Lithuania application has been accepted"
          : "Update on your SPEAK Lithuania application",
      text: finalDecisionText({ fullName, decision }),
      html: finalDecisionHtml({ fullName, decision }),
    });

    if (finalDecisionEmail.error) {
      return {
        ok: false,
        error: `Final decision email failed: ${finalDecisionEmail.error.message}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }

  return { ok: true };
}

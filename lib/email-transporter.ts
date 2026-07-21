import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

export type GmailEmailClient = {
  transporter: Transporter;
  ceoEmail: string;
  fromEmail: string;
};

type GmailEmailConfig =
  | { ok: true; client: GmailEmailClient }
  | { ok: false; error: string };

const requiredEmailEnv = [
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "CEO_EMAIL",
  "FROM_EMAIL",
] as const;

let gmailTransporter: Transporter | undefined;
let verificationPromise: Promise<void> | undefined;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email error.";
}

function createGmailTransporter() {
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return gmailTransporter;
}

async function verifyGmailTransporter(transporter: Transporter) {
  if (!verificationPromise) {
    verificationPromise = transporter
      .verify()
      .then(() => undefined)
      .catch((error: unknown) => {
        verificationPromise = undefined;
        throw error;
      });
  }

  await verificationPromise;
}

export async function getVerifiedGmailEmailClient(): Promise<GmailEmailConfig> {
  const missing = requiredEmailEnv.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing email configuration: ${missing.join(", ")}.`,
    };
  }

  const transporter = createGmailTransporter();

  try {
    await verifyGmailTransporter(transporter);
  } catch (error) {
    return {
      ok: false,
      error: `Unable to connect to Gmail SMTP: ${getErrorMessage(error)}`,
    };
  }

  return {
    ok: true,
    client: {
      transporter,
      ceoEmail: process.env.CEO_EMAIL as string,
      fromEmail: process.env.FROM_EMAIL as string,
    },
  };
}

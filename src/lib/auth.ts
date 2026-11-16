import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email";

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;

/** The configured admin email becomes ADMIN only after it has been verified. */
function shouldBeAdmin(email: string, emailVerified: boolean) {
  return !!adminEmail && emailVerified && email.toLowerCase() === adminEmail;
}

export const auth = betterAuth({
  appName: "Generate Logic",
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),

  user: {
    // Our column names differ from Better Auth's defaults.
    fields: { name: "fullName", image: "profilePicture" },
    additionalFields: {
      // input: false → users can never set these themselves from the sign-up form.
      role: { type: "string", defaultValue: "STUDENT", input: false },
      accountStatus: { type: "string", defaultValue: "ACTIVE", input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // must click the email link before first sign-in
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, user.name, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, user.name, url);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      prompt: "select_account",
    },
  },

  account: {
    // Same email via Google and via password → one account (Google verifies the email).
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh expiry once a day while active
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/send-verification-email": { window: 300, max: 3 },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Google sign-ups arrive already verified.
        before: async (user) => {
          if (shouldBeAdmin(user.email, !!user.emailVerified)) {
            return { data: { ...user, role: "ADMIN" } };
          }
          return { data: user };
        },
      },
      update: {
        // Email/password admin becomes ADMIN right after clicking the verification link.
        after: async (user) => {
          const u = user as typeof user & { role?: string };
          if (u.role !== "ADMIN" && shouldBeAdmin(u.email, !!u.emailVerified)) {
            await db.user.update({ where: { id: u.id }, data: { role: "ADMIN" } });
          }
        },
      },
    },
    session: {
      create: {
        // Disabled accounts cannot sign in (security / admin requirement).
        before: async (session) => {
          const u = await db.user.findUnique({
            where: { id: session.userId },
            select: { accountStatus: true },
          });
          if (u?.accountStatus === "DISABLED") {
            throw new APIError("FORBIDDEN", { message: "This account has been disabled. Contact support." });
          }
          return { data: session };
        },
      },
    },
  },

  // Lets server actions set auth cookies. Must be the last plugin.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { envVars } from "../config/env";
import { prisma } from "./prisma";

const Role = {
    USER: "USER",
    ADMIN: "ADMIN",
    ORGANIZER: "ORGANIZER"
} as const;

const isProduction = envVars.NODE_ENV === "production";

const sessionExpiresIn = Number.isFinite(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN)
    ? envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN
    : 60 * 60 * 24;

const sessionUpdateAge = Number.isFinite(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE)
    ? envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE
    : 60 * 60 * 12;

export const auth = betterAuth({
    baseURL: isProduction ? envVars.CLIENT_URL : envVars.BETTER_AUTH_URL,
    basePath: "/api/v1/auth",
    secret: envVars.BETTER_AUTH_SECRET,
    account: {
        accountLinking: {
            trustedProviders: ["google"],
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url, token }, request) => {
            console.log(`[AUTH] Password reset link for ${user.email}: ${url}`);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            prompt: "select_account",
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: false,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log(`[AUTH] Email verification link for ${user.email}: ${url}`);
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.USER,
            },
        },
    },
    plugins: [
        bearer(),
    ],
    session: {
        expiresIn: sessionExpiresIn,
        updateAge: sessionUpdateAge,
        cookieCache: {
            enabled: true,
            maxAge: sessionExpiresIn,
        },
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:5000",
        ...(envVars.CLIENT_URL ? [envVars.CLIENT_URL, envVars.CLIENT_URL.replace(/\/$/, "")] : []),
        ...(envVars.BETTER_AUTH_URL ? [envVars.BETTER_AUTH_URL] : []),
    ],
    advanced: {
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            httpOnly: true,
            path: "/",
        },
        useSecureCookies: isProduction,
        crossSubDomainCookies: {
            enabled: false,
        },
    },
});

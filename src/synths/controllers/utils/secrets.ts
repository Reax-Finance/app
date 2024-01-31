require("dotenv").config();
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as string;
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN as string;
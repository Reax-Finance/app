require("dotenv").config();

export const SENTRY_DSN = process.env.SENTRY_DSN as string;
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as string;
export const NODE_ENV = process.env.NODE_ENV as string;
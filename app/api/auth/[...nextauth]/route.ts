import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import type { NextAuthOptions } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

// Helper function to convert Headers to plain object
function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

// Define the auth options
export const authOptions = ({ req }: { req: NextRequest }): NextAuthOptions => {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({
              req: { headers: headersToObject(req.headers) as any },
            }),
          });

          if (result.success) {
            console.log(result);
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e) {
          console.error("error is", e);
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req.nextUrl.searchParams.has("signin");

  if (isDefaultSigninPage) {
    providers.pop();
  }

  return {
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.address = token.sub;
        session.user.name = token.sub;
        session.user.image = "https://www.fillmurray.com/128/128";
        return session;
      },
    },
  };
};

// Define the handler for the POST method
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions({ req: req as any }));
}

// Define the handler for the GET method
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions({ req: req as any }));
}

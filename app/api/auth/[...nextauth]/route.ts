import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";

// Define the auth options
export const authOptions = ({ req }: { req: NextRequest }): NextAuthOptions => {
  const headerList = headers();
  const userAgent = headerList.get("user-agent");
  const acceptLanguage = headerList.get("accept-language");
  const host = headerList.get("host");
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
      async authorize(credentials: any) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({
              req: {
                headers: {
                  "user-agent": userAgent ?? "",
                  host: host ?? "",
                  accept: acceptLanguage ?? "",
                },
              },
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
    req.method === "GET" && req.nextUrl.searchParams.has("connect");

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

export async function POST(req: NextRequest) {
  return NextAuth(authOptions({ req }));
}

// Define the handler for the GET method
export async function GET(req: NextRequest) {
  return NextAuth(authOptions({ req }));
}

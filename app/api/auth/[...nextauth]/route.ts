import NextAuth, { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
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

  console.log("Request headers:", headerList);

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
          console.log("Received credentials:", credentials);
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          console.log("Going to verify SIWE message");

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

          console.log("SIWE Verification Result:", result);

          if (result.success) {
            console.log("Verification successful. Address:", siwe.address);
            return {
              id: siwe.address,
            };
          } else {
            console.log("Verification failed.");
            return null;
          }
        } catch (e) {
          console.error("Error in authorization:", e);
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req.nextUrl.searchParams.has("signin");

  if (isDefaultSigninPage) {
    console.log("On the default sign-in page, removing providers.");
    providers.pop();
  }

  return {
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async jwt({ token, user }) {
        console.log("JWT Callback. Token:", token, "User:", user);
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        console.log("Session Callback. Session:", session, "Token:", token);
        if (session.user) {
          session.user.name = token.sub || null;
          session.user.image = "https://www.fillmurray.com/128/128";
        }
        return session;
      },
    },
  };
};

export async function POST(req: NextRequest) {
  try {
    console.log("POST request received", req);
    const response = await NextAuth(authOptions({ req }));
    console.log("NextAuth POST Response:", response);
    return NextResponse.json({ data: response }, { status: 200 });
  } catch (e) {
    console.error("Error in POST:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("GET request received", req);
    const response = await NextAuth(authOptions({ req }));
    console.log("NextAuth GET Response:", response);
    return NextResponse.json({ data: response }, { status: 200 });
  } catch (e) {
    console.error("Error in GET:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

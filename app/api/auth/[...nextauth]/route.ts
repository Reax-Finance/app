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
            return {
              id: siwe.address,
            };
          } else {
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
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        if (session.user) {
          session.user.name = token.sub || null;
          session.user.image = "https://www.fillmurray.com/128/128"; // Example image
        }
        return session;
      },
    },
  };
};

export async function POST(req: NextRequest) {
  try {
    // const response = await NextAuth(authOptions({ req }));
    const response = await NextAuth(authOptions({ req }));
    if (!response) {
      return NextResponse.json(
        { error: "Bad Request. No response" },
        { status: 500 }
      );
    }
    // if (response.error) {
    //   console.error("Error in POST:", response.error);
    //   return NextResponse.json({ error: response.error }, { status: 500 });
    // }
    return NextResponse.json(response.data);
  } catch (e: any) {
    console.error("Error in POST:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const response = await NextAuth(authOptions({ req }));
    return NextResponse.json(response);
  } catch (e: any) {
    console.error("Error in GET:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import type { Metadata } from "next";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/globals.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import { Providers } from "./provider";
import ComponentLayout from "./ComponentLayout";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "REAX",
  description: "Welcome to REAX",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div>
          <ClerkProvider>
            <Providers>
              <ComponentLayout>{children}</ComponentLayout>
            </Providers>
          </ClerkProvider>
        </div>
      </body>
    </html>
  );
}

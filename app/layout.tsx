import type { Metadata } from "next";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/globals.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import { Providers } from "./provider";
import ComponentLayout from "./ComponentLayout";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "REAX",
  description: "Welcome to REAX",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <div>
          <Providers session={session}>
            <ComponentLayout>{children}</ComponentLayout>
          </Providers>
        </div>
      </body>
    </html>
  );
}

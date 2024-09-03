import type { Metadata } from "next";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/globals.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import { Providers } from "./provider";

export const metadata: Metadata = {
  title: "REAX",
  description: "Welcome to REAX",
};

export default function RootLayout({
  children,
  params: { session, ...params },
}: {
  children: React.ReactNode;
  params: { session: any };
}) {
  return (
    <html lang="en">
      <body>
        <div>
          <Providers params={params}>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

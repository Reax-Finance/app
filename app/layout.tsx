import type { Metadata } from "next";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/globals.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import { Providers } from "./provider";
import Index from "./page";

export const metadata: Metadata = {
  title: "REAX",
  description: "Welcome to REAX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

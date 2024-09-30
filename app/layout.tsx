import type { Metadata } from "next";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/globals.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import { Providers } from "./providers";
import ComponentLayout from "./ComponentLayout";

export const metadata: Metadata = {
  title: "REAX",
  description: "Welcome to REAX",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <div>
          <Providers>
            <ComponentLayout>{children}</ComponentLayout>
          </Providers>
        </div>
      </body>
    </html>
  );
}

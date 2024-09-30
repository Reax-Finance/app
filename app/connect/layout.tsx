"use client";

import ConnectLayout from "./components/ConnectLayout";

export default function ConnectPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConnectLayout>
        {children}
        </ConnectLayout>
      </body>
    </html>
  );
};

"use client";

import ConnectLayout from "./components/ConnectLayout";

export default function ConnectPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ConnectLayout>{children}</ConnectLayout>
    </div>
  );
}

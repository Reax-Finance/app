"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { ThirdwebProvider } from "thirdweb/react";
import { AppDataProvider } from "../components/context/AppDataProvider";
import { BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import { UserDataProvider } from "../components/context/UserDataProvider";
import { theme } from "../styles/theme";
import { useEffect, useState } from "react";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <ThirdwebProvider>
          <UserDataProvider>
            <AppDataProvider>
              <BalanceContextProvider>
                <PriceContextProvider>{children}</PriceContextProvider>
              </BalanceContextProvider>
            </AppDataProvider>
          </UserDataProvider>
        </ThirdwebProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles/theme";
import { ThirdwebProvider } from "thirdweb/react";
import { SessionProvider } from "next-auth/react";
import { UserDataProvider } from "../components/context/UserDataProvider";
import { AppDataProvider } from "../components/context/AppDataProvider";
import { BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <SessionProvider refetchInterval={0} session={session}>
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
    // </SessionProvider>
  );
}

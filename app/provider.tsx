"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles/theme";
import { ThirdwebProvider } from "thirdweb/react";
import { SessionProvider } from "next-auth/react";
import { UserDataProvider } from "../components/context/UserDataProvider";
import { AppDataProvider } from "../components/context/AppDataProvider";
import { BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <ThirdwebProvider>
        <SessionProvider refetchInterval={0}>
          <UserDataProvider>
            <AppDataProvider>
              <BalanceContextProvider>
                <PriceContextProvider>{children}</PriceContextProvider>
              </BalanceContextProvider>
            </AppDataProvider>
          </UserDataProvider>
        </SessionProvider>
      </ThirdwebProvider>
    </ChakraProvider>
  );
}

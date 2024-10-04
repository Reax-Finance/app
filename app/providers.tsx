"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ThirdwebProvider } from "thirdweb/react";
import { AppDataProvider } from "../components/context/AppDataProvider";
import { BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import { UserDataProvider } from "../components/context/UserDataProvider";
import { theme } from "../styles/theme";
import { CacheProvider } from "@chakra-ui/next-js";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <CacheProvider>
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
    </CacheProvider>
  );
}

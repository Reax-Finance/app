import "../styles/globals.css";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import Index from "./_index";

import { AppDataProvider } from "../components/context/AppDataProvider";
import { theme } from "../styles/theme";
import { supportedChains } from "../src/const";
import { BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import Script from "next/script";

import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { UserDataProvider } from "../components/context/UserDataProvider";
import {
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  safepalWallet,
  walletConnectWallet,
  coinbaseWallet,
  uniswapWallet,
  trustWallet,
  rabbyWallet,
} from "@rainbow-me/rainbowkit/wallets";

const config = getDefaultConfig({
  appName: "REAX",
  projectId: "d68eb355bf31e1395b01db4b9acac212",
  chains: supportedChains as any,
  ssr: true, // If your dApp uses server side rendering (SSR)
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        rabbyWallet,
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        uniswapWallet,
      ],
    },
    {
      groupName: "Hardware",
      wallets: [safeWallet, safepalWallet],
    },
    {
      groupName: "Mobile",
      wallets: [rainbowWallet, trustWallet],
    },
  ],
});

const queryClient = new QueryClient();

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to REAX",
});

export default function App({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />

      <Script id="google-analytics-script" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
          page_path: window.location.pathname,
          });
    `}
      </Script>

      <ChakraProvider theme={theme}>
        <SessionProvider refetchInterval={0} session={pageProps.session}>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitSiweNextAuthProvider
                getSiweMessageOptions={getSiweMessageOptions}
              >
                <RainbowKitProvider>
                  <UserDataProvider>
                    <AppDataProvider>
                      <BalanceContextProvider>
                        <PriceContextProvider>
                          <Index>
                            <Component {...pageProps} />
                          </Index>
                        </PriceContextProvider>
                      </BalanceContextProvider>
                    </AppDataProvider>
                  </UserDataProvider>
                </RainbowKitProvider>
              </RainbowKitSiweNextAuthProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </SessionProvider>
      </ChakraProvider>
    </>
  );
}

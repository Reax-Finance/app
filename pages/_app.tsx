import "../styles/globals.css";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
	Chain,
	RainbowKitProvider,
	connectorsForWallets,
	getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import Index from "./_index";

import { AppDataProvider } from "../components/context/AppDataProvider";
import { theme } from "../styles/theme";
import { supportedChains } from "../src/const";
import {
	BalanceContext,
	BalanceContextProvider,
} from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

const config = getDefaultConfig({
	appName: "My RainbowKit App",
	projectId: "YOUR_PROJECT_ID",
	chains: supportedChains as any,
	ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

import {
	GetSiweMessageOptions,
  } from '@rainbow-me/rainbowkit-siwe-next-auth';
  
  const getSiweMessageOptions: GetSiweMessageOptions = () => ({
	statement: 'Sign in to REAX',
  });

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
				<SessionProvider refetchInterval={0} session={pageProps.session}>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
					<RainbowKitProvider chains={supportedChains}>
						<AppDataProvider>
							<BalanceContextProvider>
								<PriceContextProvider>
									<Index>
										<Component {...pageProps} />
									</Index>
								</PriceContextProvider>
							</BalanceContextProvider>
						</AppDataProvider>
					</RainbowKitProvider>
					</RainbowKitSiweNextAuthProvider>
				</QueryClientProvider>
			</WagmiProvider>
				</SessionProvider>
		</ChakraProvider>
	);
}

export default MyApp;

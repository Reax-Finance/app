import "../styles/globals.css";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";

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
	BalanceContextProvider,
} from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
	appName: "Chainscore",
	projectId: "f9872886c0114c52fea9f273f6b2b2fb",
	chains: supportedChains as any,
	ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>
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
				</QueryClientProvider>
			</WagmiProvider>
		</ChakraProvider>
	);
}

export default MyApp;

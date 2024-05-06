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
import { PROJECT_ID, APP_NAME, defaultChain } from "../src/const";
import {
	BalanceContext,
	BalanceContextProvider,
} from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import "@rainbow-me/rainbowkit/styles.css";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { tenderlyMainnet } from "../src/chains";
import { sepolia } from "viem/chains";

const _chains = [];
_chains.push(defaultChain);

export const __chains: Chain[] = _chains;

const config = getDefaultConfig({
	appName: "My RainbowKit App",
	projectId: "YOUR_PROJECT_ID",
	chains: [defaultChain],
	ssr: true, // If your dApp uses server side rendering (SSR)
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

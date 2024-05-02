import "../styles/globals.css";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";

import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
	RainbowKitProvider,
	connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
	coinbaseWallet,
	metaMaskWallet,
	phantomWallet,
	rainbowWallet,
	trustWallet,
	walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
	configureChains,
	createClient,
	WagmiConfig,
	Chain,
	mainnet,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import Index from "./_index";

import { AppDataProvider } from "../components/context/AppDataProvider";
import { theme } from "../styles/theme";
import rainbowTheme from "../styles/rainbowTheme";
import { rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { PROJECT_ID, APP_NAME, defaultChain } from "../src/const";
import {
	BalanceContext,
	BalanceContextProvider,
} from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";

const _chains = [];
_chains.push(defaultChain);

export const __chains: Chain[] = _chains;

const { chains, provider } = configureChains(_chains, [
	publicProvider(),
]);

const connectors = connectorsForWallets([
	{
		groupName: "Recommended",
		wallets: [
			metaMaskWallet({ chains, projectId: PROJECT_ID }),
			walletConnectWallet({ projectId: PROJECT_ID, chains }),
		],
	},
	{
		groupName: "All Wallets",
		wallets: [
			rainbowWallet({ projectId: PROJECT_ID, chains }),
			trustWallet({ projectId: PROJECT_ID, chains }),
			phantomWallet({ chains }),
			coinbaseWallet({ appName: APP_NAME ?? "Synth", chains }),
			rabbyWallet({ chains }),
		],
	},
]);

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider
					chains={chains}
					modalSize="compact"
					theme={rainbowTheme}
				>
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
			</WagmiConfig>
		</ChakraProvider>
	);
}

export default MyApp;

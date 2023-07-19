import "../styles/globals.css";
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
import { configureChains, createClient, WagmiConfig, Chain, mainnet } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import Index from "./_index";

import { AppDataProvider } from "../components/context/AppDataProvider";
import { theme } from "../styles/theme";
import rainbowTheme from "../styles/rainbowTheme";
import { TokenContextProvider } from "../components/context/TokenContext";
import { rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { PROJECT_ID, APP_NAME } from '../src/const';
import { LendingDataProvider } from "../components/context/LendingDataProvider";
import { BalanceContext, BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import { SyntheticsPositionProvider } from "../components/context/SyntheticsPosition";
import { DEXDataProvider } from "../components/context/DexDataProvider";
import { mantleMainnet, mantleTestnet } from "../src/chains";

const _chains = []

if(process.env.NEXT_PUBLIC_NETWORK == 'testnet'){
	_chains.push({...mantleTestnet, iconUrl: '/icons/mantle-logo.png'});
} else {
	_chains.push({...mantleMainnet, iconUrl: '/icons/mantle-logo.png'});
}

export const __chains: Chain[] = _chains;

const { chains, provider } = configureChains(
	_chains,
	[
		alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY ?? 'demo' }),
		publicProvider(),
	]
);

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
			coinbaseWallet({ appName: APP_NAME, chains }),
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
				<RainbowKitProvider chains={chains} modalSize="compact" theme={rainbowTheme}>
					<AppDataProvider>
						<LendingDataProvider>
							<DEXDataProvider>
							<BalanceContextProvider>
								<PriceContextProvider>
									<TokenContextProvider>
									<SyntheticsPositionProvider>
										<Index>
											<Component {...pageProps} />
										</Index>
									</SyntheticsPositionProvider>
									</TokenContextProvider>
								</PriceContextProvider>
							</BalanceContextProvider>
							</DEXDataProvider>
						</LendingDataProvider>
					</AppDataProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}

export default MyApp;

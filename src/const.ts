import { ethers } from "ethers";
import { ChainID, chains } from "./chains";
export const ADDRESS_ZERO = ethers.constants.AddressZero;

export const mantleTestnet = {
    id: 5001,
    name: "Mantle Testnet",
    network: "mantle-testnet",
    nativeCurrency: {
        name: "BitDAO",
        symbol: "BIT",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://mantle-testnet.rpc.thirdweb.com"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://mantle-testnet.rpc.thirdweb.com"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer.testnet.mantle.xyz"
        }
    },
    testnet: true
};

export const defaultChain = mantleTestnet;

const _WETH_ADDRESS: any = {
	[mantleTestnet.id]: "0x55f317247632d42584848064A0cC0190fE1f6c58"
};

export const ESYX_PRICE = 0.005;

export const PROJECT_ID = '9635a0d9de95bced3f125a11f3ace2b5';
export const APP_NAME = 'Reax';

export const WETH_ADDRESS = (chainId: number) => _WETH_ADDRESS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _WETH_ADDRESS[mantleTestnet.id] : _WETH_ADDRESS[ChainID.ARB]);

export const PYTH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://xc-testnet.pyth.network' : 'https://xc-mainnet.pyth.network';
export const dollarFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	roundingMode: "floor",
} as any);

export const tokenFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 6,
	roundingMode: "floor",
} as any);

export const compactTokenFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 4,
	// compact
	notation: "compact",
	roundingMode: "floor",
} as any);

export const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 8,
	roundingMode: "floor",
} as any);

export const numOrZero = (num: number) => {
	if (num === undefined || num === null || isNaN(num)) return 0;
	return num;
};
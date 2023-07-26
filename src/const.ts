import { ethers } from "ethers";
import { mantleMainnet, mantleTestnet } from "./chains";
export const ADDRESS_ZERO = ethers.constants.AddressZero;

export const defaultChain = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? mantleTestnet: mantleMainnet;

export const NATIVE = "MNT";
export const W_NATIVE = "WMNT";

const _WETH_ADDRESS: any = {
	[mantleTestnet.id]: "0x5b156dca04f775046064032e1f5e45fd1fcca1e0".toLowerCase(),
    [mantleMainnet.id]: "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8".toLowerCase(),
};

export const PERP_CATEGORIES: any = [{
	name: 'crypto',
	factory: '0x6971d61a466AA48Bc6CaF96bA7cD5582AA4fE846',
	tokens: [
		'0x10736f742c810be853ff30d8a0a238112875f23b',
		'0x71020714cb8f12d20266371f741cd467f5a8f1eb',
		'0xc5463c3e462e730a7bf625569e96dd275d136d2d'
	]
}]

export const ESYX_PRICE = 0.0075;

export const PROJECT_ID = '9635a0d9de95bced3f125a11f3ace2b5';
export const APP_NAME = 'Reax';

export const WETH_ADDRESS = (chainId: number) => _WETH_ADDRESS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _WETH_ADDRESS[mantleTestnet.id] : _WETH_ADDRESS[mantleMainnet.id]);

export const PYTH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://xc-testnet.pyth.network' : 'https://xc-mainnet.pyth.network';
export const ROUTER_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://routes-api.reax.one' : 'https://mainnet.router-api.reax.one';
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
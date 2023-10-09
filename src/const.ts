import { ethers } from "ethers";
import { lineaMainnet, lineaTestnet, mantleMainnet, mantleTestnet } from "./chains";
import { mainnet } from "wagmi";
import { scrollTestnet } from "@wagmi/chains";
export const ADDRESS_ZERO = ethers.constants.AddressZero;

const NETWORKS: any = {
	[mantleMainnet.id]: mantleMainnet,
	[mantleTestnet.id]: mantleTestnet,
	[lineaMainnet.id]: lineaMainnet,
	[lineaTestnet.id]: lineaTestnet,
	[scrollTestnet.id]: scrollTestnet,
}

export const defaultChain = NETWORKS[process.env.NEXT_PUBLIC_CHAIN_ID!] ?? mainnet;

export const NATIVE = defaultChain.nativeCurrency.symbol;
export const W_NATIVE = `W${NATIVE}`;
export const ESYX_PRICE = 0.0075;
export const SUPPORTS_ROLLUP_GASFEES = false;

export const DOLLAR_PRECISION = 0.01;

const VERSIONS = {
	['0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9'.toLowerCase()]: '2'
}

export const EIP712_VERSION = (asset: string) => VERSIONS[asset.toLowerCase()] ?? '1';

const _WETH_ADDRESS: any = {
	[mantleTestnet.id]: "0x5b156dca04f775046064032e1f5e45fd1fcca1e0".toLowerCase(),
    [mantleMainnet.id]: "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8".toLowerCase(),
	[lineaTestnet.id]: "0x2c1b868d6596a18e32e61b901e4060c872647b6c".toLowerCase(),
};

const PERP_PAIR: any = {
	[mantleTestnet.id]: {
		'ETH-USD': {
			base: '0xc5463c3e462e730a7bf625569e96dd275d136d2d',   // cETH
			quote: '0x10736f742c810be853ff30d8a0a238112875f23b'  // cUSD
		},
		'BTC-USD': {
			base: '0x71020714cb8f12d20266371f741cd467f5a8f1eb',   // cBTC
			quote: '0x10736f742c810be853ff30d8a0a238112875f23b'  // cUSD
		},
		'ETH-BTC': {
			base: '0xc5463c3e462e730a7bf625569e96dd275d136d2d',   // cETH
			quote: '0x71020714cb8f12d20266371f741cd467f5a8f1eb'  // cBTC
		},
	},
	[mantleMainnet.id]: {
		'ETH-USD': {
			base: '0xc5463c3e462e730a7bf625569e96dd275d136d2d',   // cETH
			quote: '0x10736f742c810be853ff30d8a0a238112875f23b'   // cUSD
		},
		'BTC-USD': {
			base: '0x71020714cb8f12d20266371f741cd467f5a8f1eb',   // cBTC
			quote: '0x10736f742c810be853ff30d8a0a238112875f23b'   // cUSD
		},
		'ETH-BTC': {
			base: '0xc5463c3e462e730a7bf625569e96dd275d136d2d',   // cETH
			quote: '0x71020714cb8f12d20266371f741cd467f5a8f1eb'   // cBTC
		},
	}
};

export const PERP_PAIRS = PERP_PAIR[defaultChain.id];

const FACTORIES = {
	[mantleTestnet.id]: '0x2C7D30E5a371c642E67e9F0FbD6a0C6E049dCfB1',
	[mantleMainnet.id]: '0x19c789B36F430602Df34f8acE0D41391F302dE05',
};

export const FACTORY = FACTORIES[defaultChain.id];

const POOLS = {
	[mantleTestnet.id]: '0x2b254761b439d3A5300BE16D13aa5aaC07354D0f',
	[mantleMainnet.id]: '0x2b254761b439d3A5300BE16D13aa5aaC07354D0f',
};

export const POOL = POOLS[defaultChain.id];

export const POOL_COLORS: any = {
	0: 'linear(to-t, #002FFE, rgba(2,246,211))',
}

export const EPOCH_REWARDS: any = {
	1: 1_000_000,
	2: 250_000,
	3: 250_000,
	4: 100_000,
	5: 100_000,
	6: 100_000,
}

export const PROJECT_ID = '9635a0d9de95bced3f125a11f3ace2b5';
export const APP_NAME = process.env.NEXT_PUBLIC_TOKEN_SYMBOL;

export const WETH_ADDRESS = (chainId: number) => _WETH_ADDRESS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _WETH_ADDRESS[mantleTestnet.id] : _WETH_ADDRESS[mantleMainnet.id]);

export const PYTH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://xc-testnet.pyth.network' : 'https://xc-mainnet.pyth.network';
export const ROUTER_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://routes-api.reax.one' : 'https://mainnet.router-api.reax.one';
export const EPOCH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://rewards-testnet-api.reax.one' : 'https://rewards-mainnet-api.reax.one';

export const REPLACED_FEEDS: any = {
	"0x0e9ec6a3f2fba0a3df73db71c84d736b8fc1970577639c9456a2fee0c8f66d93": "0xd45b6d47bf43faa700e6f6fec4f8989fcc80eabb2f2eff862d7258d60026d1b5"
}

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
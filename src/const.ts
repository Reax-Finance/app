import { ethers } from "ethers";
import {
  lineaMainnet,
  lineaTestnet,
  mantleMainnet,
  mantleTestnet,
  tenderlyMainnet,
} from "./chains";
import Big from "big.js";
import {
  Chain,
  arbitrumGoerli,
  arbitrumSepolia,
  baseSepolia,
  cronosTestnet,
  mainnet,
  sepolia,
} from "viem/chains";
export const ADDRESS_ZERO = ethers.constants.AddressZero;

const _sepolia = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [
        "https://eth-sepolia.g.alchemy.com/v2/_yRldozKQjqTn6ifrZ6xqqbjk2JCdgM8",
      ],
    },
  },
};

export const ONE_ETH = Big(1e18);
const NETWORKS: any = {
  [mantleMainnet.id]: mantleMainnet,
  [mantleTestnet.id]: mantleTestnet,
  [lineaMainnet.id]: lineaMainnet,
  [lineaTestnet.id]: lineaTestnet,
  [sepolia.id]: _sepolia,
  [tenderlyMainnet.id]: tenderlyMainnet,
  [baseSepolia.id]: baseSepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [cronosTestnet.id]: cronosTestnet,
};

export const supportedChains: Chain[] =
  process.env.NEXT_PUBLIC_SUPPORTED_CHAINS?.split(",").map(
    (id: string) => NETWORKS[id]
  ) ?? [sepolia];
export const isSupportedChain = (chainId: number) => {
  return supportedChains.map((chain) => chain.id).includes(chainId);
};

export const ESYX_PRICE = 0.0075;
export const SUPPORTS_ROLLUP_GASFEES = false;

export const DOLLAR_PRECISION = 0.01;

const VERSIONS = {
  ["0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9".toLowerCase()]: "2",
};

export const EIP712_VERSION = (asset: string) =>
  VERSIONS[asset.toLowerCase()] ?? "1";

const _WETH_ADDRESS: any = {
  [mantleTestnet.id]:
    "0x5b156dca04f775046064032e1f5e45fd1fcca1e0".toLowerCase(),
  [mantleMainnet.id]:
    "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8".toLowerCase(),
  [lineaTestnet.id]: "0x2c1b868d6596a18e32e61b901e4060c872647b6c".toLowerCase(),
  [sepolia.id]: "0x3c348AdCFd2004984a427B21FA2e108DcdF656aC".toLowerCase(),
  [tenderlyMainnet.id]:
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase(),
  [cronosTestnet.id]:
    "0x644868D6f755eDad9FF803249ED91b55a1Bd95f1".toLowerCase(),
};

export const NATIVE_FAUCET_LINK: any = {
  [baseSepolia.id]: "https://www.alchemy.com/faucets/base-sepolia",
  [sepolia.id]: "https://www.alchemy.com/faucets/ethereum-sepolia",
  [arbitrumSepolia.id]: "https://www.alchemy.com/faucets/arbitrum-sepolia",
};

// Per block fetching frequency
export const DATA_FETCH_FREQUENCY: any = {
  [mantleTestnet.id]: 10000,
  [mantleMainnet.id]: 10000,
  [lineaTestnet.id]: 10000,
  [sepolia.id]: 10000,
};

export const PERP_CATEGORIES: any = {
  3: "C",
  4: "S",
};

export const POOL_COLORS: any = {
  0: "linear(to-t, #002FFE, rgba(2,246,211))",
};

export const EPOCH_REWARDS: any = {
  1: 1_000_000,
  2: 250_000,
  3: 250_000,
  4: 100_000,
  5: 100_000,
  6: 100_000,
};

export const PROJECT_ID = "9635a0d9de95bced3f125a11f3ace2b5";
export const APP_NAME = process.env.NEXT_PUBLIC_TOKEN_SYMBOL;

export const WETH_ADDRESS = (chainId: number) =>
  _WETH_ADDRESS[chainId] ??
  (process.env.NEXT_PUBLIC_NETWORK == "testnet"
    ? _WETH_ADDRESS[mantleTestnet.id]
    : _WETH_ADDRESS[mantleMainnet.id]);

export const PYTH_ENDPOINT = "https://hermes.pyth.network";
export const ROUTER_ENDPOINT =
  process.env.NEXT_PUBLIC_VERCEL_URL + "/api/router";
export const EPOCH_ENDPOINT =
  process.env.NEXT_PUBLIC_NETWORK == "testnet"
    ? "https://rewards-testnet-api.reax.one"
    : "https://rewards-mainnet-api.reax.one";
export const PRICE_ENDPOINT =
  process.env.NEXT_PUBLIC_NETWORK == "testnet"
    ? "https://prices.reax.one"
    : "http://prices.mainnet.reax.one";

export const REPLACED_FEEDS: any = {
  "0x0e9ec6a3f2fba0a3df73db71c84d736b8fc1970577639c9456a2fee0c8f66d93":
    "0xd45b6d47bf43faa700e6f6fec4f8989fcc80eabb2f2eff862d7258d60026d1b5",
};

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

export const USERNAME_XP_REWARD = 100;
export const TWITTER_FOLLOW_REWARD = 100;
export const JOIN_DISCORD_REWARD = 100;
export const JOINEE_XP_REWARD = 50;
export const REFERRER_XP_REWARD = 50;

export const TWITTER_SCOPE = [
  "users.read",
  "tweet.read",
  "follows.read",
  // "offline.access",
  "like.read",
  // "like.write",
  // "tweet.write",
  // "follows.write",
].join(" ");

export const X_ACCOUNT_AGE_MIN = 3 * 24 * 60 * 60 * 1000;
export const X_ACCOUNT_FOLLOWERS_MIN = 10;

export const breakpoints = {
  base: "0em", // 0px
  sm: "30em", // ~480px. em is a relative unit and is dependant on the font size.
  md: "48em", // ~768px
  lg: "62em", // ~992px
  xl: "80em", // ~1280px
  "2xl": "96em", // ~1536px
};

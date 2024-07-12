import { BigNumber } from "ethers";

export interface Account {
	userTotalBalanceUSD: BigNumber;
	userAdjustedBalanceUSD: BigNumber;
	userThresholdBalanceUSD: BigNumber;
	userDebtUSD: BigNumber;
	accountHealth: BigNumber;
}

export interface ReserveData {
	totalAssetsUSD: BigNumber;
	userTotalBalanceUSD: BigNumber;
	userAdjustedBalanceUSD: BigNumber;
	userThresholdBalanceUSD: BigNumber;
	vaults: VaultData[];
}

// export interface VaultData {
// 	asset: Asset;
// 	vaultToken: Asset;
// 	totalAssets: BigNumber;
// 	userBalance: BigNumber;
// 	config: ReserveConfig;
// }

export interface Asset {
	id: string;
	name: string;
	symbol: string;
	decimals: number;
	totalSupply: BigNumber;
	pythId: string;
	price: BigNumber;
	walletBalance: BigNumber;
	approvalToRouter: BigNumber;
}

export interface ReserveConfig {
	vault: string;
	baseLTV: BigNumber;
	liquidationThreshold: BigNumber;
	liquidationBonus: BigNumber;
	liquidationFee: BigNumber;
	maxDeposits: BigNumber;
	active: boolean;
}

export interface LiquidityData {
	totalDebtUSD: BigNumber;
	userTotalDebtUSD: BigNumber;
	lpToken: Asset;
	debtToken: Asset;
	synths: Asset[];
}

// ------------------------------

export interface UIData {
	synths: SynthData[];
	router: string;
	blockNumber: number;
}

export interface SynthData {
	synth: Asset;
	market: MarketData;
}

export interface MarketData {
	exists: boolean;
	totalAssetsUSD: BigNumber;
	totalDebtUSD: BigNumber;
	userTotalBalanceUSD: BigNumber;
	userAdjustedBalanceUSD: BigNumber;
	userThresholdBalanceUSD: BigNumber;
	userDebtUSD: BigNumber;
	accountHealth: BigNumber;
	interestRate: BigNumber;
	debtToken: Asset;
	vaults: VaultData[];
}

export interface VaultData {
	asset: Asset;
	vaultToken: Asset;
	ratio: BigNumber;
	config: ReserveConfig;
}
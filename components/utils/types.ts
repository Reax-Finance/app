import { BigNumber } from "ethers";

export interface Account {
	healthFactor: string;
	availableToMintUSD: string;
	userTotalBalanceUSD: string;
	userAdjustedBalanceUSD: string;
	userThresholdBalanceUSD: string;
	userTotalDebtUSD: string;
}

export interface ReserveData {
	totalAssetsUSD: BigNumber;
	userTotalBalanceUSD: BigNumber;
	userAdjustedBalanceUSD: BigNumber;
	userThresholdBalanceUSD: BigNumber;
	vaults: VaultData[];
}

export interface VaultData {
	asset: Asset;
	vaultToken: Asset;
	totalAssets: BigNumber;
	userBalance: BigNumber;
	config: ReserveConfig;
}

export interface Asset {
	id: string;
	name: string;
	symbol: string;
	decimals: number;
	totalSupply: BigNumber;
	pythId: string;
	price: BigNumber;
	balance: BigNumber;
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

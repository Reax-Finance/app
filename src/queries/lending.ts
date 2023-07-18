import { mantleMainnet, mantleTestnet } from "../chains"

const _LendingEndpoints: any = {
	[mantleTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING_URL_5001,
	[mantleMainnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING_URL_5000,
}

const _LendingEndpoints2: any = {
	[mantleTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING2_URL_5001,
	[mantleMainnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING2_URL_5000,
}

export const LendingEndpoint = (chainId: number) => _LendingEndpoints[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _LendingEndpoints[mantleTestnet.id] : _LendingEndpoints[mantleMainnet.id]); 

export const LendingEndpoint2 = (chainId: number) => _LendingEndpoints2[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _LendingEndpoints2[mantleTestnet.id] : _LendingEndpoints2[mantleMainnet.id]);

export const query_lending = (address: string) => (
	`{
		lendingProtocols {
		  id
		  name
		  slug
		  _priceOracle
		  _lendingPoolAddress
		  totalDepositBalanceUSD
		  totalBorrowBalanceUSD
		  _rewardsController
		  _wrapper
		}
		markets (orderBy: totalValueLockedUSD, orderDirection: desc) {
		  protocol {
			_lendingPoolAddress
			_priceOracle
		  }
		  id
		  name
		  isActive
		  canUseAsCollateral
		  canBorrowFrom
		  eModeCategory {
			id
			label
			ltv
			liquidationThreshold
		  }
		  _vToken {
			id
			decimals
		  }
		  _sToken {
			id
			decimals
		  }
		  inputTokenPriceUSD
		  inputToken {
			id
			name
			symbol
			decimals
			isPermit
		  }
		  outputToken {
			id
			name
			symbol
			decimals
			isPermit
		  }
		  totalValueLockedUSD
		  totalDepositBalanceUSD
		  totalBorrowBalanceUSD
		  maximumLTV
		  liquidationThreshold
		  rates {
			side
			rate
			type
		  }
		  inputTokenPriceUSD
		  rewardTokens {
			id
			_distributionEnd
			token{
			  id
			  name
			  symbol
			}
		  }
		  rewardTokenEmissionsAmount
		  createdTimestamp
		}
		account(id: "${address}") {
			_enabledCollaterals {
				id
			}
		}
		_meta {
		  hasIndexingErrors
		  deployment
		  block {
			number
		  }
		}
	  }`
)
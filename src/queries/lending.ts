import { lineaTestnet, mantleMainnet, mantleTestnet } from "../chains"
import { defaultChain } from "../const";

const _LendingEndpoints: any = {
	[mantleTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING_URL_5001,
	[mantleMainnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING_URL_5000,
	[lineaTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING_URL_59140,
}

const _LendingEndpoints2: any = {
	[mantleTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING2_URL_5001,
	[mantleMainnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING2_URL_5000,
	// [lineaTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_LENDING2_URL_59140,
}

export const LendingEndpoint = (chainId: number) => _LendingEndpoints[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _LendingEndpoints[mantleTestnet.id] : _LendingEndpoints[mantleMainnet.id]); 

export const LendingEndpoint2 = (chainId: number) => _LendingEndpoints2[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _LendingEndpoints2[mantleTestnet.id] : _LendingEndpoints2[mantleMainnet.id]);

export const LendingEndpoints = (chainId: number) => {
	let endpoints = [];	
	if(_LendingEndpoints[chainId]) endpoints.push(_LendingEndpoints[chainId]);
	if(_LendingEndpoints2[chainId]) endpoints.push(_LendingEndpoints2[chainId]);

	if(endpoints.length == 0){
		return [LendingEndpoint(defaultChain.id)];
	}

	return endpoints;
}

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
		markets (orderBy: totalValueLockedUSD, orderDirection: desc, where: {isActive: true}) {
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
			eModeCategory {
				id
			}
		}
		emodeCategories {
			id
			label
			ltv
			liquidationThreshold
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
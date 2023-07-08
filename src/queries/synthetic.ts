import { mantleTestnet } from "../const";

const _Endpoints: any = {
	[mantleTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_URL_5001,
}

export const Endpoints = (chainId: number) => _Endpoints[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _Endpoints[mantleTestnet.id] : _Endpoints[mantleTestnet.id]); 

export const query = (address: string) => (
	`{
		pools (orderBy: symbol) {
		  id
		  name
		  symbol
		  totalSupply
		  totalDebtUSD
		  oracle
		  paused
		  issuerAlloc
		  rewardTokens {
			id
		  }
		  rewardSpeeds
		  synths {
			token {
			  id
			  name
			  symbol
			  decimals
			  isPermit
			}
			cumulativeMinted
			cumulativeBurned
			priceUSD
			mintFee
			burnFee
			totalSupply
			synthDayData(first:7, orderBy: dayId, orderDirection: desc){
				dayId
				dailyMinted
				dailyBurned
			}
			feed
			fallbackFeed
		  }
		  collaterals {
			token {
			  id
			  name
			  symbol
			  decimals
			  isPermit
			}
			priceUSD
			cap
			baseLTV
			liqThreshold
			totalDeposits
			feed
			fallbackFeed
		  }
		}
		accounts(where: {id: "${address}"}){
		  id
		  createdAt
		  referredBy
		  accountDayData(orderBy: dayId, orderDirection: desc){
			dayId
			dailySynthsMinted{
				synth{
					id
					pool{
						id
					}
				}
				amount
			}
		  }
		  positions{
			pool{
			  id
			}
			balance
			collateralBalances{
			  balance
			  collateral{
				token{
					id
				}
			  }
			}
		  }
		}
	  }`
)

export const query_leaderboard = `
	{
		accounts{
			id
			accountDayData(orderBy: dayId, orderDirection: desc, first: 200){
				dayId
				dailySynthsMinted{
					synth{
						id
						pool{
							id
						}
					}
					amount
				}
			}
		}
	}
`;

export const query_referrals = (address: string) => (`
	{
		accounts(where: {referredBy: "${address}"}){
			id
			accountDayData(first:1, orderBy: dayId, orderDirection: desc){
				dayId
				dailySynthsMinted{
					synth{
						id
						pool{
							id
						}
					}
					amount
				}
			}
		}
	}
`);
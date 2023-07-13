import { mantleTestnet } from "../const";

const DEX_ENDPOINTS: any = {
    [mantleTestnet.id]: 'https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/reax-swaps'
}

const MINICHEF_ENDPOINTS: any = {
    [mantleTestnet.id]: 'https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/minichef'
}

export const DEX_ENDPOINT = (chainId: number) => DEX_ENDPOINTS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? DEX_ENDPOINTS[mantleTestnet.id] : DEX_ENDPOINTS[mantleTestnet.id]);
export const MINICHEF_ENDPOINT = (chainId: number) => MINICHEF_ENDPOINTS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? MINICHEF_ENDPOINTS[mantleTestnet.id] : MINICHEF_ENDPOINTS[mantleTestnet.id])

export const query_dex = (address: string) => (`
{
    balancers{
        address
        pools (where: {isPaused: false}) {
            id
            address
            poolType
            factory
            name
            symbol
            swapFee
            swapEnabled
            isPaused
            totalWeight
            totalLiquidity
            totalSwapVolume
            totalSwapFee
            tokens(orderBy: index) {
                token {
                    name
                    symbol
                    id
                    decimals
                    isPermit
                }
                balance
                weight
                index
            }
            tokensList
            totalShares
            snapshots(first:7){
              swapVolume
              swapFees
              timestamp
            }
        }
    }
  }
`);


export const query_minichef = (address: string) => (`
{
    miniChefs{
        id
        totalAllocPoint
        sushiPerSecond
        pools{
            id
            pair
            allocPoint
            accSushiPerShare
            slpBalance
        }
    }
    users(where: {address: "${address.toLowerCase()}"}){
        id
        address
        amount
        rewardDebt
        sushiHarvested
    }
}
`)
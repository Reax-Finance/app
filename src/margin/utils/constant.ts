export const PRICES_URL: Record<string, string> = {
  5000: 'http://prices.mainnet.reax.one/get_all_prices',
  5001: 'https://prices.reax.one/get_all_prices'
}

export const CONSTANT_PRICES: Record<string, [string, string, number]> = {
  '0x62959ad021402f48d0d8067bc5c4c03f63fceaa4': ['1', 'cUSD', 18],
  '0x10736f742c810be853ff30d8a0a238112875f23b': ['1', 'cUSD', 18],
  '0x1561ccba861ee39552da5d703b629b1b23ee1899': ['1', 'sUSD', 18]
}

export const LENDING_SUBGRAPH: Record<string, Record<string, string>> = {
  5000: {
    reaxLending: 'https://graph.reax.one/subgraphs/name/reax/reax-lending',
    reaxCryptoLending: 'https://graph.reax.one/subgraphs/name/reax/crypto-lending'
  },
  5001: {
    '0x2b254761b439d3a5300be16d13aa5aac07354d0f': 'https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/synthex-mantleLendingTestnet',
    reaxLending: 'https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/synthex-mantleLendingTestnet2'
  }
}

export const MULTICALL_ADDRESS: Record<string, string> = {
  5000: '0x679ad1C5943BA35475a85C1BaCF1Fb3D59E1927e',
  5001: '0x57EDC329875967fC3D8081C3A893854f5B91376A'
}

export const RPC: Record<string, string> = {
  5000: 'https://rpc.mantle.xyz/',
  5001: 'https://rpc.testnet.mantle.xyz/'
}

export const PERPS_SUBGRAPH: Record<string, string> = {
  5001: 'https://graph.testnet.mantle.xyz/subgraphs/name/reax/perps'
}

export const LENDING_POOL: Record<string, string[]> = {
  5001: ['0x2b254761b439d3a5300be16d13aa5aac07354d0f']
}

export const TOKEN_LIST: Record<string, string[]> = {
  '0x2b254761b439d3a5300be16d13aa5aac07354d0f': ['cETH', 'cBTC', 'cUSD']
}

export const PAIRS: Record<string, string[]> = {
  '0x2b254761b439d3a5300be16d13aa5aac07354d0f': ['cETH-cUSD', 'cBTC-cUSD', 'cETH-cBTC']
}


export const PERP_POSITION_FACTORY: Record<string, string> = {
  '0x2b254761b439d3a5300be16d13aa5aac07354d0f': '0xd78e7bDc5Be5148FCca6Bc311a65deA5e5B95AAD'
}
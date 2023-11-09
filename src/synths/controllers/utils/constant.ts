
export const MULTICALL_ADDRESS: { [key: string]: string } = {

  "5000": "0x679ad1C5943BA35475a85C1BaCF1Fb3D59E1927e",
  "5001": "0x57EDC329875967fC3D8081C3A893854f5B91376A"
}


export const RPC: { [key: string]: string } = {
  "5000": "https://rpc.mantle.xyz/",
  "5001": "https://rpc.testnet.mantle.xyz/"
}


export const CONSTANT_PRICES: { [key: string]: [string, string, number] } = {
  "0x62959ad021402f48d0d8067bc5c4c03f63fceaa4": ["1", "cUSD", 18],
  "0x10736f742c810be853ff30d8a0a238112875f23b": ["1", "cUSD", 18],
  "0x1561ccba861ee39552da5d703b629b1b23ee1899": ["1", "sUSD", 18],

}

export const ROUTER_ADDRESS: { [key: string]: string } = {
  "5000": "0xe1FFC470a1dAFDF9aFB6627Cc3816F35fE09D09E",
  "5001": "0xCE0dC34Db439D21a1400e37aaAFCd6e1F1e6D43e"
}

export const SYNTH_SUBGRAPH: { [key: string]: string } = {
  "5000": "https://graph.reax.one/subgraphs/name/reax/synths-mainnet1",
  "5001": "https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/synthex-mantleTestnet2"
}


export const PRICES_URL: { [key: string]: string } = {
  "5000": "http://prices.mainnet.reax.one/get_all_prices",
  "5001": "https://prices.reax.one/get_all_prices"
}

export const SYNTH_IN: { [key: string]: string } = {
  "5000": "0x62959ad021402f48d0d8067bc5c4c03f63fceaa4",
  "5001": "0x10736f742c810be853ff30d8a0a238112875f23b"
}

export const ROUTE_PROPOSER_URL: { [key: string]: string } = {
  "5000": "https://mainnet.router-api.reax.one/getPath",
  "5001": "https://routes-api.reax.one/getPath"
}

export const PYTH_ENDPOINT: { [key: string]: string } = {
  "testnet": "https://xc-testnet.pyth.network",
  "mainnet": 'https://xc-mainnet.pyth.network'
}

export const LIQUIDATION_ADDRESS: Record<string, string> = {
  5001: "0xa8A2F650AA2c33e22244a612ad9932a92dcF796D"
}
export const PYTH_FEED: { [key: string]: string[] } = {
  "testnet": [
      "0xbfaf7739cb6fe3e1c57a0ac08e1d931e9e6062d476fa57804e165ab572b5b621",
      "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
      "0x36032e522b810babd8e3148e9f0d588af9e95e93b97ffb58566b837fdbd31f7f",
      "0x31775e1d6897129e8a84eeba975778fb50015b88039e9bc140bbd839694ac0ae",
      "0xecf553770d9b10965f8fb64771e93f5690a182edc32be4a3236e0caaa6e0581a",
      "0x73dc009953c83c944690037ea477df627657f45c14f16ad3a61089c5a3f9f4f2",
      "0x997e0bf451cb36b4aea096e6b5c254d700922211dd933d9d17c467f0d6f34321",
      "0xfe650f0367d4a7ef9815a593ea15d36593f0643aaaf0149bb04be67ab851decd",
      "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
      "0xd45b6d47bf43faa700e6f6fec4f8989fcc80eabb2f2eff862d7258d60026d1b5",
      "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
      "0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588",
  ],
  "mainnet": [
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      "0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b",
      "0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54",
      "0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d",
      "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
      "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8",
      "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f",
      "0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c",
      "0x4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585",
  ]

}
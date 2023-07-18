
export const mantleTestnet = {
    id: 5001,
    name: "Mantle Testnet",
    network: "mantle-testnet",
    nativeCurrency: {
        name: "Mantle",
        symbol: "MNT",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://mantle-testnet.rpc.thirdweb.com", "https://rpc.testnet.mantle.xyz"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://rpc.testnet.mantle.xyz", "https://mantle-testnet.rpc.thirdweb.com"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer.testnet.mantle.xyz"
        }
    },
    testnet: true
};

export const mantleMainnet = {
    id: 5000,
    name: "Mantle",
    network: "mantle",
    nativeCurrency: {
        name: "Mantle",
        symbol: "MNT",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.mantle.xyz"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://rpc.mantle.xyz"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer.mantle.xyz"
        }
    },
    testnet: false
};
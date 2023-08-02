import { mantleMainnet, mantleTestnet } from "../chains";

const POSITIONS_ENDPOINTS: any = {
    [mantleTestnet.id]: process.env.NEXT_PUBLIC_GRAPH_PERP_POSITIONS_5001,
    [mantleMainnet.id]: process.env.NEXT_PUBLIC_GRAPH_PERP_POSITIONS_5000,
}

export const POSITIONS_ENDPOINT = (chainId: number) => POSITIONS_ENDPOINTS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? POSITIONS_ENDPOINTS[mantleTestnet.id] : POSITIONS_ENDPOINTS[mantleMainnet.id]);

export const query_positions = (address: string) => (`
{
    user(id: "${address}"){
        id
        positions{
            id
            factory{
                id
                lendingPool
                dataProvider
            }
        }
    }
}
`);


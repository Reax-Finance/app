import axios from "axios"
import { promises as fs } from "fs";
import path from "path";
import { Endpoints } from "../../../../queries/synthetic";
import { defaultChain } from "../../../../const";

require("dotenv").config();
export async function setSynthsConfig() {
    try {
        let config = JSON.parse((await (fs.readFile(path.join(__filename + "/../../../../../src/router/route-proposer-handler/handler/synth-pool/synth-pool-config.json")))).toString());
        config = {};
        let data = await axios({

            method: "post",
            url: Endpoints(defaultChain.id),
            data:
            {
                query:
                    `{
                    pools{
                        id
                        name
                        symbol
                        oracle
                        feeToken
                        synths{
                            burnFee
                            mintFee
                            isActive
                            token{
                                id
                                symbol
                                decimals 
                            }
                        }
                   }
                }`
            }
        });

        const pools = data.data.data.pools;

        for (let pool of pools) {
            config[pool.id] = {
                name: pool.name,
                symbol: pool.symbol,
                feeToken: pool.feeToken,
                oracle: pool.oracle,
                synths: {}
            };

            for (let synth of pool.synths) {
                if (!synth.isActive) continue;
                config[pool.id]["synths"][synth.token.id] = {
                    symbol: synth.token.symbol,
                    burnFee: synth.burnFee,
                    mintFee: synth.mintFee,
                    priceUSD: "0"
                };

            }
        }
        await fs.writeFile(path.join(__filename + "/../../../../../src/router/route-proposer-handler/handler/synth-pool/synth-pool-config.json"), JSON.stringify(config));

    }
    catch (error) {
        console.log(`Error @ setSynthsConfig`, error)
    }
}


export async function fetchSynthPoolData() {
    await setSynthsConfig();
    setInterval(() => {
        setSynthsConfig()
    }, 1000 * 60 * 60)
}
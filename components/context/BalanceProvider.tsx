import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { getABI, getAddress, getContract } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ADDRESS_ZERO, WETH_ADDRESS, defaultChain } from "../../src/const";
import { useLendingData } from "./LendingDataProvider";
import { useAppData } from "./AppDataProvider";
import { Status } from "../utils/status";

const BalanceContext = React.createContext<BalanceValue>({} as BalanceValue);

interface BalanceValue {
    walletBalances: any;
    allowances: any;
    nonces: any;
    totalSupplies: any;
    status: Status;
    updateBalance: (asset: string, value: string, isMinus?: boolean) => void;
    addAllowance: (asset: string, spender: string, value: string) => void;
    addNonce: (asset: string, value: string) => void;
}

function BalanceContextProvider({ children }: any) {
    const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [walletBalances, setWalletBalances] = React.useState<any>({});
    const [allowances, setAllowances] = React.useState<any>({});
    const [nonces, setNonces] = React.useState<any>({});
    const [totalSupplies, setTotalSupplies] = React.useState<any>({});
    // const [lendingBalances, setLendingBalances] = React.useState<any>({});

	const [refresh, setRefresh] = React.useState(0);
	const { chain } = useNetwork();

    const { markets } = useLendingData();
    const { pools } = useAppData();
    const { address } = useAccount();

    React.useEffect(() => {
        if(status == Status.NOT_FETCHING && pools.length > 0 && markets.length > 0 && address) {
            fetchBalances(address);
            setInterval(() => fetchBalances(address), 5000);
        }
    }, [markets, pools, address, status])

	const fetchBalances = async (address: string) => {
        setStatus(Status.FETCHING);
        const chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) return Promise.resolve(1);
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
        return new Promise(async (resolve, reject) => {
            let calls: any[] = [];
			const itf = new ethers.utils.Interface(getABI("MockToken", chainId));
            for (let i = 0; i < pools.length; i++) {
				for(let j = 0; j < pools[i].collaterals.length; j++) {
					const collateral = pools[i].collaterals[j];
					if(collateral.token.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
						calls.push([
							helper.address,
							helper.interface.encodeFunctionData("getEthBalance", [
								address,
							]),
						]);
					} 
					calls.push([
						collateral.token.id,
						itf.encodeFunctionData("balanceOf", [address]),
					]);
					calls.push([
						collateral.token.id,
						itf.encodeFunctionData("allowance", [
							address,
							pools[i].id,
						]),
					]);
					if(collateral.token.isPermit){
                        calls.push([
                            collateral.token.id,
                            itf.encodeFunctionData("nonces", [address]),
                        ])
                    }
				}
				for(let j = 0; j < pools[i].synths.length; j++) {
					const synth = pools[i].synths[j];
					calls.push([
						synth.token.id,
						itf.encodeFunctionData("balanceOf", [address]),
					]);
				}
			}
            const wrapperAddress = getAddress("WrappedTokenGateway", chainId);
            const vTokenInterface = new ethers.utils.Interface(getABI("VToken", chainId));

            for(let i = 0; i < markets.length; i++) {
                const market = markets[i];
                calls.push([
                    market.inputToken.id,
                    itf.encodeFunctionData("balanceOf", [address]),
                ]);
                
                // allowance to market
                calls.push([
                    market.inputToken.id,
                    itf.encodeFunctionData("allowance", [
                        address,
                        market.protocol._lendingPoolAddress
                    ]),
                ]);
                if(market.inputToken.isPermit){
                    calls.push([
                        market.inputToken.id,
                        itf.encodeFunctionData("nonces", [address]),
                    ])
                }
                calls.push([
                    market.outputToken.id,
                    itf.encodeFunctionData("nonces", [address]),
                ]);
                // if aweth, check allowance for wrapper
                if(market.inputToken.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
                    calls.push([
                        market.inputToken.id,
                        itf.encodeFunctionData("allowance", [
                            address,
                            wrapperAddress
                        ]),
                    ]);
                    calls.push([
                        market._vToken.id,
                        vTokenInterface.encodeFunctionData("borrowAllowance", [address, wrapperAddress]),
                    ])
                };

                calls.push([
                    market.outputToken.id,
                    itf.encodeFunctionData("balanceOf", [address]),
                ]);
                // debt
                calls.push([
                    market._vToken.id,
                    itf.encodeFunctionData("balanceOf", [address]),
                ]);
                calls.push([
                    market._sToken.id,
                    itf.encodeFunctionData("balanceOf", [address]),
                ]);

                // total supply
                calls.push([
                    market.outputToken.id,
                    itf.encodeFunctionData("totalSupply", []),
                ]);
                calls.push([
                    market._vToken.id,
                    itf.encodeFunctionData("totalSupply", []),
                ]);
                calls.push([
                    market._sToken.id,
                    itf.encodeFunctionData("totalSupply", []),
                ]);
            }
            helper.callStatic.aggregate(calls).then(async (res: any) => {
                const newBalances: any = {};
                const newAllowances: any = {};
                const newNonces: any = {};
                const newTotalSupplies: any = {};
                res = res.returnData;
                let index = 0;
                for (let i = 0; i < pools.length; i++) {
                    for(let j = 0; j < pools[i].collaterals.length; j++) {
                        const collateral = pools[i].collaterals[j];
                        if(collateral.token.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
                            newBalances[ADDRESS_ZERO] = BigNumber.from(res[index]).toString();
                            index++;
                        }
                        newBalances[collateral.token.id] = BigNumber.from(res[index]).toString();
                        index++;
                        if(!newAllowances[collateral.token.id]) newAllowances[collateral.token.id] = {};
                        newAllowances[collateral.token.id][pools[i].id] = BigNumber.from(res[index]).toString();
                        index++;
                        if(collateral.token.isPermit){
                            newNonces[collateral.token.id] = BigNumber.from(res[index]).toString();
                            index++;
                        }
                    }
                    for(let j = 0; j < pools[i].synths.length; j++) {
                        const synth = pools[i].synths[j];
                        newBalances[synth.token.id] = BigNumber.from(res[index]).toString();
                        index++;
                    }
                }
                for(let i = 0; i < markets.length; i++) {
                    const market = markets[i];
                    newBalances[market.inputToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    if(!newAllowances[market.inputToken.id]) newAllowances[market.inputToken.id] = {};
                    newAllowances[market.inputToken.id][market.protocol._lendingPoolAddress] = BigNumber.from(res[index]).toString();
                    index++;
                    if(market.inputToken.isPermit){
                        newNonces[market.inputToken.id] = BigNumber.from(res[index]).toString();
                        index++;
                    }
                    newNonces[market.outputToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    if(market.inputToken.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
                        newAllowances[market.inputToken.id][wrapperAddress] = BigNumber.from(res[index]).toString();
                        index++;
                        if(!newAllowances[market._vToken.id]) newAllowances[market._vToken.id] = {};
                        newAllowances[market._vToken.id][wrapperAddress] = BigNumber.from(res[index]).toString();
                        index++;
                    }
                    newBalances[market.outputToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    newBalances[market._vToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    newBalances[market._sToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    newTotalSupplies[market.outputToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    newTotalSupplies[market._vToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                    newTotalSupplies[market._sToken.id] = BigNumber.from(res[index]).toString();
                    index++;
                }
                setStatus(Status.SUCCESS);
                setWalletBalances(newBalances);
                setAllowances(newAllowances);
                setNonces(newNonces);
                setTotalSupplies(newTotalSupplies);
            })
            .catch((err: any) => {
                setStatus(Status.ERROR);
                reject(err);
            })
        });
	};

    const updateBalance = async (asset: string, value: string, isMinus: boolean = false) => {
        const newBalances = {...walletBalances};
        if (isMinus) {
            newBalances[asset] = Big(walletBalances[asset]).minus(value).toString();
        } else {
            newBalances[asset] = Big(walletBalances[asset]).plus(value).toString();
        }
        setWalletBalances(newBalances);
    }

    const addAllowance = async (asset: string, spender: string, value: string) => {
        const newAllowances = {...allowances};
        // add allowance value
        if(!newAllowances[asset]) newAllowances[asset] = {};
        newAllowances[asset][spender] = Big(allowances[asset][spender] ?? 0).plus(value).toString();
        setAllowances(newAllowances);
    }

    const addNonce = async (asset: string, value: string) => {
        const newNonces = {...nonces};
        // add nonce value
        newNonces[asset] = Big(nonces[asset]).plus(value).toString();
        setNonces(newNonces);
    }

    const value: BalanceValue = {
		walletBalances,
        allowances,
        nonces,
        status,
        updateBalance,
        addAllowance,
        addNonce,
        totalSupplies,
	};

	return (
		<BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
	);
}

const useBalanceData = () => {
    const context = React.useContext(BalanceContext);
    if (context === undefined) {
        throw new Error("useBalanceData must be used within a BalanceProvider");
    }
    return context;
}


export { BalanceContextProvider, BalanceContext, useBalanceData };

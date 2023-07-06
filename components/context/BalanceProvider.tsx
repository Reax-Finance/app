import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { getABI, getAddress, getContract } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ADDRESS_ZERO, WETH_ADDRESS, defaultChain } from "../../src/const";
import { useLendingData } from "./LendingDataProvider";
import { useAppData } from "./AppDataProvider";
import { Status } from "../utils/status";
import { useDexData } from "./DexDataProvider";

const BalanceContext = React.createContext<BalanceValue>({} as BalanceValue);

interface BalanceValue {
    walletBalances: any;
    allowances: any;
    nonces: any;
    tokens: any[];
    status: Status;
    updateBalance: (asset: string, value: string, isMinus?: boolean) => void;
    addAllowance: (asset: string, spender: string, value: string) => void;
    addNonce: (asset: string, value: string) => void;
    updateFromTx: (tx: any) => void;
}

function BalanceContextProvider({ children }: any) {
    const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [walletBalances, setWalletBalances] = React.useState<any>({});
    const [allowances, setAllowances] = React.useState<any>({});
    const [nonces, setNonces] = React.useState<any>({});
    const [tokens, setTokens] = React.useState<any>([]);
	const { chain } = useNetwork();

    const { markets } = useLendingData();
    const { pools } = useAppData();
    const { address } = useAccount();
    const { pools: dexPools, vault } = useDexData();

    React.useEffect(() => {
        if(status == Status.NOT_FETCHING && pools.length > 0 && markets.length > 0 && dexPools.length > 0 ) {
            fetchBalances(address);
        }
    }, [markets.length, pools.length, dexPools.length, address, status])

	const fetchBalances = async (_address?: string) => {
        console.log("Fetching balances for:", _address);
        setStatus(Status.FETCHING);
        const chainId = chain?.id ?? defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
        const routerAddress = getAddress("Router", chainId);
        const wrapperAddress = getAddress("WrappedTokenGateway", chainId);
        const vTokenInterface = new ethers.utils.Interface(getABI("VToken", chainId));
        const itf = new ethers.utils.Interface(getABI("MockToken", chainId));
        
        // Get tokens: synths, synth collaterals, dex tokens, lending input tokens
        let _tokens: any[] = [];
        for(let i = 0; i < pools.length; i++) {
            for(let j = 0; j < pools[i].collaterals.length; j++) {
                const collateral = pools[i].collaterals[j];
                if(!_tokens.find((token: any) => token.id == collateral.token.id)) {
                    _tokens.push(collateral.token);
                }
            }
            for(let j = 0; j < pools[i].synths.length; j++) {
                const synth = pools[i].synths[j];
                if(!_tokens.find((token: any) => token.id == synth.token.id)) {
                    _tokens.push(synth.token);
                }
            }
        }
        for(let i = 0; i < markets.length; i++) {
            const market = markets[i];
            if(!_tokens.find((token: any) => token.id == market.inputToken.id)) {
                _tokens.push(market.inputToken);
            }
        }
        for(let i = 0; i < dexPools.length; i++) {
            const dexPool = dexPools[i];
            for(let j = 0; j < dexPool.tokens.length; j++) {
                const token = dexPool.tokens[j];
                if(!_tokens.find((token: any) => token.id == token.id)) {
                    _tokens.push(token);
                }
            }
        }
        setTokens(_tokens);
        if(!_address){
            setStatus(Status.NOT_FETCHING);
            return;
        }

        let calls: any[] = [];
        // ETH balance
        calls.push([
            helper.address,
            helper.interface.encodeFunctionData("getEthBalance", [
                _address,
            ]),
        ]);
        // Get tokens balances, allowance to router, nonces for each token
        for(let i = 0; i < _tokens.length; i++) {
            const token = _tokens[i];
            calls.push([
                token.id,
                itf.encodeFunctionData("balanceOf", [_address]),
            ]);
            calls.push([
                token.id,
                itf.encodeFunctionData("allowance", [
                    _address,
                    routerAddress,
                ]),
            ]);
            if(token.isPermit){
                calls.push([
                    token.id,
                    itf.encodeFunctionData("nonces", [_address]),
                ])
            }
        }

        // for synthetic pools, get collaterals allowance to pool
        for (let i = 0; i < pools.length; i++) {
            for(let j = 0; j < pools[i].collaterals.length; j++) {
                const collateral = pools[i].collaterals[j];
                calls.push([
                    collateral.token.id,
                    itf.encodeFunctionData("allowance", [
                        _address,
                        pools[i].id,
                    ]),
                ]);
            }
        }
        // For lending input tokens, get allowance to lending protocol
        // If wrapped token, get allowance to wrapper and borrow allowace
        // Get balance and totalSupplies of output token, debt tokens
        for(let i = 0; i < markets.length; i++) {
            const market = markets[i];
            // allowance to market
            calls.push([
                market.inputToken.id,
                itf.encodeFunctionData("allowance", [
                    _address,
                    market.protocol._lendingPoolAddress
                ]),
            ]);
            calls.push([
                market.outputToken.id,
                itf.encodeFunctionData("nonces", [_address]),
            ]);
            // if aweth, check allowance for wrapper
            if(market.inputToken.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
                calls.push([
                    market.inputToken.id,
                    itf.encodeFunctionData("allowance", [
                        _address,
                        wrapperAddress
                    ]),
                ]);
                calls.push([
                    market._vToken.id,
                    vTokenInterface.encodeFunctionData("borrowAllowance", [_address, wrapperAddress]),
                ])
            };

            calls.push([
                market.outputToken.id,
                itf.encodeFunctionData("balanceOf", [_address]),
            ]);
            // debt
            calls.push([
                market._vToken.id,
                itf.encodeFunctionData("balanceOf", [_address]),
            ]);
            calls.push([
                market._sToken.id,
                itf.encodeFunctionData("balanceOf", [_address]),
            ]);
        };

        // check balance for lp tokens and allowance to vault
        for(let i = 0; i < dexPools.length; i++) {
            const dexPool = dexPools[i];
            // lp balance
            calls.push([
                dexPool.address,
                itf.encodeFunctionData("balanceOf", [_address]),
            ]);
            for(let j = 0; j < dexPool.tokens.length; j++) {
                const token = dexPool.tokens[j].token;
                calls.push([
                    token.id,
                    itf.encodeFunctionData("allowance", [
                        _address,
                        vault.address
                    ]),
                ]);
            }
        }

        helper.callStatic.aggregate(calls).then(async (res: any) => {
            const newBalances: any = {};
            const newAllowances: any = {};
            const newNonces: any = {};
            // const newTotalSupplies: any = {};
            res = res.returnData;
            let index = 0;
            // update eth balance
            newBalances[ADDRESS_ZERO] = BigNumber.from(res[index]).toString();
            index++;
            // update tokens
            for(let i = 0; i < _tokens.length; i++) {
                const token = _tokens[i];
                newBalances[token.id] = BigNumber.from(res[index]).toString();
                index++;
                if(!newAllowances[token.id]) newAllowances[token.id] = {};
                newAllowances[token.id][routerAddress] = BigNumber.from(res[index]).toString();
                index++;
                if(token.isPermit){
                    newNonces[token.id] = BigNumber.from(res[index]).toString();
                    index++;
                }
            }
            for (let i = 0; i < pools.length; i++) {
                for(let j = 0; j < pools[i].collaterals.length; j++) {
                    const collateral = pools[i].collaterals[j];
                    if(!newAllowances[collateral.token.id]) newAllowances[collateral.token.id] = {};
                    newAllowances[collateral.token.id][pools[i].id] = BigNumber.from(res[index]).toString();
                    index++;
                }
            }
            for(let i = 0; i < markets.length; i++) {
                const market = markets[i];
                if(!newAllowances[market.inputToken.id]) newAllowances[market.inputToken.id] = {};
                newAllowances[market.inputToken.id][market.protocol._lendingPoolAddress] = BigNumber.from(res[index]).toString();
                index++;
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
            }
            for(let i = 0; i < dexPools.length; i++) {
                const dexPool = dexPools[i];
                newBalances[dexPool.address] = BigNumber.from(res[index]).toString();
                index++;
                for(let j = 0; j < dexPool.tokens.length; j++) {
                    const token = dexPool.tokens[j].token;
                    if(!newAllowances[token.id]) newAllowances[token.id] = {};
                    newAllowances[token.id][vault.address] = BigNumber.from(res[index]).toString();
                    index++;
                }
            }
            setStatus(Status.SUCCESS);
            setWalletBalances(newBalances);
            setAllowances(newAllowances);
            setNonces(newNonces);
        })
        .catch((err: any) => {
            setStatus(Status.ERROR);
        })
	};

    /**
     * Parse Transfers (in and out) and Approvals from tx
     * @param tx confirmed tx
     */
    const updateFromTx = async (tx: any) => {
        let tokenItf = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 value)", "event Approval(address indexed owner, address indexed spender, uint256 value)"]);
        // Transfer events
        let events = tx.events.filter((event: any) => event.topics[0] == tokenItf.getEventTopic("Transfer"));
        // Decode events
        let decodedEvents = events.map((event: any) => {return {token: event.address.toLowerCase(), args: tokenItf.decodeEventLog("Transfer", event.data, event.topics)}});
        for(let i in decodedEvents){
            let isOut = decodedEvents[i].args[0].toLowerCase() == address?.toLowerCase();
            let isIn = decodedEvents[i].args[1].toLowerCase() == address?.toLowerCase();
            if(isIn || isOut){
                updateBalance(decodedEvents[i].token, decodedEvents[i].args[2].toString(), isOut ? true : false);
            }
        }
        // Approve events
        events = tx.events.filter((event: any) => event.topics[0] == tokenItf.getEventTopic("Approval"));
        // Decode events
        decodedEvents = events.map((event: any) => {return {token: event.address.toLowerCase(), args: tokenItf.decodeEventLog("Approval", event.data, event.topics)}});
        let newAllowances = {...allowances};
        for(let i in decodedEvents){
            if(decodedEvents[i].args[0].toLowerCase() == address?.toLowerCase()){
                if(!newAllowances[decodedEvents[i].token]) newAllowances[decodedEvents[i].token] = {};
                newAllowances[decodedEvents[i].token][decodedEvents[i].args[1].toLowerCase()] = decodedEvents[i].args[2].toString();
            }
        }
        setAllowances(newAllowances);
    }

    const updateBalance = async (asset: string, value: string, isMinus: boolean = false) => {
        const newBalances = {...walletBalances};
        if (isMinus) {
            newBalances[asset] = Big(walletBalances[asset] ?? 0).minus(value).toString();
        } else {
            newBalances[asset] = Big(walletBalances[asset] ?? 0).plus(value).toString();
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
        tokens,
        updateFromTx
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

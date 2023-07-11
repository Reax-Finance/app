import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../context/PriceContext";
import {
    useToast,
} from "@chakra-ui/react";
import { WETH_ADDRESS, defaultChain } from "../../../../src/const";
import { ethers } from "ethers";
import { call, getAddress, getArtifact, getContract, send } from "../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../context/DexDataProvider";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { formatBalError } from "../../../../src/errors";
import ProportionalWithdrawLayout from "./layouts/ProportionalWithdrawLayout";
import { parseInput } from "../../../utils/number";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";

export default function ProportionalWithdraw({ pool }: any) {
    const poolTokens = pool.tokens.filter((token: any) => token.token.id != pool.address);
	const [amounts, setAmounts] = React.useState(
		poolTokens.map((token: any) => "")
	);
	const { prices } = usePriceData();
	const { address, isConnected } = useAccount();
	const { vault } = useDexData();
	const { walletBalances, allowances, updateFromTx } = useBalanceData();
	const { chain } = useNetwork();
	const [loading, setLoading] = React.useState(false);
	const [isNative, setIsNative] = React.useState(false);
	const [bptIn, setBptIn] = React.useState<any>(null);
    const [maxSlippage, setMaxSlippage] = React.useState('0.5');
	const [error, setError] = React.useState("");

	const handleBalError = useHandleError(PlatformType.DEX);

	const withdrawWithExit = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        let userData = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256[]', 'uint256'], 
            [2, poolTokens.map((token: any, i: number) => Big(amounts[i]).mul(10**token.token.decimals).toFixed(0)), walletBalances[pool.address]]
        );
        
		let args = [
			pool.id,
			address,
			address,
			{
				assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
				minAmountsOut: pool.tokens.map((token: any, i: number) => '0'),
				userData,
				fromInternalBalance: false
			}
		];

		send(vaultContract, "exitPool", args)
		.then(async (res: any) => {
			let response = await res.wait();
            updateFromTx(response);
			setLoading(false);
			setAmounts(poolTokens.map((token: any) => ""));
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

	const withdrawWithSwap = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        
		let args = [
			1,
			poolTokens.map((token: any, index: number) => {
				return {
					poolId: pool.id,
					assetInIndex: pool.tokens.findIndex((t: any) => t.token.id == pool.address),
					assetOutIndex: token.index,
					amount: Big(amounts[index]).mul(10**token.token.decimals).toFixed(0),
					userData: '0x'
				}
			}),
			pool.tokens.map((token: any, index: number) => token.token.id),
			{
				sender: address,
				fromInternalBalance: false,
				recipient: address,
				toInternalBalance: false
			},
			pool.tokens.map((token: any, index: number) => walletBalances[token.token.id]),
			// deadline in sec
			Date.now() + 60*60*24*30,
		];

		send(vaultContract, "batchSwap", args)
		.then(async (res: any) => {
			let response = await res.wait();
            updateFromTx(response);
			setLoading(false);
			setAmounts(poolTokens.map((token: any) => ""));
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

	const withdraw = pool.poolType == 'ComposableStable' ? withdrawWithSwap : withdrawWithExit;

	const queryBptInWithSwap = (_amounts = amounts) => {
		return new Promise((resolve, reject) => {
			const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"), provider);
			let args = [
				1,
				poolTokens.map((token: any, index: number) => {
					return {
						poolId: pool.id,
						assetInIndex: pool.tokens.findIndex((t: any) => t.token.id == pool.address),
						assetOutIndex: token.index,
						amount: Big(_amounts[index]).mul(10**token.token.decimals).toFixed(0),
						userData: '0x'
					}
				}),
				pool.tokens.map((token: any, index: number) => token.token.id),
				{
					sender: address,
					fromInternalBalance: false,
					recipient: address,
					toInternalBalance: false
				}
			];

			vaultContract.callStatic.queryBatchSwap(...args)
			.then((res: any) => {
				resolve(res[pool.tokens.findIndex((token: any) => token.token.id == pool.address)].toString());
				setLoading(false);
			})
			.catch((err: any) => {
				if(formatBalError(err)){
					reject(formatBalError(err));
				} else {
					reject(JSON.stringify(err));
				}
				setLoading(false);
			})
		})
	}

	const queryBptInWithExit = (_amounts = amounts) => {
		return new Promise((resolve, reject) => {
			const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			const helperContract = new ethers.Contract(getAddress("BalancerHelpers", defaultChain.id), getArtifact("BalancerHelpers"), provider);
			let userData = ethers.utils.defaultAbiCoder.encode(
				['uint256', 'uint256[]', 'uint256'], 
				[2, poolTokens.map((token: any, i: number) => Big(_amounts[i]).mul(10**token.token.decimals).toFixed(0)), walletBalances[pool.address]]
			);
			
			let args = [
				pool.id,
				address,
				address,
				{
					assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
					minAmountsOut: pool.tokens.map((token: any, i: number) => '0'),
					userData,
					fromInternalBalance: false
				}
			];

			helperContract.callStatic.queryExit(...args)
			.then((res: any) => {
				resolve(res.bptIn.toString());
				setLoading(false);
			})
			.catch((err: any) => {
				if(formatBalError(err)){
					reject(formatBalError(err));
				} else {
					reject(JSON.stringify(err));
				}
				setLoading(false);
			})
		})
	}

	const queryBptIn = pool.poolType == 'ComposableStable' ? queryBptInWithSwap : queryBptInWithExit;

	const _setBptIn = (_amounts = amounts) => {
		setBptIn(null);
		setError('');
		setLoading(true);
		queryBptIn(_amounts)
		.then((res: any) => {
			console.log(res);
			setBptIn(res);
			setLoading(false);
			setError('');
		})
		.catch((err: any) => {
			setError(err);
			setLoading(false);
		})
	}

    // to rebalance tokens in proportion
	useEffect(() => {
        if(!amounts[0]) return;
		setAmount(amounts[0], 0)
	}, [pool])

    const tokenToApprove = () => {		
		// check allowances
		for(let i = 0; i < poolTokens.length; i++) {
			if(isNative && poolTokens[i].token.id == WETH_ADDRESS(chain?.id!)) continue;
			if(isNaN(Number(amounts[i]))) continue;
			if(Big(allowances[poolTokens[i].token.id]?.[vault.address] ?? 0).lt(Big(Number(amounts[i])).mul(10 ** poolTokens[i].token.decimals))) {
				return i;
			}
		}
		return -1;
	}

	const setMax = (multiplier = 1) => {
		const totalShares = pool.totalShares;
		const yourShares = walletBalances[pool.address];

		const _amounts = poolTokens.map((token: any) => {
			return Big(token.balance).mul(Big(yourShares).div(Big(totalShares))).mul(multiplier).div(10**18).toString();
		})
		setAmounts(_amounts);
		_setBptIn(_amounts);
	}

	const validate = () => {
		if(!isConnected) return {valid: false, message: "Connect wallet"};
		if(chain?.unsupported) return {valid: false, message: "Unsupported network"};
		// check balances
		for(let i = 0; i < poolTokens.length; i++) {
			if(isNaN(Number(amounts[i])) || Number(amounts[i]) == 0) {
				return {
					valid: false,
					message: "Enter amount"
				};
			}
		}
		// if(tokenToApprove() !== -1) {
		// 	return {
		// 		valid: true,
		// 		message: `Approve ${poolTokens[tokenToApprove()].token.symbol} for use`
		// 	}
		// }
		if(error && error.length > 0) {
			return {
				valid: false,
				message: error
			}
		}
		return {
			valid: true,
			message: "Withdraw"
		}
	}

	const setAmount = (_amount: string, index: number) => {
		_amount = parseInput(_amount);
        if(Number(_amount) < 0 || _amount == '-') return;
		let _amounts: any[] = [...amounts];
		let isValid = true;
		for(let i = 0; i < _amounts.length; i++){
			if(Number(i) == index){
				_amounts[i] = _amount;
			} else {
				if(isNaN(Number(_amount))) {
					isValid = false;
					continue;
				}
				_amounts[i] = Big(Number(_amount) ?? 0).mul(poolTokens[i].balance).div(poolTokens[index].balance).toString();
			}
		}
		setAmounts(_amounts);
		if(isValid) {
			_setBptIn(_amounts);
		}
	}

    const values = () => {
        if(!validate().valid) return null;
        if(!bptIn) return null;
		if(loading) return null;

        // total pool value: sum of Big(poolTokens[i].balance).mul(prices[poolTokens[i].token.id] ?? 0)
        let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0)).toNumber();
		let sharePrice = poolValue / (pool.totalShares);

		// value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let outputValues = amounts.reduce((a: any, b: any, i: number) => {
            return a.add(Big(b).mul(prices[poolTokens[i].token.id] ?? 0));
        }, Big(0));

        return {
			slippage: (100*(outputValues - (sharePrice * bptIn / 1e18))/ (sharePrice * bptIn / 1e18)).toFixed(4),
			inputUSD: (sharePrice * bptIn / 1e18),
			outputUSD: outputValues.toNumber(),
		}
    }

	return (
		<ProportionalWithdrawLayout
			pool={pool}
			amounts={amounts}
			isNative={isNative}
			setIsNative={setIsNative} 
			setAmount={setAmount}
			setMax={setMax}
			values={values()}
            bptIn={bptIn}
			maxSlippage={maxSlippage}
			setMaxSlippage={setMaxSlippage}
			validate={validate}
			loading={loading} 
			withdraw={withdraw}
		/>
	);
}

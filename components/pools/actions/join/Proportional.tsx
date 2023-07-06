import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../context/PriceContext";
import {
    useToast,
} from "@chakra-ui/react";
import { WETH_ADDRESS, defaultChain } from "../../../../src/const";
import { ethers } from "ethers";
import { getAddress, getArtifact, getContract, send } from "../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../context/DexDataProvider";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { formatBalError } from "../../../../src/errors";
import ProportionalDepositLayout from "./layouts/ProportionalDepositLayout";
import { parseInput } from "../../../utils/number";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";

export default function ProportionalDeposit({ pool }: any) {
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
	const [bptOut, setBptOut] = React.useState<any>(null);
    const [maxSlippage, setMaxSlippage] = React.useState('0.5');
	const [error, setError] = React.useState<any>(null);

	const handleBalError = useHandleError(PlatformType.DEX);

	const deposit = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        
        let userData = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256[]', 'uint256'], 
            [1, amounts.map((amount: any, i: number) => Big(Number(amount) || 0).mul(10**poolTokens[i].token.decimals).toFixed(0)), bptOut ?? 0]
        );
        let maxAmountsIn = poolTokens.map((token: any, i: number) => Big(Number(amounts[i])).mul(10**token.token.decimals).mul(100+maxSlippage).div(100).toFixed(0));
        if(Big(pool.totalShares ?? 0).eq(0)) userData = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256[]'], 
            [0, amounts.map((amount: any, i: number) => Big(Number(amount) || 0).mul(10**poolTokens[i].token.decimals).toFixed(0))]
        );
		
		let poolTokenIndex = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
		// insert into maxAmountsIn
		if(poolTokenIndex !== -1) maxAmountsIn.splice(poolTokenIndex, 0, '0');
        
		let args = [
			pool.id,
			address,
			address,
			{
				assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
				maxAmountsIn,
				userData,
				fromInternalBalance: false
			}
		];
		const ethAmount = Big(amounts[poolTokens.findIndex((token: any) => token.token.id == WETH_ADDRESS(chain?.id!))] ?? 0).mul(1e18).toFixed(0);
		send(vaultContract, "joinPool", args, isNative ? ethAmount : '0')
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

    // to rebalance tokens in proportion
	useEffect(() => {
        if(!amounts[0]) return;
		setAmount(amounts[0], 0)
	}, [pool])

    const queryJoin = async (_amounts = amounts) => {
        return new Promise<any>(async (resolve, reject) => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const balancerHelper = new ethers.Contract(getAddress("BalancerHelpers", chain?.id ?? defaultChain.id), getArtifact("BalancerHelpers"), provider);
            let args = [
                pool.id,
                address,
                address,
                {
                    assets: pool.tokens.map((token: any, i: number) => token.token.id),
                    maxAmountsIn: pool.tokens.map((token: any) => ethers.constants.MaxUint256),
                    userData: Big(pool.totalShares ?? 0).eq(0) ? ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]'], 
                            [0, _amounts.map((amount: any, i: number) => Big(Number(amount)).mul(10**poolTokens[i].token.decimals).toFixed(0))]
                        ) : ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]', 'uint256'], 
                            [1, _amounts.map((amount: any, i: number) => Big(Number(amount)).mul(10**poolTokens[i].token.decimals).toFixed(0)), 0]
                        ),
                    fromInternalBalance: false
                }
            ];
			balancerHelper.callStatic.queryJoin(...args)
			.then((res: any) => {
				resolve(res);
			})
			.catch((err: any) => {
				reject(err);
			})
        })
    }

	// return index of token in pool tokens to approve
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
			if(Big(walletBalances[(isNative && poolTokens[i].token.id == WETH_ADDRESS(chain?.id!)) ? ethers.constants.AddressZero : poolTokens[i].token.id] ?? 0).lt(Big(amounts[i]).mul(10 ** poolTokens[i].token.decimals))) {
				return {
					valid: false,
					message: `Insufficient ${poolTokens[i].token.symbol} balance`
				};
			}
		}
		if(tokenToApprove() !== -1) {
			return {
				valid: true,
				message: `Approve ${poolTokens[tokenToApprove()].token.symbol} for use`
			}
		}
		return {
			valid: true,
			message: "Deposit"
		}
	}

	const approve = async () => {
		let token = await getContract("MockToken", chain?.id!, poolTokens[tokenToApprove()].token.id);
		send(token, "approve", [
			vault.address,
			ethers.constants.MaxUint256
		])
		.then(async (res: any) => {
			let response = await res.wait();
            updateFromTx(response);
		})
		.catch((err: any) => {
			console.log(err);
		})
	}

	const setAmount = (_amount: string, index: number) => {
		_amount = parseInput(_amount);
        if(Number(_amount) < 0 || _amount == '-' || loading) {
			setAmounts(
				amounts.map((amount: any, i: number) => {
					if(i == index) return _amount;
					return amount;
				})
			)
		}
		let _amounts: any[] = [...amounts];
		let isValid = true;
		for(let i = 0; i < _amounts.length; i++){
			if(Number(i) == index){
				_amounts[i] = _amount;
			} else {
				if(isNaN(Number(_amount)) || poolTokens[index].balance == 0) {
					isValid = false;
					continue;
				}
				_amounts[i] = Big(Number(_amount) ?? 0).mul(poolTokens[i].balance).div(poolTokens[index].balance).toFixed(poolTokens[i].token.decimals);
			}
		}
		setAmounts(_amounts);
		if(!isValid || Number(_amount) == 0) return;
		
		setLoading(true);
		queryJoin(_amounts)
		.then((res: any) => {
			setLoading(false);
			setBptOut(res.bptOut.toString());
		})
		.catch((err: any) => {
			setLoading(false);
			setBptOut(undefined);
		})

	}

    const values = () => {
        if(!validate().valid) return null;
        if(!bptOut) return null;
		if(loading) return null;
		let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0)).toNumber();
		let sharePrice = poolValue / (pool.totalShares);
        
        // value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let inputValues = amounts.reduce((a: any, b: any, i: number) => {
            return a.add(Big(b).mul(prices[poolTokens[i].token.id] ?? 0));
        }, Big(0)).toNumber();

        return {
            slippage: (100*((sharePrice * bptOut / 1e18) - inputValues)/ inputValues).toFixed(4),
            outputUSD: (sharePrice * bptOut / 1e18).toFixed(2),
            inputUSD: inputValues.toFixed(2)
        }
    }

	const setMax = (multiplier: number) => {
		let _amountsMin: any[] = [];
		let _amounts: string[][] = [];
		for(let i = 0; i < poolTokens.length; i++){
			_amounts.push([])
			let amount = Big(walletBalances[poolTokens[i].token.id] ?? 0).div(10 ** poolTokens[i].token.decimals).toFixed(poolTokens[i].token.decimals);
			for(let j = 0; j < amounts.length; j++){
				if(i == j){
					_amounts[i].push(amount);
				} else {
					_amounts[i].push(Big(amount).mul(poolTokens[j].balance).div(poolTokens[i].balance).toFixed(poolTokens[j].token.decimals));
				}
			}
		}
		// find array with lowest _amounts[i][0]
		let min = _amounts[0][0];
		let minIndex = 0;
		for(let i = 1; i < _amounts.length; i++){
			if(Big(_amounts[i][0]).lt(min)){
				min = _amounts[i][0];
				minIndex = i;
			}
		}
		_amountsMin = _amounts[minIndex]
		// multiply by multiplier
		for(let i = 0; i < _amountsMin.length; i++){
			_amountsMin[i] = Big(_amountsMin[i]).mul(multiplier).toFixed(poolTokens[i].token.decimals);
		}
		
		setAmounts(_amountsMin);
		setLoading(true);
		queryJoin(_amountsMin)
		.then((res: any) => {
			setLoading(false);
			setBptOut(res.bptOut.toString());
		})
		.catch((err: any) => {
			setLoading(false);
			setBptOut(undefined);
		})
	}

	return (
		<ProportionalDepositLayout 
			pool={pool}
			amounts={amounts} 
			setAmount={setAmount} 
			isNative={isNative} 
			setIsNative={setIsNative} 
			values={values()} 
			bptOut={bptOut} 
			loading={loading} 
			validate={validate} 
			maxSlippage={maxSlippage} 
			setMax={setMax}
			setMaxSlippage={setMaxSlippage} 
			tokenToApprove={tokenToApprove} 
			approve={approve} 
			deposit={deposit}
		/>
	);
}

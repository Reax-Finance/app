import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../../context/PriceContext";
import {
    useToast,
} from "@chakra-ui/react";
import { WETH_ADDRESS, defaultChain } from "../../../../../src/const";
import { ethers } from "ethers";
import { getAddress, getArtifact, getContract, send } from "../../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../../context/DexDataProvider";
import { useBalanceData } from "../../../../context/BalanceProvider";
import Big from "big.js";
import { formatBalError } from "../../../../../src/errors";
import ProportionalDepositLayout from "../layouts/ProportionalDepositLayout";
import useHandleBalError, { PlatformType } from "../../../../utils/useHandleError";

export default function ProportionalDeposit({ pool }: any) {
    const poolTokens = pool.tokens.filter((token: any) => token.token.id != pool.address);
	const [amounts, setAmounts] = React.useState(
		poolTokens.map((token: any) => "")
	);
	const { prices } = usePriceData();
	const { address } = useAccount();
	const { vault } = useDexData();
	const { walletBalances, allowances } = useBalanceData();
	const { chain } = useNetwork();
	const [loading, setLoading] = React.useState(false);
	const [isNative, setIsNative] = React.useState(false);
	const [bptOut, setBptOut] = React.useState<any>(null);
    const [maxSlippage, setMaxSlippage] = React.useState('0.5');

    const toast = useToast();

	const handleBalError = useHandleBalError(PlatformType.DEX);

	const deposit = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        let bptOut = await queryBptOut();
        bptOut = Big(bptOut).mul(0.999).toFixed(0);
        let userData = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256[]', 'uint256'], 
            [1, amounts.map((amount: any, i: number) => Big(Number(amount)).mul(10**poolTokens[i].token.decimals).toString()), bptOut]
        );
        let maxAmountsIn = poolTokens.map((token: any, i: number) => Big(Number(amounts[i])).mul(10**token.token.decimals).mul(100+maxSlippage).div(100).toFixed(0));
        if(Big(pool.totalShares ?? 0).eq(0)) userData = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256[]'], 
            [0, amounts.map((amount: any, i: number) => Big(Number(amount) == 0 ? '1' : Number(amount)).mul(10**poolTokens[i].token.decimals).toString())]
        );
        
		let poolTokenIndex = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
		// insert into maxAmountsIn
		maxAmountsIn.splice(poolTokenIndex, 0, '0');
        
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
		.then((res: any) => {
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

    // to set bptOut
    useEffect(() => {
        if(!validate().valid) return;
        else{
            setBptOut(null);
            queryBptOut()
            .then((res: any) => {
                setBptOut(res);
            })
        }
    }, [amounts])

    const queryBptOut = async () => {
        return new Promise<string>(async (resolve, reject) => {
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
                            [0, amounts.map((amount: any, i: number) => Big(Number(amount) == 0 ? '1' : Number(amount)).mul(10**poolTokens[i].token.decimals).toFixed(0))]
                        ) : ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]', 'uint256'], 
                            [1, amounts.map((amount: any, i: number) => Big(Number(amount)).mul(10**poolTokens[i].token.decimals).toFixed(0)), 0]
                        ),
                    fromInternalBalance: false
                }
            ];
            try{
                const res = await balancerHelper.callStatic.queryJoin(...args);
                resolve(res.bptOut.toString());
            }
            catch(err){
                reject(formatBalError(err));
            }
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
		// check balances
		for(let i = 0; i < poolTokens.length; i++) {
			if(isNaN(Number(amounts[i])) || Number(amounts[i]) == 0) {
				return {
					valid: false,
					message: "Enter amount"
				};
			}
			if(Big(walletBalances[(isNative && poolTokens[i].token.id == WETH_ADDRESS(chain?.id!)) ? ethers.constants.AddressZero : poolTokens[i].token.id] ?? 0).lt(Big(Number(amounts[i])).mul(10 ** poolTokens[i].token.decimals))) {
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
		.then((res: any) => {
			console.log(res);
		})
		.catch((err: any) => {
			console.log(err);
		})
	}

	const setAmount = (_amount: string, index: number) => {
        if(Number(_amount) < 0 || _amount == '-') return;
		let _amounts: any[] = [...amounts];
		for(let i = 0; i < _amounts.length; i++){
			if(Number(i) == index){
				_amounts[i] = _amount;
			} else {
				if(isNaN(Number(_amount))) continue;
				_amounts[i] = Big(Number(_amount) ?? 0).mul(poolTokens[i].balance).div(poolTokens[index].balance).toFixed(poolTokens[i].token.decimals);
			}
		}
		setAmounts(_amounts);
	}

    const slippage = () => {
        if(!validate().valid) return '-';
        if(!bptOut) return '-';
        let poolTotalShares = Big(pool.totalShares).add(Big(bptOut ?? 0).div(1e18));
        // value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let inputValues = amounts.reduce((a: any, b: any, i: number) => {
            return a.add(Big(b).mul(prices[poolTokens[i].token.id] ?? 0));
        }, Big(0));

        // total pool value: sum of Big(poolTokens[i].balance).mul(prices[poolTokens[i].token.id] ?? 0)
        let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0));
        poolValue = poolValue.add(inputValues);

        const value = Big(bptOut ?? 0).div(1e18).div(poolTotalShares).mul(poolValue);
        return Big(value).sub(inputValues).div(inputValues).mul(100).toFixed(2);
    }

	return (
		<ProportionalDepositLayout 
			pool={pool}
			amounts={amounts} 
			setAmount={setAmount} 
			isNative={isNative} 
			setIsNative={setIsNative} 
			slippage={slippage} 
			bptOut={bptOut} 
			loading={loading} 
			validate={validate} 
			maxSlippage={maxSlippage} 
			setMaxSlippage={setMaxSlippage} 
			tokenToApprove={tokenToApprove} 
			approve={approve} 
			deposit={deposit}
		/>
	);
}

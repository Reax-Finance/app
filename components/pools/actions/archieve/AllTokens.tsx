import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../context/PriceContext";
import {
	Box,
	Button,
	Divider,
	Flex,
	Image,
	InputGroup,
	NumberInput,
	NumberInputField,
	Select,
	Text,
    useToast,
} from "@chakra-ui/react";
import { WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../../../src/const";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";
import { getAddress, getArtifact, getContract, send } from "../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../context/DexDataProvider";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { formatBalError } from "../../../../src/errors";

export default function AllTokensDeposit({ pool }: any) {
    // assets excluding pool token
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

	const deposit = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        let _amounts = amounts.map((amount: any, i: number) => Big(Number(amount)).mul(10**poolTokens[i].token.decimals).toString());
        let maxAmountsIn = poolTokens.map((token: any, i: number) => Big(Number(amounts[i])).mul(10**token.token.decimals).mul(100+maxSlippage).div(100).toString());

        if(Big(pool.totalShares ?? 0).eq(0) && pool.poolType == 'ComposableStable'){
            // add amount for pool token
            const indexOfPoolToken = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
            _amounts.splice(indexOfPoolToken, 0, ethers.constants.One.toString());
        }

        if(pool.poolType == 'ComposableStable'){
            let poolTokenIndex = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
            // insert into maxAmountsIn
            maxAmountsIn.splice(poolTokenIndex, 0, '0');
        }
        console.log(maxAmountsIn);
		let args = [
			pool.id,
			address,
			address,
			{
				assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
				maxAmountsIn,
				userData: Big(pool.totalShares ?? 0).eq(0) ? ethers.utils.defaultAbiCoder.encode(
						['uint256', 'uint256[]'], 
						[0, _amounts]
					) : ethers.utils.defaultAbiCoder.encode(
						['uint256', 'uint256[]', 'uint256'], 
						[1, _amounts, 0]
					),
				fromInternalBalance: false
			}
		]
		const ethAmount = Big(amounts[pool.tokens.findIndex((token: any) => token.token.id == WETH_ADDRESS(chain?.id!))] ?? 0).mul(1e18).toFixed(0);
		send(vaultContract, "joinPool", args, isNative ? ethAmount : '0')
		.then((res: any) => {
			console.log(res);
			setLoading(false);
			setAmounts(poolTokens.map((token: any) => ""));
		})
		.catch((err: any) => {
			if(err?.reason == "user rejected transaction"){
				toast({
					title: "Transaction Rejected",
					description: "You have rejected the transaction",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else if(formatBalError(err)){
				toast({
					title: "Transaction Failed",
					description: formatBalError(err),
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else {
				toast({
					title: "Transaction Failed",
					description: err?.data?.message || JSON.stringify(err).slice(0, 100),
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			}
			setLoading(false);
		})
	}

    const queryBptOut = () => {
        return new Promise(async (resolve, reject) => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const balancerHelper = new ethers.Contract(getAddress("BalancerHelpers", chain?.id ?? defaultChain.id), getArtifact("BalancerHelpers"), provider);
            let _amounts = amounts.map((amount: any, i: number) => Big(Number(amount)).mul(10**poolTokens[i].token.decimals).toString());
            if(Big(pool.totalShares ?? 0).eq(0) && pool.poolType == 'ComposableStable'){
                // add amount for pool token
                const indexOfPoolToken = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
                _amounts.splice(indexOfPoolToken, 0, ethers.constants.One.toString());
            }
            let args = [
                pool.id,
                address,
                address,
                {
                    assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
                    maxAmountsIn: pool.tokens.map((token: any) => ethers.constants.MaxUint256),
                    userData: Big(pool.totalShares ?? 0).eq(0) ? ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]'], 
                            [0, _amounts]
                        ) : ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]', 'uint256'], 
                            [1, _amounts, 0]
                        ),
                    fromInternalBalance: false
                }
            ]
            try{
                const res = await balancerHelper.callStatic.queryJoin(...args);
                resolve(res.bptOut.toString());
            } catch(err) {
                reject(formatBalError(err));
            }
        })
    }

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

	// return index of token in pool.tokens to approve
	const tokenToApprove = () => {		
		// check allowances
		for(let i = 0; i < poolTokens.length; i++) {
			if(isNative && poolTokens[i].token.id == WETH_ADDRESS(chain?.id!)) continue;
			if(isNaN(Number(amounts[i]))) continue;
			if(Big(allowances[poolTokens[i].token.id]?.[vault.address] ?? 0).lt(Big(Number(amounts[i])).mul(10 ** pool.tokens[i].token.decimals))) {
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
        setLoading(true);
		let token = await getContract("MockToken", chain?.id!, poolTokens[tokenToApprove()].token.id);
		send(token, "approve", [
			vault.address,
			ethers.constants.MaxUint256
		])
		.then((res: any) => {
            setLoading(false);
			console.log(res);
		})
		.catch((err: any) => {
            if(err?.reason == "user rejected transaction"){
				toast({
					title: "Transaction Rejected",
					description: "You have rejected the transaction",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else if(formatBalError(err)){
				toast({
					title: "Transaction Failed",
					description: formatBalError(err),
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else {
				toast({
					title: "Transaction Failed",
					description: err?.data?.message || JSON.stringify(err).slice(0, 100),
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			}
			setLoading(false);
		})
	}

	const setAmount = (_amount: string, index: number) => {
		let _amounts: any[] = [...amounts];
		for(let i = 0; i < _amounts.length; i++){
			if(Number(i) == index){
				_amounts[i] = _amount;
			}
		}
		setAmounts(_amounts);
	}

    const slippage = () => {
        if(!validate().valid) return '-';
        if(!bptOut) return '-';
        let poolTotalShares = Big(pool.totalShares).add((bptOut/1e18) ?? 0);
        // value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let inputValues = amounts.reduce((a: any, b: any, i: number) => {
            return a.add(Big(b).mul(prices[poolTokens[i].token.id] ?? 0));
        }, Big(0));

        // total pool value: sum of Big(poolTokens[i].balance).mul(prices[poolTokens[i].token.id] ?? 0)
        let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0));
        poolValue = poolValue.add(inputValues);

        const value = Big((bptOut/1e18) ?? 0).div(poolTotalShares).mul(poolValue);
        return Big(value).sub(inputValues).div(inputValues).mul(100).toFixed(2);
    }

	return (
        <>
			{amounts.map((amount: any, i: number) => {
				const _isNativeToken =poolTokens[i].token.id == WETH_ADDRESS(chain?.id!) && isNative;
				return (
					<Box key={i}>
						<Box px={4}>
							<InputGroup
								mt={5}
								variant={"unstyled"}
								display="flex"
								placeholder="Enter amount"
							>
								<NumberInput
									w={"100%"}
									value={amount}
									onChange={(valueString) => setAmount(valueString, i)}
									min={0}
									step={0.01}
									display="flex"
									alignItems="center"
									justifyContent={"center"}
								>
									<Box ml={0}>
										<NumberInputField
											textAlign={"left"}
											pr={0}
											fontSize={"4xl"}
											placeholder="0"
											fontFamily={'Chakra Petch'}
										/>
										<Text
											fontSize="sm"
											textAlign={"left"}
											color={"whiteAlpha.600"}
										>
											{dollarFormatter.format(
												(prices[poolTokens[i].token.id] ?? 0) *
													amount
											)}
										</Text>
									</Box>

									<Box>
									<Flex justify={'end'} align={'center'} gap={2} mt={2}>
										<Image rounded={'full'} src={`/icons/${_isNativeToken ? 'MNT' : poolTokens[i].token.symbol}.svg`} alt="" width={"30px"} />
										{poolTokens[i].token.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) ? <><Select mr={-2} w={'110px'} value={isNative ? 'ETH' : 'WETH'} variant={'unstyled'} onChange={(e) => e.target.value == 'ETH' ? setIsNative(true) : setIsNative(false)}>
											<option value="ETH">ETH</option>
											<option value="WETH">WETH</option>
										</Select></> : <Text mr={2}>{poolTokens[i].token.symbol}</Text>}
									</Flex>
									<Flex justify={'end'} mt={2}>
										<Button
											variant={"unstyled"}
											fontSize="sm"
											fontWeight={"bold"}
											onClick={() => setAmount(Big(walletBalances[_isNativeToken ? ethers.constants.AddressZero : poolTokens[i].token.id] ?? 0).div(10**poolTokens[i].token.decimals).mul(0.5).toString(), i)}
										>
											50%
										</Button>
										<Button
											variant={"unstyled"}
											fontSize="sm"
											fontWeight={"bold"}
											onClick={() => setAmount(Big(walletBalances[_isNativeToken ? ethers.constants.AddressZero : poolTokens[i].token.id] ?? 0).div(10**poolTokens[i].token.decimals).toString(), i)}
										>
											MAX
										</Button>
									</Flex>
									</Box>
									
								</NumberInput>
							</InputGroup>

							{(i !== (amounts.length - 1)) && <Flex my={5} align={'center'}>
							<Divider borderColor={'whiteAlpha.400'} />
							<PlusSquareIcon color={'whiteAlpha.400'} />
							<Divider borderColor={'whiteAlpha.400'} />
							</Flex>}
						</Box>
					</Box>
				);
			})}

            <Divider mt={8} mb={4}/>
                <Box fontSize={'sm'} mx={4} p={2} border={'1px'} borderColor={'whiteAlpha.200'}>
                    <Flex flexDir={'column'}>
                    <Flex justify={'space-between'}>
                    <Flex gap={1} color={Number(slippage()) >= 0 ? 'green.400' : 'red.400'}>
                        <Text>{Number(slippage()) >= 0 ? 'Bonus' : 'Price Impact'}:</Text>
                        <Text>{Number(slippage()) || 0}</Text>
                        <Text>%</Text>
                    </Flex>
                    <Flex gap={1} >
                        <Text>Max Slippage:</Text>
                        {/* <Text>{Number(maxSlippage)}</Text> */}
                        <NumberInput px={0} value={maxSlippage} onChange={(e) => setMaxSlippage(e)} variant={'unstyled'} maxW={'30px'} size={'xs'}>
                        <NumberInputField px={0} fontSize={'sm'} />
                        </NumberInput>
                        <Text>%</Text>
                    </Flex>
                    </Flex>

                    <Divider my={2} />

                    <Flex gap={1}>
                        <Text>Expected Out:</Text>
                        <Text>{tokenFormatter.format(bptOut/1e18)}</Text>
                        <Text>{pool.symbol} LP</Text>
                    </Flex>
                    </Flex>
                </Box>
                <Box className="swapButton" m={4}>
                <Button size={'lg'} isLoading={loading} loadingText='Sign the transaction' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} onClick={tokenToApprove() >= 0 ? approve : deposit}>
                    {validate().message}
                </Button>
			</Box>
        </>
	);
}

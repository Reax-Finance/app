import React, { useState } from "react";

import {
	Flex,
	Text,
	Box,
	Button,
	Divider,
    Tooltip,
	useToast,
} from "@chakra-ui/react";
import Big from "big.js";
import Response from "../_utils/Response";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { getAddress, getContract, send } from "../../../src/contract";
import { defaultChain, dollarFormatter } from "../../../src/const";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useUpdateData from "../../utils/useUpdateData";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { BigNumber, ethers } from "ethers";
import { useBalanceData } from "../../context/BalanceProvider";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { useLendingData } from "../../context/LendingDataProvider";

export default function Redeem({ market, amount, setAmount, amountNumber, isNative, max }: any) {
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const {prices} = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const {getUpdateData} = useUpdateData();
	const handleError = useHandleError(PlatformType.LENDING);

	const { address, isConnected } = useAccount();
	const { chain } = useNetwork();
	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);
	const { nonces, allowances, updateFromTx } = useBalanceData();
	const { markets } = useLendingData();

	const withdraw = async () => {
		setLoading(true);
		const priceFeedUpdateData = await getUpdateData(markets.map((m: any) => m.inputToken.id));
		const _amount = Big(amount).mul(10**market.inputToken.decimals).toFixed(0);

		let tx: any;
		if(isNative){
			const wrapper = await getContract("WrappedTokenGateway", chain?.id ?? defaultChain.id);
			const {v, r, s} = ethers.utils.splitSignature(data!);
			let args = [market.inputToken.id, _amount, address, deadline, v, r, s, []];
			tx = send(wrapper, "withdrawETHWithPermit", args);
		} else {
			const pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
			let args = [
				market.inputToken.id,
				_amount,
				address,
				priceFeedUpdateData
			];
			
			tx = send(pool, "withdraw", args)
		}
		tx.then(async (res: any) => {
			let response = await res.wait();
			updateFromTx(response);
			setAmount('0');
			setApprovedAmount('0')
			setLoading(false);
			toast({
				title: "Withdrawal Successful",
				description: <Box>
					<Text>
						{`You have withdrawn ${amount} ${market.inputToken.symbol}`}
					</Text>
					<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
						<Flex align={'center'} gap={2}>
						<ExternalLinkIcon />
						<Text>View Transaction</Text>
						</Flex>
					</Link>
				</Box>,
				status: "success",
				duration: 10000,
				isClosable: true,
				position: 'top-right'
			})
		}).catch((err: any) => {
			handleError(err);
			setLoading(false);
		});
	};

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const _amount = Big(amount).toFixed(market.inputToken.decimals, 0);
		const value = ethers.utils.parseUnits(_amount, market.inputToken.decimals);
		const wrapperAddress = getAddress("WrappedTokenGateway", chain?.id!);

		signTypedDataAsync({
			domain: {
				name: market.outputToken.name,
				version: "1",
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: market.outputToken.id,
			},
			types: {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" },
				]
			},
			value: {
				owner: address!,
				spender: wrapperAddress,
				value,
				nonce: nonces[market.outputToken.id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(_amount);
				setApproveLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${_amount} ${market.outputToken.symbol}`}
						</Text>
						<Text>
							Please deposit to continue
						</Text>
					</Box>,
					status: "info",
					duration: 10000,
					isClosable: true,
					position: "top-right"
				})
			})
			.catch((err: any) => {
				handleError(err);
				setApproveLoading(false);
			});
	};

	const shouldApprove = () => {
		if(!isNative) return false;
		const wrapperAddress = getAddress("WrappedTokenGateway", chain?.id ?? defaultChain.id);
		const _allowance = allowances[market.outputToken.id]?.[wrapperAddress] ?? 0;
		if (Big(_allowance).add(Number(approvedAmount) * 10 ** (market.inputToken.decimals ?? 18)).eq(0)){
			return true
		} else if(Big(_allowance).add(Number(approvedAmount) * 10 ** (market.inputToken.decimals ?? 18)).lt(
			parseFloat(amount) * 10 ** (market.inputToken.decimals ?? 18) || 1
		)) {
			return true
		}
		return false;
	}

	const validate = () => {
		if(!isConnected){
			return {
				stage: 0,
				message: "Connect Wallet"
			}
		} else if (chain?.unsupported){
			return {
				stage: 0,
				message: "Unsupported Network"
			}
		}
		else if(amountNumber == 0){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (amountNumber > Number(max)) {
			return {
				stage: 0,
				message: "Amount Exceeds Balance"
			}
		} else if (shouldApprove()) {
			return {
				stage: 1,
				message: "Approve Use Of aW"+market.outputToken.symbol
			}
		} else {
			return {
				stage: 3,
				message: "Withdraw"
			}
		}
	}

	return (
		<>
			<Box px={5} py={5}>
				<Box mt={2}>
					<Flex justify="space-between">
							<Flex gap={1}>
						<Tooltip label='Minimum Loan to Value Ratio'>

						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Base LTV
						</Text>
						</Tooltip>
						<Text fontSize={"md"} color="whiteAlpha.600">
						/ 
						</Text>
						<Tooltip label='Account would be liquidated if LTV reaches this threshold' >

						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Liq Threshold
						</Text>
						</Tooltip>
							</Flex>

						<Text fontSize={"md"}>
							{parseFloat(market.maximumLTV)} % /{" "}
							{parseFloat(market.liquidationThreshold)} %
						</Text>
					</Flex>
				</Box>
				
                <Box mt={6} mb={6}>
					<Text fontSize={"sm"} color='whiteAlpha.600' fontWeight={'bold'}>
						Transaction Overview
					</Text>
					<Box
						my={4}
						rounded={8}
					>
						<Flex justify="space-between">
							<Text fontSize={"md"} color="whiteAlpha.600">
								Health Factor
							</Text>
							<Text fontSize={"md"}>
								{Number(pos.debtLimit).toFixed(2)} % {"->"} {Number(pos.collateral) - amount*prices[market.inputToken.id] > 0 ? (Number(pos.debt)/(Number(pos.collateral) - (amount*prices[market.inputToken.id])) * 100).toFixed(1) : '0'} %
							</Text>
						</Flex>
						<Divider my={2} />
						<Flex justify="space-between">
							<Text fontSize={"md"} color="whiteAlpha.600">
								Available to issue
							</Text>
							<Text fontSize={"md"}>
								{dollarFormatter.format(Number(pos.availableToIssue))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) - amount*prices[market.inputToken.id]*market.maximumLTV/100 - Number(pos.debt))}
							</Text>
						</Flex>
					</Box>
				</Box>

				{/* <Box mt={6}>
				{shouldApprove() ? <Button
                    isDisabled={
                        loading ||
                        !isConnected ||
                        chain?.unsupported ||
                        !amount ||
                        amountNumber == 0 ||
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max) 
                    }
                    isLoading={loading}
                    loadingText="Please sign the transaction"
                    bgColor="secondary.400"
                    width="100%"
                    color="white"
                    mt={2}
                    onClick={approve}
                    size="lg"
                    rounded={0}
                    _hover={{
                        opacity: "0.5",
                    }}
                >
                    {isConnected && !chain?.unsupported ? (
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max) ? (
                            <>Insufficient Collateral</>
                        ) : !amount || amountNumber == 0 ? (
                            <>Enter Amount</>
                        ) : (
                            <>Approve aWMNT</>
                        )
                    ) : (
                        <>Please connect your wallet</>
                    )}
                </Button> :
                <Button
                    isDisabled={
                        loading ||
                        !isConnected ||
                        chain?.unsupported ||
                        !amount ||
                        amountNumber == 0 ||
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max) 
                    }
                    isLoading={loading}
                    loadingText="Please sign the transaction"
                    bgColor="transparent"
                    width="100%"
                    color="white"
                    mt={2}
                    onClick={withdraw}
                    size="lg"
                    rounded={0}
                    _hover={{
                        bg: "transparent",
                    }}
                >
                    {isConnected && !chain?.unsupported ? (
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max) ? (
                            <>Insufficient Collateral</>
                        ) : !amount || amountNumber == 0 ? (
                            <>Enter Amount</>
                        ) : (
                            <>Withdraw</>
                        )
                    ) : (
                        <>Please connect your wallet</>
                    )}
                </Button>}
				</Box> */}

				<Box mt={6}>
					{validate().stage <= 2 && <Box mt={2} className={!(validate().stage != 1) ? "primaryButton":'disabledPrimaryButton'}><Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						color='white'
						width="100%"
						onClick={approve}
						size="lg"
						rounded={0}
						bg={'transparent'}
						_hover={{ bg: "transparent" }}
					>
						{validate().message}
					</Button>
					</Box>}
						
					{validate().stage > 0 && <Box mt={2} className={!(validate().stage < 2) ? "primaryButton":'disabledPrimaryButton'} > <Button
						isDisabled={validate().stage < 2}
						isLoading={loading}
						loadingText="Please sign the transaction"
						width="100%"
						color="white"
						rounded={0}
						bg={'transparent'}
						onClick={withdraw}
						size="lg"
						_hover={{ bg: "transparent" }}
					>
						{isConnected && !chain?.unsupported ? (
							Big(amountNumber > 0 ? amount : amountNumber).gt(max) ? (
								<>Insufficient Wallet Balance</>
							) : (
								<>Withdraw</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button></Box>}
				</Box>
			</Box>
		</>
	);
}

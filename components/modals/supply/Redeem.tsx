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
import { formatLendingError } from "../../../src/errors";
import { BigNumber, ethers } from "ethers";
import { useBalanceData } from "../../context/BalanceProvider";

export default function Redeem({ market, amount, setAmount, amountNumber, isNative, max }: any) {
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const toast = useToast();

	const {prices} = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const {getUpdateData} = useUpdateData();

	const withdraw = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const priceFeedUpdateData = await getUpdateData()
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
			
			tx = send(
				pool,
				"withdraw",
				args
			)
		}
		tx.then(async (res: any) => {
			await res.wait();
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
			console.log(err);
			if(err?.reason == "user rejected transaction"){
				toast({
					title: "Transaction Rejected",
					description: "You have rejected the transaction",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else if(formatLendingError(err)){
				toast({
					title: "Transaction Failed",
					description: formatLendingError(err),
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
		});
	};

	const { address, isConnected } = useAccount();
	const { chain } = useNetwork();
	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);
	const { nonces, allowances } = useBalanceData();

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
				console.log("err", JSON.stringify(err));
				if(err?.cause?.reason == "user rejected signing"){
					toast({
						title: "Signature Rejected",
						description: "You have rejected the signature",
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

	return (
		<>
			<Box bg={"bg2"} px={5} py={5}>
				<Box mt={4}>
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
				
                <Box>
					<Text mt={8} fontSize={"sm"} color='whiteAlpha.600' fontWeight={'bold'}>
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
								{Number(pos.debtLimit).toFixed(1)} % {"->"} {Number(pos.collateral) - amount*prices[market.inputToken.id] > 0 ? (Number(pos.debt)/(Number(pos.collateral) - (amount*prices[market.inputToken.id])) * 100).toFixed(1) : '0'} %
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
                    bgColor="secondary.400"
                    width="100%"
                    color="white"
                    mt={2}
                    onClick={withdraw}
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
                            <>Withdraw</>
                        )
                    ) : (
                        <>Please connect your wallet</>
                    )}
                </Button>}

				<Response
					response={response}
					message={message}
					hash={hash}
					confirmed={confirmed}
				/>
			</Box>
		</>
	);
}

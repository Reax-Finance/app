import React, { useState } from "react";
import {
	Flex,
	Text,
	Box,
	Button,
	Divider,
	Tooltip,
} from "@chakra-ui/react";
import { ADDRESS_ZERO, defaultChain, dollarFormatter, numOrZero } from '../../../src/const';
import Big from "big.js";
import Response from "../_utils/Response";
import { useAccount, useBalance, useNetwork, useSignTypedData } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { getContract, send } from "../../../src/contract";
import { ExternalLinkIcon, InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import Link from "next/link";
import InfoFooter from "../_utils/InfoFooter";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { useLendingData } from "../../context/LendingDataProvider";
import { PARTNER_ASSETS, PARTNER_WARNINGS } from "../../../src/partner";
import useHandleError, { PlatformType } from "../../utils/useHandleError";

export default function Supply({ market, amount, setAmount, amountNumber, isNative, max }: any) {
	const [approveLoading, setApproveLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const { chain } = useNetwork();
	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const { toggleIsCollateral } = useLendingData();

	const { walletBalances, nonces, allowances, updateFromTx, addNonce } = useBalanceData();

	// stage: 0: before approval, 1: approval pending, 2: after approval, 3: approval not needed
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
		} 
		// else if(Big(amountNumber).mul(10**market.inputToken.decimals).add(collateral.totalDeposits).gt(collateral.cap)){
		// 	return {
		// 		stage: 0,
		// 		message: "Amount Exceeds Cap"
		// 	}
		// }
		else if (!market || !allowances[market.inputToken.id]?.[market.protocol._lendingPoolAddress]) {
			return {
				stage: 0,
				message: "Loading..."
			}
		}
		
		// check allowance if not native
		if (!isNative) {
			if (Big(allowances[market.inputToken.id]?.[market.protocol._lendingPoolAddress]).add(Number(approvedAmount) * 10 ** (market.inputToken.decimals ?? 18)).eq(0)){
				return {
					stage: 1,
					message: "Approve Use Of" + " " + market.inputToken.symbol
				}
			} else if(Big(allowances[market.inputToken.id]?.[market.protocol._lendingPoolAddress]).add(Number(approvedAmount) * 10 ** (market.inputToken.decimals ?? 18)).lt(
				parseFloat(amount) * 10 ** (market.inputToken.decimals ?? 18) || 1
			)) {
				return {
					stage: 1,
					message: "Approve Use Of" + " " + market.inputToken.symbol
				}
			}
		} else {
			return {
				stage: 3,
				message: "Deposit"
			}
		}

		if(Big(allowances[market.inputToken.id]?.[market.protocol._lendingPoolAddress]).gt(
			parseFloat(amount) * 10 ** (market.inputToken.decimals ?? 18) || 1
		)) {
			return {
				stage: 3,
				message: ""
			}
		}

		return {
			stage: 2,
			message: `Approved ${market.inputToken.symbol} For Use`
		}
	}

	const toast = useToast();

	const handleError = useHandleError(PlatformType.LENDING);

	const deposit = async () => {
		setLoading(true);
		const pool = await getContract("LendingPool", chain?.id ?? defaultChain.id, market.protocol._lendingPoolAddress)
		const _amount = ethers.utils.parseUnits(Big(amount).toFixed(market.inputToken.decimals, 0), market.inputToken.decimals); 

		let tx;
		if (isNative) {
			const wrapper = await getContract("WrappedTokenGateway", chain?.id ?? defaultChain.id);
			tx = send(
				wrapper,
				"depositETH",
				[market.inputToken.id, address, 0],
				_amount.toString()
			);
		} else {
			if(Number(approvedAmount) > 0){
				const {v, r, s} = ethers.utils.splitSignature(data!);
				tx = send(
					pool,
					"supplyWithPermit",
					[market.inputToken.id, _amount, address, 0, deadline, v, r, s]
				);
			} else {
				tx = send(
					pool,
					"supply",
					[market.inputToken.id, _amount, address]
				);
			}
		}
		tx.then(async (res: any) => {
			const response = await res.wait(1);
			updateFromTx(response);
			setAmount('');
			setApprovedAmount('0');
			setData(null);
			setDeadline('0')
			if(Number(approvedAmount) > 0){
				addNonce(market.inputToken.id, '1');
			}

			// supplying for first time
			if(!walletBalances[market.outputToken.id] || Number(walletBalances[market.outputToken.id]) == 0) toggleIsCollateral(market.id);
			
			setLoading(false);
			toast({
				title: "Deposit Successful",
				description: <Box>
					<Text>
						{`You have deposited ${Big(_amount.toString()).div(10**market.inputToken.decimals).toString()} ${market.inputToken.symbol}`}
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
				position: "top-right"
			});
		}).catch((err: any) => {
			handleError(err);
			setLoading(false);
		});
	};

	const approveTx = async () => {
		setApproveLoading(true);
		const collateralContract = await getContract("MockToken", chain?.id ?? defaultChain.id, market.inputToken.id);
		send(
			collateralContract,
			"approve",
			[
				market.protocol._lendingPoolAddress,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			const response = await res.wait(1);
			updateFromTx(response);
			setApproveLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved ${market.inputToken.symbol}`}
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
				position: "top-right"
			})
		}).catch((err: any) => {
			handleError(err);
			setApproveLoading(false);
		})
	}

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const _amount = Big(amount).toFixed(market.inputToken.decimals, 0);
		const value = ethers.utils.parseUnits(_amount, market.inputToken.decimals);
		signTypedDataAsync({
			domain: {
				name: market.inputToken.name,
				version: "1",
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: market.inputToken.id,
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
				spender: market.protocol._lendingPoolAddress,
				value,
				nonce: nonces[market.inputToken.id] ?? 0,
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
							{`for ${_amount} ${market.inputToken.symbol}`}
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

	const { address, isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const partner = Object.keys(PARTNER_ASSETS).map((key: string) => PARTNER_ASSETS[key].includes(market.inputToken.symbol) ? key : null).filter((key: string | null) => key != null)[0];

	return (
		<>
			<Box px={5} pt={5} pb={5}>
				<Box mt={2}>
					{/* <Flex justify="space-between">
						<Tooltip label='Max capacity to have this asset as collateral'>
						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Capacity
						</Text>
						</Tooltip>

						<Text fontSize={"md"}>
							{collateral.totalDeposit}
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.totalDeposits ?? 0,
										market.inputToken.decimals
									)
								)
							)}{" "}
							/{" "}
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.cap,
										market.inputToken.decimals
									)
								)
							)}
						</Text>
					</Flex> 
					<Divider my={2} /> */}

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
					<Text fontSize={"sm"} color="whiteAlpha.600" fontWeight={'bold'}>
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
								{Big(pos.debtLimit).toFixed(2)} % 
								{" -> "} 
								{Big(pos.collateral).add(Number(amount)*prices[market.inputToken.id]).gt(0) ? 
									Big(pos.debt).add(pos.stableDebt).div(Big(pos.collateral).add(Number(amount)*prices[market.inputToken.id])).mul(100).toFixed(1) 
								: '0'} %
							</Text>
						</Flex>
						<Divider my={2} />
						<Flex justify="space-between">
							<Text fontSize={"md"} color="whiteAlpha.600">
								Available to issue
							</Text>
							<Text fontSize={"md"}>{dollarFormatter.format(Number(pos.availableToIssue))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) + Number(amount)*prices[market.inputToken.id]*market.maximumLTV/100 - (Number(pos.debt) + Number(pos.stableDebt)))}</Text>
						</Flex>
					</Box>
				</Box>
				
				<Box mt={6}>
					{validate().stage <= 2 && <Box mt={2} className={!(validate().stage != 1) ? "secondaryButton":'disabledSecondaryButton'}><Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						color='white'
						width="100%"
						onClick={market.inputToken.isPermit ? approve : approveTx}
						size="lg"
						rounded={0}
						bg={'transparent'}
						_hover={{ bg: "transparent" }}
					>
						{validate().message}
					</Button>
					</Box>}
						
					{validate().stage > 0 && <Box mt={2} className={!(validate().stage < 2) ? "secondaryButton":'disabledSecondaryButton'} > <Button
						isDisabled={validate().stage < 2}
						isLoading={loading}
						loadingText="Please sign the transaction"
						width="100%"
						color="white"
						rounded={0}
						bg={'transparent'}
						onClick={deposit}
						size="lg"
						_hover={{ bg: "transparent" }}
					>
						{isConnected && !activeChain?.unsupported ? (
							Big(amountNumber > 0 ? amount : amountNumber).gt(max) ? (
								<>Insufficient Wallet Balance</>
							) : (
								<>Deposit</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button></Box>}
				</Box>

				{partner && PARTNER_WARNINGS[partner] && <InfoFooter message={PARTNER_WARNINGS[partner]} />}

				{/* <Response
					response={response}
					message={message}
					hash={hash}
					confirmed={confirmed}
				/> */}
			</Box>
		</>
	);
}

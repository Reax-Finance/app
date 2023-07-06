import React, { useState } from "react";

import {
	Flex,
	Text,
	Box,
	Button,
	Divider,
	Tooltip,
	Switch,
} from "@chakra-ui/react";
import { ADDRESS_ZERO, defaultChain, dollarFormatter, numOrZero } from '../../../src/const';
import Big from "big.js";
import Response from "../_utils/Response";
import { useAccount, useBalance, useNetwork, useSignTypedData } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext, useAppData } from "../../context/AppDataProvider";
import { compactTokenFormatter } from "../../../src/const";
import { ExternalLinkIcon, InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import Link from "next/link";
import InfoFooter from "../_utils/InfoFooter";
import { useBalanceData } from "../../context/BalanceProvider";
import { PARTNER_ASSETS, PARTNER_WARNINGS } from "../../../src/partner";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import useHandleError, { PlatformType } from "../../utils/useHandleError";

export default function Deposit({ collateral, amount, setAmount, amountNumber, isNative }: any) {

	const [approveLoading, setApproveLoading] = useState(false);
	const [loading, setLoading] = useState(false);

	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const { chain } = useNetwork();
	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveMax, setApproveMax] = useState(false);

	const {position} = useSyntheticsData();
	const pos = position();

	const {
		pools,
		tradingPool,
		updateFromTx: updateFromSynthTx
	} = useAppData();

	const { walletBalances, nonces, allowances, addAllowance, updateFromTx, addNonce } = useBalanceData();

	const max = () => {
		return Big(
			(isNative ? walletBalances[ADDRESS_ZERO] : walletBalances[collateral.token.id]) ?? 0
		).div(10**collateral.token.decimals).toString();
	};

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
		} else if (amountNumber > Number(max())) {
			return {
				stage: 0,
				message: "Amount Exceeds Balance"
			}
		} 
		else if(Big(amountNumber).mul(10**collateral.token.decimals).add(collateral.totalDeposits).gt(collateral.cap)){
			return {
				stage: 0,
				message: "Amount Exceeds Cap"
			}
		}
		else if (!collateral || !allowances[collateral.token.id]?.[pools[tradingPool].id]) {
			return {
				stage: 0,
				message: "Loading..."
			}
		}
		
		// check allowance if not native
		if (!isNative) {
			if (Big(allowances[collateral.token.id]?.[pools[tradingPool].id]).add(Number(approvedAmount) * 10 ** (collateral.token.decimals ?? 18)).eq(0)){
				return {
					stage: 1,
					message: "Approve Use Of" + " " + collateral.token.symbol
				}
			} else if (Big(allowances[collateral.token.id]?.[pools[tradingPool].id]).add(Number(approvedAmount) * 10 ** (collateral.token.decimals ?? 18)).lt(
				parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
			)) {
				return {
					stage: 1,
					message: "Approve Use Of" + " " + collateral.token.symbol
				}
			}
		} else {
			return {
				stage: 3,
				message: "Deposit"
			}
		}

		if(Big(allowances[collateral.token.id]?.[pools[tradingPool].id]).gt(
			parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
		)) {
			return {
				stage: 3,
				message: ""
			}
		}

		return {
			stage: 2,
			message: `Approved ${collateral.token.symbol} For Use`
		}
	}

	const toast = useToast();
	const handleError = useHandleError(PlatformType.SYNTHETICS);

	const deposit = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain?.id ?? defaultChain.id, poolId);
		const _amount = ethers.utils.parseUnits(Big(amount).toFixed(collateral.token.decimals, 0), collateral.token.decimals); 

		let tx;
		if (isNative) {
			tx = send(
				pool,
				"depositETH",
				[
					address
				],
				_amount.toString()
			);
		} else {
			if(Number(approvedAmount) > 0){
				const {v, r, s} = ethers.utils.splitSignature(data!);
				tx = send(
					pool,
					"depositWithPermit",
					[
						collateral.token.id,
						_amount,
						address,
						approveMax ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(approvedAmount.toString(), collateral.token.decimals),
						deadline,
						v,
						r,
						s
					]
				);
			} else {
				tx = send(
					pool,
					"deposit",
					[
						collateral.token.id,
						_amount,
						address
					]
				);
			}
		}
		tx.then(async (res: any) => {
			const response = await res.wait();
			updateFromSynthTx(response);
			updateFromTx(response);
			if(Number(approvedAmount) > 0){
				addNonce(collateral.token.id, '1');
			}
			setConfirmed(true);
			setAmount('0');
			setApproveMax(false);
			setApprovedAmount('0');
			
			setLoading(false);
			toast({
				title: "Deposit Successful",
				description: <Box>
					<Text>
				{`You have deposited ${amount} ${collateral.token.symbol}`}
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
		const collateralContract = await getContract("MockToken", chain?.id ?? defaultChain.id, collateral.token.id);
		send(
			collateralContract,
			"approve",
			[
				pools[tradingPool].id,
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
				{`You have approved ${collateral.token.symbol}`}
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
			console.log(err);
			handleError(err);
			setApproveLoading(false);
		})
	}

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const _amount = Big(amount).toFixed(collateral.token.decimals, 0);
		const value = approveMax ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(_amount, collateral.token.decimals);
		signTypedDataAsync({
			domain: {
				name: collateral.token.name,
				version: "1",
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: collateral.token.id,
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
				spender: pools[tradingPool].id,
				value,
				nonce: nonces[collateral.token.id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(approveMax ? (Number.MAX_SAFE_INTEGER).toString() : _amount);
				setApproveLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${_amount} ${collateral.token.symbol}`}
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
				handleError(err);
				setApproveLoading(false);
			});
	};

	const { address, isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();
	const { prices } = usePriceData();

	const partner = Object.keys(PARTNER_ASSETS).map((key: string) => PARTNER_ASSETS[key].includes(collateral.token.symbol) ? key : null).filter((key: string | null) => key != null)[0];

	return (
		<>
			<Box bg={"bg2"} px={5} pt={5} pb={5}>
				<Box mt={4}>
					<Flex justify="space-between">
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
										collateral.token.decimals
									)
								)
							)}{" "}
							/{" "}
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.cap,
										collateral.token.decimals
									)
								)
							)}
						</Text>
					</Flex>
					<Divider my={2} />

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
							{parseFloat(collateral.baseLTV) / 100} % /{" "}
							{parseFloat(collateral.liqThreshold) / 100} %
						</Text>
					</Flex>
				</Box>

					<Box>
						<Text mt={8} fontSize={"sm"} color="whiteAlpha.600" fontWeight={'bold'}>
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
								<Text fontSize={"md"}>{(Number(pos.debtLimit) ?? 0).toFixed(2)} % {"->"} {numOrZero((Number(pos.debt) ?? 0) /((Number(pos.collateral) ?? 0) + (amount*prices[collateral.token.id])) * 100).toFixed(2)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="whiteAlpha.600">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(Number(pos.availableToIssue) ?? 0)} {"->"} {dollarFormatter.format((Number(pos.adjustedCollateral) ?? 0) + (amount*(prices[collateral.token.id] ?? 0)*collateral.baseLTV/10000) - (Number(pos.debt) ?? 0))}</Text>
							</Flex>
						</Box>
					</Box>
					{collateral.token.isPermit && (validate().stage == 1 && <Tooltip label='Approve Max will approve unlimited amount. This will save gas fees in the future.'>
					<Flex align={'center'} mb={2} mt={6} color="whiteAlpha.600" gap={2}>
						<Text fontSize={"sm"} color="whiteAlpha.600" fontWeight={'bold'} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Approve Max
						</Text>
						<Switch size={'sm'} colorScheme='primary' onChange={() => setApproveMax(!approveMax)} isChecked={approveMax} />
					</Flex>
					</Tooltip>)
					}

				
					{validate().stage <= 2 && <Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						bg={"primary.400"}
						colorScheme={'primary'}
						color='white'
						mt={2}
						width="100%"
						onClick={collateral.token.isPermit ? approve : approveTx}
						size="lg"
						rounded={0}
					>
						{validate().message}
					</Button>}
					{validate().stage > 0 && <Button
						isDisabled={validate().stage < 2}
						isLoading={loading}
						loadingText="Please sign the transaction"
						bg={"primary.400"}
						colorScheme={'primary'}
						width="100%"
						color="white"
						rounded={0}
						mt={2}
						onClick={deposit}
						size="lg"
					>
						{isConnected && !activeChain?.unsupported ? (
							Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ? (
								<>Insufficient Wallet Balance</>
							) : (
								<>Deposit</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button>}


					{partner && PARTNER_WARNINGS[partner] && <InfoFooter message={PARTNER_WARNINGS[partner]} />}

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

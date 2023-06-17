import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Divider,
	Link,
	Tooltip,
	Select
} from "@chakra-ui/react";

import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { ADDRESS_ZERO, PYTH_ENDPOINT, defaultChain, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";
import { ExternalLinkIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { BigNumber, ethers } from "ethers";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceContext";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { formatLendingError } from "../../../src/errors";

const Repay = ({ market, amount, setAmount, amountNumber, isNative, debtType, setDebtType, max }: any) => {

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const { address } = useAccount();
	const { chain } = useNetwork();
	const toast = useToast();

	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();
	const {walletBalances, addAllowance, nonces, allowances, updateBalance} = useBalanceData();

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
		} else if(amountNumber == 0){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (amountNumber > Number(max)) {
			return {
				stage: 0,
				message: "Amount Exceeds Debt"
			}
		}
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
				message: "Repay"
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

	const repay = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");
		
		let pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
		let value = Big(amount)
		.times(10 ** market.inputToken.decimals)
		.toFixed(0);
		

		let tx;
		if (isNative) {
			const wrapper = await getContract("WrappedTokenGateway", chain?.id ?? defaultChain.id);
			let args = [market.inputToken.id, value, debtType, address];
			tx = send(wrapper, "repayETH", args, value);
		} else {
			if(Number(approvedAmount) > 0){
				const {v, r, s} = ethers.utils.splitSignature(data!);
				tx = send(
					pool,
					"repayWithPermit",
					[
						market.inputToken.id,
						value,
						debtType,
						address,
						deadline,
						v,
						r,
						s
					]
				);
			} else {
				tx = send(
					pool,
					"repay",
					[
						market.inputToken.id,
						value,
						debtType,
						address
					]
				);
			}
		}
		
		tx.then(async (res: any) => {
			await res.wait()
			setAmount('0');
			setConfirmed(true);

			setLoading(false);
			toast({
				title: "Repayment Successful!",
				description: <Box>
					<Text>
				{`You have repaid ${amount} ${market.inputToken.symbol}`}
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
		})
		.catch((err: any) => {
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
			const decodedLogs = response.logs.map((log: any) =>
				{
					try {
						return collateralContract.interface.parseLog(log)
					} catch (e) {
						console.log(e)
					}
				}
			);
			console.log("decodedLogs", decodedLogs);
			let log: any = {};
			for(let i in decodedLogs){
				if(decodedLogs[i]){
					if(decodedLogs[i].name == "Approval"){
						log = decodedLogs[i];
					}
				}
			}
			addAllowance(market.inputToken.id, market.protocol._lendingPoolAddress, log.args[2].toString());
			setApproveLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved ${Big(log.args[2].toString()).div(10**market.inputToken.decimals).toString()} ${market.inputToken.symbol}`}
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
			if(err?.reason == "user rejected transaction"){
				toast({
					title: "Transaction Rejected",
					description: "You have rejected the transaction",
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

	const { isConnected } = useAccount();

	return (
		<Box px={5} pb={5} pt={0.5} bg='bg2'>

<Box mt={6}>
				<Flex align={'center'} justify={'space-between'} gap={'50'}>
					<Text color="whiteAlpha.600">Interest Rate</Text>
					<Select borderColor={'whiteAlpha.200'} maxW={'50%'} rounded={0} value={debtType} onChange={(e) => setDebtType(e.target.value) }>
					<option value='2'>Variable {(Number(market.rates.filter((rate: any) => rate.side == 'BORROWER' && rate.type == 'VARIABLE')[0]?.rate ?? 0)).toFixed(2)} %</option>
					<option value='1'>Stable {(Number(market.rates.filter((rate: any) => rate.side == 'BORROWER' && rate.type == 'STABLE')[0]?.rate ?? 0)).toFixed(2)} %</option>
					</Select>
				</Flex>
			</Box>
				<Box  >
						<Box>
						<Text mt={6} fontSize={"sm"} color='whiteAlpha.600' fontWeight={'bold'}>
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
								<Text fontSize={"md"}>{Number(pos.debtLimit).toFixed(1)} % {"->"} {((Number(pos.debt + pos.stableDebt) - (amount*prices[market.inputToken.id])) / Number(pos.collateral) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="whiteAlpha.600">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(Number(pos.availableToIssue))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) + Number(amount*prices[market.inputToken.id] ?? 0) - Number(pos.debt + pos.stableDebt))}</Text>
							</Flex>
						</Box>
					</Box>

					<Box pt={2}></Box>

						{(validate().stage == 1|| validate().stage == 0) ? <Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						colorScheme={'primary'}
						bg={"primary.400"}
						color='white'
						mt={2}
						width="100%"
						onClick={market.inputToken.isPermit ? approve : approveTx}
						size="lg"
						rounded={0}
						leftIcon={
							validate().stage ==1 ? <Tooltip label='
								Approve tokens to be used by the protocol.
							'>
							<InfoOutlineIcon/>
							</Tooltip> : <></>
						}
					>
						{validate().message}
					</Button> : <Button
						isDisabled={validate().stage == 1}
						isLoading={loading}
						loadingText="Please sign the transaction"
						bgColor={validate().stage == 1 ? "primary.400" : "primary.400"}
						width="100%"
						color="white"
						rounded={0}
						mt={2}
						onClick={repay}
						size="lg"
					>
						{isConnected && !chain?.unsupported ? (
							Big(amountNumber > 0 ? amount : amountNumber).gt(max) ? (
								<>Insufficient Wallet Balance</>
							) : !amount || amountNumber == 0 ? (
								<>Enter Amount</>
							) : (
								<>Repay</>
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
		</Box>
	);
};

export default Repay;

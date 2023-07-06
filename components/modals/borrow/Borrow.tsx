import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	useToast,
	Link,
	Select,
} from "@chakra-ui/react";
import { getAddress, getContract, send } from "../../../src/contract";
import { useContext, useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { WETH_ADDRESS, defaultChain, dollarFormatter, numOrZero, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceProvider";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { usePriceData } from "../../context/PriceContext";
import useHandleError, { PlatformType } from "../../utils/useHandleError";

const Borrow = ({ market, amount, setAmount, amountNumber, isNative, debtType, setDebtType, max }: any) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const [referral, setReferral] = useState<string | null>(null);

	const { isConnected, address } = useAccount();
	const { chain } = useNetwork();
	const {getUpdateData} = useUpdateData();
	const {updateFromTx, walletBalances, allowances} = useBalanceData();
	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const toast = useToast();

	const handleError = useHandleError(PlatformType.LENDING);

	const borrow = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		let value = Big(amount)
			.times(10 ** market.inputToken.decimals)
			.toFixed(0);
		
		const priceFeedUpdateData = await getUpdateData();

		let tx;
		if(isNative){
			const wrapper = await getContract("WrappedTokenGateway", chain?.id ?? defaultChain.id);
			let args = [market.inputToken.id, value, debtType, 0, priceFeedUpdateData];
			tx = send(wrapper, "borrowETH", args);
		} else {
			let pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);			
			let args = [
				market.inputToken.id, 
				value, 
				debtType,
				0,
				address,
				priceFeedUpdateData
			];
			tx = send(pool, "borrow", args);
		}

		tx.then(async (res: any) => {
			updateFromTx(await res.wait());
			setAmount("0");
			setLoading(false);
			toast({
				title: "Borrow Successful",
				description: <Box>
					<Text>
						{`You have borrowed ${amount} ${market.inputToken.symbol}`}
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
				position: "top-right",
			})
		})
		.catch((err: any) => {
			handleError(err)
			setLoading(false);
		});
	};

	const shouldApprove = () => {
		if(!isNative) return false;
		const wrapperAddress = getAddress("WrappedTokenGateway", chain?.id ?? defaultChain.id);
		const _allowance = allowances[market._vToken.id]?.[wrapperAddress] ?? 0;
		if (Big(_allowance).eq(0) || Big(_allowance).lt(
			parseFloat(amount) * 10 ** (market.inputToken.decimals ?? 18) || 1
		)) {
			return true
		}
		return false;
	}

	const approveTx = async () => {
		setLoading(true);
		const contract = await getContract("VToken", chain?.id ?? defaultChain.id, market._vToken.id);
		const wrapperAddress = getAddress("WrappedTokenGateway", chain?.id ?? defaultChain.id);
		send(
			contract,
			"approveDelegation",
			[
				wrapperAddress,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			await res.wait();
			setLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved borrow for ${market.inputToken.symbol}`}
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
			setLoading(false);
		})
	}

	return (
		<Box px={5} pb={5} pt={0.5} bg="bg2">
			<Box mt={6}>
				<Flex align={'center'} justify={'space-between'} gap={'50'}>
					<Text color="whiteAlpha.600">Interest Rate</Text>
					<Select borderColor={'whiteAlpha.200'} maxW={'50%'} rounded={0} value={debtType} onChange={(e) => setDebtType(e.target.value) }>
						<option value='2'>Variable {(Number(market.rates.filter((rate: any) => rate.side == 'BORROWER' && rate.type == 'VARIABLE')[0]?.rate ?? 0)).toFixed(2)} %</option>
						<option value='1'>Stable {(Number(market.rates.filter((rate: any) => rate.side == 'BORROWER' && rate.type == 'STABLE')[0]?.rate ?? 0)).toFixed(2)} %</option>
					</Select>
				</Flex>
			</Box>

			<Box>
				<Text
					mt={6}
					fontSize={"sm"}
					color="whiteAlpha.600"
					fontWeight={"bold"}
				>
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
							{(Big(pos.collateral).gt(0) ? 
								Big(100).mul(pos.debt ?? 0).div(pos.collateral ?? 0).toNumber() : 0).toFixed(1)}{" "}
							% {"->"}{" "}
							{numOrZero(
								(Big(pos.collateral ?? 0).gt(0) ? Big(pos.debt ?? 0).add(Big(amount || 0).mul(prices[market.inputToken.id] ?? 0)).div(pos.collateral)
									.toNumber() * 100 : 0)
							).toFixed(1)}
							%
						</Text>
					</Flex>
					<Divider my={2} />
					<Flex justify="space-between">
						<Text fontSize={"md"} color="whiteAlpha.600">
							Available to issue
						</Text>
						<Text fontSize={"md"}>
							{dollarFormatter.format(
								Big(pos.adjustedCollateral ?? 0).sub(pos.debt ?? 0).toNumber()
							)}{" "}
							{"->"}{" "}
							{dollarFormatter.format(
								Big(pos.adjustedCollateral ?? 0).sub(Big(amount || 0).mul(prices[market.inputToken.id] ?? 0)).sub(pos.debt ?? 0).toNumber()
							)}
						</Text>
					</Flex>
				</Box>
			</Box>

			<Flex mt={2} justify="space-between"></Flex>
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
                    bgColor="primary.400"
                    width="100%"
                    color="white"
                    mt={2}
                    onClick={approveTx}
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
                            <>Approve</>
                        )
                    ) : (
                        <>Please connect your wallet</>
                    )}
                </Button> : <Button
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
				bgColor="primary.400"
				width="100%"
				color="white"
				mt={4}
				onClick={borrow}
				size="lg"
				rounded={0}
				_hover={{
					opacity: "0.5",
				}}
			>
				{isConnected ? (
					Big(amountNumber > 0 ? amount : amountNumber).gt(max) ? (
						<>Insufficient Collateral</>
					) : !amount || amountNumber == 0 ? (
						<>Enter Amount</>
					) : (
						<>Borrow</>
					)
				) : <>Connect Wallet</>}
			</Button>}

			<Response
				response={response}
				message={message}
				hash={hash}
				confirmed={confirmed}
			/>
		</Box>
	);
};

export default Borrow;

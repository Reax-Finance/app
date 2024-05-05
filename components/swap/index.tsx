import { Box, useDisclosure, Text, Flex, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getContract, send, estimateGas } from "../../src/contract";
import { useAccount, useSignTypedData } from "wagmi";
import Head from "next/head";
import TokenSelector from "./TokenSelector";
import { ADDRESS_ZERO, defaultChain, tokenFormatter } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { useToast } from '@chakra-ui/react';
import useUpdateData from "../utils/useUpdateData";
import { usePriceData } from "../context/PriceContext";
import SwapLayout from "./SwapLayout";
import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { parseInput } from "../utils/number";
import useHandleError, { PlatformType } from "../utils/useHandleError";
import { useAppData } from "../context/AppDataProvider";
import { useRouter } from "next/router";
import useApproval from "../context/useApproval";

interface ApprovalStep {
	type: "APPROVAL" | "PERMIT";
	isCompleted: boolean;
	data: any;
	execute: any;
}

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(2);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState('');
	const [outputAmount, setOutputAmount] = useState('');
	const [gas, setGas] = useState(0);
	const [error, setError] = useState('');
	
	const { prices } = usePriceData();
	const { isConnected, address, chain } = useAccount();

	const {
		isOpen: isInputOpen,
		onOpen: onInputOpen,
		onClose: onInputClose,
	} = useDisclosure();
	const {
		isOpen: isOutputOpen,
		onOpen: onOutputOpen,
		onClose: onOutputClose,
	} = useDisclosure();

	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const [swapData, setSwapData] = useState<any>(null);
	const [data, setData] = useState<any>(null);
	const [maxSlippage, setMaxSlippage] = useState(0.5);
	const [deadline_m, setDeadline_m] = useState(20);
	const { getUpdateData, getUpdateFee } = useUpdateData();
	const [approvedAmount, setApprovedAmount] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [deadline, setDeadline] = useState('0');
	const [nonce, setNonce] = useState(-1);

	const { approve } = useApproval({});

	const router = useRouter();
	
	const { liquidityData } = useAppData();
	
    const tokens = liquidityData ? liquidityData.synths.concat([{...liquidityData.lpToken, price: liquidityData.lpToken.price.div('10000000000')}]) : [];
	const inToken = tokens[inputAssetIndex];
	const outToken = tokens[outputAssetIndex];
	useEffect(() => {
		if (tokens.length > 1) {
			const inAssetIndex = tokens.findIndex((token) => token.id.toLowerCase() == router.query?.inCurrency?.toString().toLowerCase());
			const outAssetIndex = tokens.findIndex((token) => token.id.toLowerCase() == router.query?.outCurrency?.toString().toLowerCase());
			if(inAssetIndex >= 0) setInputAssetIndex(inAssetIndex);
			if(outAssetIndex >= 0) setOutputAssetIndex(outAssetIndex);
		}
	}, [tokens])
	
	const handleError = useHandleError(PlatformType.DEX);

	useEffect(() => {
		if(!inToken) return;
		const contract = getContract("ERC20Permit", inToken.id);
		contract.nonces(address).then((nonce: any) => {
			setNonce(nonce)
		}).catch((err: any) => {
			setNonce(-1)
		})
	}, [inputAssetIndex])

	const updateInputAmount = (value: any) => {
		value = parseInput(value);
		setInputAmount(value);
		if (isNaN(Number(value)) || Number(value) == 0) {
			setOutputAmount('0');
			return;
		}
		setOutputAmount(Big(value).mul(inToken.price.toString()).div(outToken.price.toString()).toString());
	};

	const updateOutputAmount = (value: any) => {
		value = parseInput(value);
		setOutputAmount(value);
		if (isNaN(Number(value)) || Number(value) == 0) return;
		setInputAmount(Big(value).mul(outToken.price.toString()).div(inToken.price.toString()).toString());
	};

	const onInputTokenSelected = (e: number) => {
		if (outputAssetIndex == e) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e);
		router.query.inCurrency = tokens[e].id;
		router.push(router);
		setInputAmount("" as any);
		setOutputAmount('0');
		setApprovedAmount('0');
		setData(null);
		onInputClose();
		setSwapData(null);
		setApprovedAmount('0');
		setDeadline('0');
		setData(null);
		setGas(0);
	};
	
	const onOutputTokenSelected = (e: number) => {
		if (inputAssetIndex == e) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e);
		router.query.outCurrency = tokens[e].id;
		router.push(router);
		setInputAmount('');
		setOutputAmount('0');
		onOutputClose();
		setSwapData(null);
		setApprovedAmount('0');
		setDeadline('0');
		setData(null);
		setGas(0);
	};

	const switchTokens = () => {
		let temp = inputAssetIndex;
		router.query.inCurrency = tokens[outputAssetIndex].id;
		router.query.outCurrency = tokens[temp].id;
		router.push(router);
		setInputAssetIndex(outputAssetIndex);
		setOutputAssetIndex(temp);
		setInputAmount('');
		setOutputAmount('0');
		setSwapData(null);
		setApprovedAmount('0');
		setDeadline('0');
		setData(null);
		setGas(0);
	};

	const exchange = async () => {
		setLoading(true);
		const router = getContract("ReaxRouter", process.env.NEXT_PUBLIC_ROUTER_ADDRESS!);
		const updateData = await getUpdateData();
		const updateFee = await getUpdateFee();
		const calls = [];
		calls.push(router.interface.encodeFunctionData("updateOracleData", [updateData]));
		if(Big(approvedAmount ?? 0).gt(0)){
			const { v, r, s } = ethers.utils.splitSignature(data);
			calls.push(router.interface.encodeFunctionData("permit", [address, router.address, inToken.id, approvedAmount, deadline, v, r, s]));
		} 
		calls.push(router.interface.encodeFunctionData("swap", [inToken.id, outToken.id, Big(inputAmount).mul(Big(10).pow(inToken.decimals)).toFixed(0), address]));

		send(router, "multicall", [calls], updateFee)
			.then(async (res: any) => {
				await res.wait();
				setLoading(false);
				toast({
					title: 'Transaction submitted',
					description: <Box>
						<Text>
							{`You have swapped ${inputAmount} ${inToken?.symbol} for ${outToken?.symbol}`}
						</Text>
						<Link href={defaultChain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
							<Flex align={'center'} gap={2}>
							<ExternalLinkIcon />
							<Text>View Transaction</Text>
							</Flex>
						</Link>
					</Box>,
					status: 'success',
					duration: 5000,
					isClosable: true,
					position: 'top-right'
				})
				setInputAmount('');
				setOutputAmount('0');
				setSwapData(null);
				if(Big(approvedAmount ?? 0).gt(0)){
					setApprovedAmount('0');
					setDeadline('0');
					setData(null);
					setNonce((prev) => prev + 1);
				}
			})
			.catch((err: any) => {
				setLoading(false);
				handleError(err)
			})
	};

	const getSteps = () => {
		let steps: ApprovalStep[] = [];
		if(!inToken) return steps;
		if(inToken.id !== ADDRESS_ZERO && Big(approvedAmount).add(inToken.approvalToRouter.toString()).lt(Big(Number(inputAmount) || 0).mul(10**inToken.decimals))){
			if(nonce >= 0) steps.push({
				type: "PERMIT",
				isCompleted: false,
				data: {
					amount: inputAmount,
					token: inToken
				},
				execute: () => approve(inToken, process.env.NEXT_PUBLIC_ROUTER_ADDRESS!)
			})
			else {
				steps.push({
					type: "APPROVAL",
					isCompleted: false,
					data: {
						amount: inputAmount,
						token: inToken
					},
					execute: () => approve(inToken, process.env.NEXT_PUBLIC_ROUTER_ADDRESS!)
				})
			}
		}
		return steps;
	};

	const validate = () => {
		if(!isConnected) return {valid: false, message: "Please connect your wallet"}
		else if (chain?.id !== defaultChain.id) return {valid: false, message: "Unsupported Chain"}
		else if (loading) return {valid: false, message: "Loading..."}
		else if (error.length > 0) return {valid: false, message: error}
		else if (Number(inputAmount) <= 0) return {valid: false, message: "Enter Amount"}
		else if (Number(outputAmount) <= 0) return {valid: false, message: "Insufficient Liquidity"}
		else if (Big(Number(inputAmount) || 0).mul(Big(10).pow(inToken.decimals)).gt(inToken.balance.toString())) return {valid: false, message: "Insufficient Balance"}
		else if (getSteps().length > 0) return { valid: false, message: "Approve"}
		else if (Number(deadline_m) == 0) return {valid: false, message: "Please set deadline"}
		else if (maxSlippage == 0) return {valid: false, message: "Please set slippage"}
		else return {valid: true, message: "Swap"}
	}

	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						(prices[inToken?.id] / prices[outToken?.id]) || 0
					)}{" "}
					{outToken?.symbol}/{inToken?.symbol} | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
				</title>
				<link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}></link>
			</Head>
			{tokens.length > 1 ? (
				<SwapLayout
					inputAmount={inputAmount}
					updateInputAmount={updateInputAmount}
					inputAssetIndex={inputAssetIndex}
					onInputOpen={onInputOpen}
					outputAmount={outputAmount}
					updateOutputAmount={updateOutputAmount}
					outputAssetIndex={outputAssetIndex}
					onOutputOpen={onOutputOpen}
					switchTokens={switchTokens}
					exchange={exchange}
					validate={validate}
					loading={loading}
					gas={gas}
					maxSlippage={maxSlippage}
					setMaxSlippage={setMaxSlippage}
					deadline={deadline_m}
					setDeadline={setDeadline_m}
					swapData={swapData}
					tokens={tokens}
					steps={getSteps()}
				/>
			) : (
				<SwapSkeleton />
			)}

			<TokenSelector
				isOpen={isInputOpen}
				onOpen={onInputOpen}
				onClose={onInputClose}
				onTokenSelected={onInputTokenSelected}
				tokens={tokens}
			/>
			<TokenSelector
				isOpen={isOutputOpen}
				onOpen={onOutputOpen}
				onClose={onOutputClose}
				onTokenSelected={onOutputTokenSelected}
				tokens={tokens}
			/>
		</>
	);
}

export default Swap;
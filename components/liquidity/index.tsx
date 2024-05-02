import {
	Box,
	useDisclosure,
	Text,
	Flex,
	Link,
	useColorMode,
	Heading,
	Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import Head from "next/head";
import TokenSelector from "./TokenSelector";
import {
	dollarFormatter,
	tokenFormatter,
} from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../utils/useUpdateData";
import { useBalanceData } from "../context/BalanceProvider";
import { usePriceData } from "../context/PriceContext";
import axios from "axios";
import LiquidityLayout from "./LiquidityLayout";
import Big from "big.js";
import { formatInput, parseInput } from "../utils/number";
import useHandleError, { PlatformType } from "../utils/useHandleError";
import { useAppData } from "../context/AppDataProvider";
import { VARIANT } from "../../styles/theme";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { BsWallet } from "react-icons/bs";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";

interface ApprovalStep {
	type: "APPROVAL" | "PERMIT" | "DELEGATION";
	isCompleted: boolean;
	data: any;
}

function Liquidity() {
	const [inputAssetIndex, setInputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState("");
	const [outputAmount, setOutputAmount] = useState("");
	const [gas, setGas] = useState(0);
	const [error, setError] = useState("");

	const { chain } = useNetwork();
	const { prices } = usePriceData();
	const { isConnected, address } = useAccount();

	const {
		isOpen: isInputOpen,
		onOpen: onInputOpen,
		onClose: onInputClose,
	} = useDisclosure();

	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const [swapData, setSwapData] = useState<any>(null);
	const [data, setData] = useState<any>(null);
	const [maxSlippage, setMaxSlippage] = useState(0.5);
	const [deadline_m, setDeadline_m] = useState(20);
	const { getUpdateData } = useUpdateData();
	const [approvedAmount, setApprovedAmount] = useState("0");
	const { signTypedDataAsync } = useSignTypedData();
	const [deadline, setDeadline] = useState("0");

	const { liquidityData, reserveData, account } = useAppData();
	const tokens: any[] = reserveData ? reserveData.vaults.map((vault: any) => vault.asset) : [];
	const outToken = liquidityData?.lpToken;

	const handleError = useHandleError(PlatformType.DEX);

	const updateInputAmount = (value: any) => {
		value = parseInput(value);
		setInputAmount(value);
	};

	const updateOutputAmount = (value: any) => {
		value = parseInput(value);
		setOutputAmount(value);
	};

	const onInputTokenSelected = (e: number) => {
		setInputAssetIndex(e);
		setInputAmount("" as any);
		setApprovedAmount("0");
		setData(null);
		onInputClose();
		setSwapData(null);
		setApprovedAmount("0");
		setDeadline("0");
		setData(null);
		setGas(0);
	};


	const exchange = async () => {
		const token = tokens[inputAssetIndex];
		// if(!address) return;
		// if(swapData?.recipient == "XYZ") {
		// 	updateInputAmount(inputAmount)
		// 	return;
		// };
		// if(shouldApprove()){
		// 	const routerAddress = getAddress("Router", chain?.id!);
		// 	if(token.isPermit) approve(token, routerAddress)
		// 	else approveTx(token, routerAddress)
		// } else {
		// 	if (!inputAmount || !outputAmount) {
		// 		return;
		// 	}
		// 	setLoading(true);
		// 	// calculateInputAmount()
		// 	const router = await getContract("Router", chain?.id!);
		// 	let tx;
		// 	if(isWrap || isUnwrap){
		// 		let weth = await getContract("WETH9", chain?.id!, WETH_ADDRESS(chain?.id!));
		// 		if(isWrap) tx = send(weth, "deposit", [], Big(inputAmount).mul(10**token.decimals).toFixed(0));
		// 		else tx = send(weth, "withdraw", [Big(outputAmount).mul(10**token.decimals).toFixed(0)]);
		// 	} else {
		// 		const tokenPricesToUpdate = swapData.swaps.filter((swap: any) => swap.isBalancerPool == false).map((swap: any) => swap.assets).flat();
		// 		const pythData = await getUpdateData(tokenPricesToUpdate);
		// 		// concat swap assets[]
		// 		let _swapData = {...swapData};
		// 		if(token.id == ADDRESS_ZERO){
		// 			let ethAmount = Big(inputAmount).mul(10**token.decimals).toFixed(0);
		// 			tx = send(router, "swap", [_swapData, pythData], ethAmount)
		// 		} else {
		// 			let calls = [];
		// 			if(Big(approvedAmount ?? 0).gt(0)){
		// 				const {v, r, s} = ethers.utils.splitSignature(data!);
		// 				calls.push(
		// 					router.interface.encodeFunctionData("permit", [approvedAmount, deadline, token.id, v, r, s])
		// 				)
		// 			}
		// 			calls.push(
		// 				router.interface.encodeFunctionData("swap", [_swapData, pythData])
		// 			);
		// 			tx = send(router, "multicall", [calls])
		// 		}
		// 	}

		// 	tx.then(async (res: any) => {
		// 		let response = await res.wait();
		// 		updateFromTx(response);
		// 		setLoading(false);
		// 		toast({
		// 			title: 'Transaction submitted',
		// 			description: <Box>
		// 				<Text>
		// 					{`You have swapped ${inputAmount} ${tokens[inputAssetIndex]?.symbol} for ${outToken?.symbol}`}
		// 				</Text>
		// 				<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
		// 					<Flex align={'center'} gap={2}>
		// 					<ExternalLinkIcon />
		// 					<Text>View Transaction</Text>
		// 					</Flex>
		// 				</Link>
		// 			</Box>,
		// 			status: 'success',
		// 			duration: 5000,
		// 			isClosable: true,
		// 			position: 'top-right'
		// 		})
		// 		setInputAmount('');
		// 		setLpAmount('0');
		// 		setSwapData(null);
		// 		if(Big(approvedAmount ?? 0).gt(0)){
		// 			addNonce(token.id, '1')
		// 			setApprovedAmount('0');
		// 			setDeadline('0');
		// 			setData(null);
		// 		}
		// 	})
		// 	.catch((err: any) => {
		// 		setLoading(false);
		// 		handleError(err)
		// 	})
		// }
	};

	const approveTx = async (token: any, routerAddress: string) => {
		// setLoading(true);
		// const tokenContract = await getContract("MockToken", chain?.id ?? defaultChain.id, token.id);
		// send(
		// 	tokenContract,
		// 	"approve",
		// 	[
		// 		routerAddress,
		// 		ethers.constants.MaxUint256
		// 	]
		// )
		// .then(async (res: any) => {
		// 	let response = await res.wait();
		// 	updateFromTx(response);
		// 	setLoading(false);
		// 	toast({
		// 		title: "Approval Successful",
		// 		description: <Box>
		// 			<Text>
		// 				{`You have approved ${token.symbol}`}
		// 			</Text>
		// 			<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
		// 				<Flex align={'center'} gap={2}>
		// 				<ExternalLinkIcon />
		// 				<Text>View Transaction</Text>
		// 				</Flex>
		// 			</Link>
		// 		</Box>,
		// 		status: "success",
		// 		duration: 10000,
		// 		isClosable: true,
		// 		position: "top-right"
		// 	})
		// }).catch((err: any) => {
		// 	handleError(err);
		// 	setLoading(false);
		// })
	};

	const approve = async (token: any, routerAddress: string) => {
		setLoading(true);
		// const _deadline =(Math.floor(Date.now() / 1000) + 60 * deadline_m).toFixed(0);
		// // const _amount = Big(inputAmount).toFixed(token.decimals, 0);
		// const value = ethers.constants.MaxUint256;
		// signTypedDataAsync({
		// 	domain: {
		// 		name: token.name,
		// 		version: EIP712_VERSION(token.id),
		// 		chainId: chain?.id ?? defaultChain.id,
		// 		verifyingContract: token.id,
		// 	},
		// 	types: {
		// 		Permit: [
		// 			{ name: "owner", type: "address" },
		// 			{ name: "spender", type: "address" },
		// 			{ name: "value", type: "uint256" },
		// 			{ name: "nonce", type: "uint256" },
		// 			{ name: "deadline", type: "uint256" },
		// 		]
		// 	},
		// 	value: {
		// 		owner: address!,
		// 		spender: routerAddress as any,
		// 		value,
		// 		nonce: nonces[token.id] ?? 0,
		// 		deadline: BigNumber.from(_deadline),
		// 	}
		// })
		// 	.then(async (res: any) => {
		// 		setData(res);
		// 		setDeadline(_deadline);
		// 		setApprovedAmount(ethers.constants.MaxUint256.toString());
		// 		setLoading(false);
		// 		toast({
		// 			title: "Approval Signed",
		// 			description: <Box>
		// 				<Text>
		// 					{`For use of ${token.symbol}`}
		// 				</Text>
		// 			</Box>,
		// 			status: "info",
		// 			duration: 10000,
		// 			isClosable: true,
		// 			position: "top-right"
		// 		})
		// 	})
		// 	.catch((err: any) => {
		// 		handleError(err);
		// 		setLoading(false);
		// 	});
	};

	const handleMax = () => {
		//TODO - max

		let _inputAmount = Big(0).div(10 ** tokens[inputAssetIndex].decimals);
		updateInputAmount(_inputAmount.toString());
	};

	const swapInputExceedsBalance = () => {
		if (inputAmount) {
			//TODO - max
			return Big(inputAmount).gt(
				Big(0).div(10 ** tokens[inputAssetIndex].decimals)
			);
		}
		return false;
	};

	const getSteps = () => {
		let steps: ApprovalStep[] = [];
		// Check approval of collateral asset to router
		const token = tokens[inputAssetIndex];
		console.log(token);
		return steps;
	};

	const validate = () => {
		if (!isConnected)
			return { valid: false, message: "Please connect your wallet" };
		else if (chain?.unsupported)
			return { valid: false, message: "Unsupported Chain" };
		if (loading) return { valid: false, message: "Loading..." };
		if (error.length > 0) return { valid: false, message: error };
		else if (Number(inputAmount) <= 0 && Number(outputAmount) <= 0)
			return { valid: false, message: "Enter Amount" };
		else if (Big(inputAmount).gt(Big(0).div(10 ** tokens[inputAssetIndex].decimals)))
			return { valid: false, message: "Insufficient Balance" };
		else if (getSteps().length > 0)
			return {
				valid: false,
				message: `Add Liquidity`,
			};
		else if (Number(deadline_m) == 0)
			return { valid: false, message: "Please set deadline" };
		else if (maxSlippage == 0)
			return { valid: false, message: "Please set slippage" };
		else return { valid: true, message: "Swap" };
	};

	const estimateGas = async (_swapData = swapData) => {
		// if(!_swapData || validate().message !== 'Swap') return;
		// const token = tokens[inputAssetIndex];
		// let router = await getContract("Router", chain?.id!);
		// let provider = new ethers.providers.Web3Provider(window.ethereum as any);
		// router = router.connect(provider.getSigner());
		// let tx;
		// const tokenPricesToUpdate = swapData.swaps.filter((swap: any) => swap.isBalancerPool == false).map((swap: any) => swap.assets).flat();
		// const pythData = await getUpdateData(tokenPricesToUpdate);
		// // concat swap assets[]
		// _swapData = {..._swapData};
		// if(token.id == ADDRESS_ZERO || !window.ethereum){
		// 	tx = new Promise((resolve, reject) => resolve(100000));
		// } else {
		// 	let calls = [];
		// 	if(Big(approvedAmount ?? 0).gt(0)){
		// 		const {v, r, s} = ethers.utils.splitSignature(data!);
		// 		calls.push(router.interface.encodeFunctionData("permit", [approvedAmount, deadline, token.id, v, r, s]))
		// 	}
		// 	calls.push(
		// 		router.interface.encodeFunctionData("swap", [_swapData, pythData])
		// 	);
		// 	tx = router.estimateGas.multicall(calls);
		// }
		// tx.then(async (res: any) => {
		// 	setGas(res.toString());
		// })
		// .catch((err: any) => {
		// 	console.log("Error estimating gas:", JSON.stringify(err).slice(0, 400));
		// 	setGas(0);
		// })
	};

	useEffect(() => {
		if (swapData && Number(inputAmount) > 0) {
			estimateGas();
		}
	}, [inputAmount, approvedAmount, swapData]);

	const { colorMode } = useColorMode();

	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						prices[tokens[inputAssetIndex]?.id] /
							prices[outToken?.id] || 0
					)}{" "}
					{outToken?.symbol}/
					{tokens[inputAssetIndex]?.symbol} |{" "}
					{process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
				</title>
				<link
					rel="icon"
					type="image/x-icon"
					href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}
				></link>
			</Head>
			{tokens.length > 1 ? (
				<Box>
					<Box
						className={`${VARIANT}-${colorMode}-containerBody`}
						p={4}
						my={4}
					>
						<Flex justify={"space-between"}>
							<Flex gap={2} align={"center"}>
								<BsWallet />
								<Heading size={"sm"}>Your Position</Heading>
							</Flex>
							<Text>Health: {account.healthFactor.gt(10) ? ">10" : account.healthFactor.toString()}</Text>
						</Flex>

						<Divider my={2} />

						<Flex justify="space-between">
							<Text>Balance</Text>
							<Flex align={'center'} gap={1}>
								<Text>{dollarFormatter.format(account.userTotalBalanceUSD.toString())}</Text>
								{Number(inputAmount) > 0 && <ArrowRightIcon h={'10px'} />}
								{Number(inputAmount) > 0 && <Text>{
									dollarFormatter.format(Number(inputAmount) * tokens[inputAssetIndex].price.div(10**8).toNumber())
									}</Text>}
							</Flex>
						</Flex>
						<Flex justify="space-between">
							<Text>Debt</Text>
							<Flex align={'center'} gap={1}>
								<Text>{dollarFormatter.format(account.userTotalDebtUSD.toString())}</Text>
								{Number(outputAmount) > 0 && <ArrowRightIcon h={'10px'} />}
								{Number(outputAmount) > 0 && <Text>{
									dollarFormatter.format(Number(outputAmount) * outToken.price.div(ethers.constants.WeiPerEther).toNumber())
									}</Text>}
							</Flex>
						</Flex>

						<Divider my={2} />

						<Flex justify="space-between">
							<Text>Available to mint</Text>
							<Flex gap={2} align={'center'}>
							<Text>0.00</Text>
							</Flex>

						</Flex>
					</Box>
					<Box className={`${VARIANT}-${colorMode}-containerBody`}>
						<Tabs isFitted colorScheme="orange">
							<Box
								className={`${VARIANT}-${colorMode}-containerHeader`}
								px={0}
								py={0}
							>
								<TabList>
									<Tab>Add</Tab>
									<Tab>Remove</Tab>
								</TabList>
							</Box>

							<Box>
								<LiquidityLayout
									inputAmount={inputAmount}
									updateInputAmount={updateInputAmount}
									inputAssetIndex={inputAssetIndex}
									onInputOpen={onInputOpen}
									outputAmount={outputAmount}
									updateOutputAmount={updateOutputAmount}
									handleMax={handleMax}
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
									outToken={outToken}
								/>
							</Box>
						</Tabs>
					</Box>

					<Box className={`${VARIANT}-${colorMode}-containerBody`} p={4} mt={4}>
						<Text>How it works?</Text>
					</Box>
				</Box>
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
		</>
	);
}

export default Liquidity;

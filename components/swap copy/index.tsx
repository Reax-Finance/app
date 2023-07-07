import {
	Box,
	Text,
	Flex,
	Input,
	Button,
	InputGroup,
	useDisclosure,
	Divider,
	Link,
	Heading,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { getContract, send, estimateGas } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { MdOutlineSwapVert } from "react-icons/md";
import { AppDataContext } from "../context/AppDataProvider";
import Head from "next/head";
import Image from "next/image";
import { BigNumber, ethers } from "ethers";
import TokenSelector from "./TokenSelector";
import { RiArrowDropDownLine, RiArrowDropUpLine, RiArrowUpFill } from "react-icons/ri";
import { PYTH_ENDPOINT, WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import Response from "../modals/_utils/Response";
import { motion } from "framer-motion";
import { ERRORS, ERROR_MSG } from '../../src/errors';
import { useRouter } from "next/router";
import { base58 } from "ethers/lib/utils.js";
import { useToast } from '@chakra-ui/react';
const Big = require("big.js");
import { ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import useUpdateData from "../utils/useUpdateData";
import SelectBody from "./SelectBody";
import { useBalanceData } from "../context/BalanceProvider";
import { usePriceData } from "../context/PriceContext";
import { isMarketOpen } from "../../src/timings";

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(1);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState<number>('' as any);
	const [outputAmount, setOutputAmount] = useState(0);
	const [nullValue, setNullValue] = useState(false);
	const [gas, setGas] = useState(0);
	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isOpen);
	const { chain } = useNetwork();
	const { prices } = usePriceData();

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
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const { account } = useContext(AppDataContext);
	const toast = useToast();

	useEffect(() => {
		if(pools[tradingPool]){
			updateInputAmount({target: {value: inputAmount}})
		}
	}, [prices])

	const updateInputAmount = (e: any) => {
		setInputAmount(e.target.value);
		if (isNaN(Number(e.target.value))) return;
		let outputAmount =
			(Number(e.target.value) * prices[inputToken()?.token.id]) /
			prices[outputToken()?.token.id];
		setOutputAmount(
			Number(
				Big(1)
					.minus(Big(inputToken().burnFee ?? 0).add(outputToken().mintFee ?? 0).div(10000))
					.times(outputAmount || 0)
					.toFixed(10)
			)
		);
	};

	const onInputTokenSelected = (e: number) => {
		if (outputAssetIndex == e) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e);
		// calculate output amount
		let _outputAmount = prices[outputToken()?.token.id] > 0 ? Big(inputAmount || 0).times(prices[inputToken(e).token.id]).div(prices[outputToken().token.id]) : 0;
		setOutputAmount(
			Number(
				Big(1)
					.minus(Big(inputToken().burnFee ?? 0).add(outputToken().mintFee ?? 0).div(10000))
					.times(_outputAmount)
					.toFixed(10)
			)
		);
		onInputClose();
	};
	
	const { walletBalances, updateBalance } = useBalanceData();

	const updateOutputAmount = (e: any) => {
		setOutputAmount(e.target.value);
		if (isNaN(Number(e.target.value))) return;
		let inputAmount = Big(Number(e.target.value))
			.times(
				prices[pools[tradingPool].synths[outputAssetIndex].token.id]
			)
			.div(
				prices[pools[tradingPool].synths[inputAssetIndex].token.id]
			);
		setInputAmount(
			Number(
				Big(1)
					.minus(Big(inputToken().burnFee ?? 0).add(outputToken().mintFee ?? 0).div(10000))
					.times(inputAmount)
					.toFixed(10)
			)
		);
	};

	const onOutputTokenSelected = (e: number) => {
		if (inputAssetIndex == e) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e);
		// calculate input amount
		let _inputAmount = prices[inputToken()?.token.id] > 0 ? Big(outputAmount)
			.times(prices[outputToken(e).token.id])
			.div(prices[inputToken().token.id]) : 0;
		setInputAmount(
			Number(
				Big(1)
					.minus(Big(inputToken().burnFee ?? 0).add(outputToken().mintFee ?? 0).div(10000))
					.times(_inputAmount)
					.toFixed(10)
			)
		);
		onOutputClose();
	};

	const switchTokens = () => {
		let temp = inputAssetIndex;
		setInputAssetIndex(outputAssetIndex);
		setOutputAssetIndex(temp);
		setInputAmount(0);
		setOutputAmount(0);
	};

	const {getUpdateData} = useUpdateData();

	const exchange = async () => {
		if (!inputAmount || !outputAmount) {
			return;
		}
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");
		// let contract = await getContract("ERC20X", chain?.id!, pools[tradingPool].synths[inputAssetIndex].token.id);
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		const _inputAmount = inputAmount;
		const _inputAsset =
			pools[tradingPool].synths[inputAssetIndex].token.symbol;
		const _outputAsset =
			pools[tradingPool].synths[outputAssetIndex].token.symbol;
		const _outputAmount = outputAmount;

		const priceFeedUpdateData = await getUpdateData();
		let args = [
			pools[tradingPool].synths[inputAssetIndex].token.id,
			ethers.utils.parseEther(inputAmount.toString()),
			pools[tradingPool].synths[outputAssetIndex].token.id,
			0,
			address,
		];

		if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);

		send(pool, "swap", args)
			.then(async (res: any) => {
				const response = await res.wait();
				// decode response.logs
				const decodedLogs = response.logs.map((log: any) =>
				{try {
					return pool.interface.parseLog(log);
				} catch (e) {
					console.log(e);
				}}
				);
				if(chain?.id! == 280){
					decodedLogs.pop();
				}
				setConfirmed(true);
				handleExchange(
					inputToken().token.id,
					outputToken().token.id,
					decodedLogs[decodedLogs.length - 1].args.value.toString(),
					decodedLogs[decodedLogs.length - 3].args.value.toString(),
				);
				setInputAmount(0);
				setOutputAmount(0);

				setLoading(false);
				toast({
					title: "Swap Successful!",
					description: <Box>
						<Text>
					{`Swapped ${_inputAmount} ${_inputAsset} for ${_outputAmount} ${_outputAsset}`}
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
				console.log('Caught Error', err);
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
						description: err?.data?.message || err?.reason || err?.message || JSON.stringify(err).slice(0,100),
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top-right"
					})
				}
				setLoading(false);
			});
	};


	useEffect(() => {
		if (pools.length > 0 && !isNaN(Number(inputAmount)) && validateInput() == 0)
			getContract("Pool", chain?.id!, pools[tradingPool].id).then(async (contract: any) => {

				const priceFeedUpdateData = await getUpdateData();

				let args = [
					pools[tradingPool].synths[inputAssetIndex].token.id,
					ethers.utils.parseEther(inputAmount.toString()),
					pools[tradingPool].synths[outputAssetIndex].token.id,
					0,
					address,
				];
		
				if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);		
				const provider = new ethers.providers.Web3Provider(window.ethereum as any);
				// estimate gas
				contract.connect(provider.getSigner()).estimateGas.swap(...args)
					.then((gas: any) => {
						setGas(
							(Number(ethers.utils.formatUnits(gas, "gwei")) * 10000 * prices[WETH_ADDRESS(chain?.id!).toLowerCase()]) ?? 0
						);
					})
					.catch((err: any) => {
						console.log(err);
					});
			});
	});

	const { isConnected, address } = useAccount();

	const { pools, tradingPool } = useContext(AppDataContext);

	const handleExchange = (
		src: string,
		dst: string,
		srcValue: string,
		dstValue: string
	) => {
		updateBalance(dst, dstValue, false);
		updateBalance(src, srcValue, true);
		setNullValue(!nullValue);
	};

	const [useReferral, setUseReferral] = useState(false);
	const [referral, setReferral] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		if (referral == null) {
			const { ref: refCode } = router.query;
			if (refCode) {
				setReferral(refCode as string);
				setUseReferral(true);
			} else {
				setUseReferral(false);
			}
		}
	});

	useEffect(() => {
		if (
			inputAssetIndex > 1 &&
			pools[tradingPool].synths.length < inputAssetIndex
		) {
			setInputAssetIndex(0);
		}
		if (
			outputAssetIndex > 1 &&
			pools[tradingPool].synths.length < outputAssetIndex
		) {
			setOutputAssetIndex(pools[tradingPool].synths.length - 1);
		}
	}, [inputAssetIndex, outputAssetIndex, pools, tradingPool]);

	const handleMax = () => {
		let _inputAmount = Big(walletBalances[inputToken().token.id] ?? 0).div(1e18);
		updateInputAmount({target: {value: _inputAmount.toString()}})
	};

	const inputToken = (_inputAssetIndex = inputAssetIndex) => {
		if (!pools[tradingPool]) return null;
		return pools[tradingPool].synths[_inputAssetIndex];
	};

	const outputToken = (_outputAssetIndex = outputAssetIndex) => {
		if (!pools[tradingPool]) return null;
		return pools[tradingPool].synths[_outputAssetIndex];
	};

	const swapInputExceedsBalance = () => {
		if (inputAmount) {
			return Big(inputAmount).gt(Big(walletBalances[inputToken().token.id] ?? 0).div(1e18));
		}
		return false;
	};

	const inputStyle = {
		variant: "unstyled",
		fontSize: "3xl",
		borderColor: "transparent",
		fontFamily: "Chakra Petch",
		_hover: { borderColor: "transparent" },
		borderRadius: "0",
		pr: "4.5rem",
		height: "50px",
		type: "number",
		placeholder: "Enter amount",
	};

	const validateInput = () => {
		if(!isConnected) return ERRORS.NOT_CONNECTED
		else if(chain?.unsupported) return ERRORS.UNSUPPORTED_CHAIN
		else if (inputAmount <= 0) return ERRORS.INVALID_AMOUNT
		else if (swapInputExceedsBalance()) return ERRORS.INSUFFICIENT_BALANCE
		else return 0
	}

	const isValid = () => {
		if (referral == "" || referral == null) return true;
		try {
			const decodedString = BigNumber.from(
				base58.decode(referral!)
			).toHexString();
			return ethers.utils.isAddress(decodedString);
		} catch (err) {
			return false;
		}
	};


	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						prices[inputToken()?.token.id] / prices[outputToken()?.token.id]
					)}{" "}
					{outputToken()?.token.symbol}/{inputToken()?.token.symbol} | REAX
				</title>
				<link rel="icon" type="image/x-icon" href="/veREAX.svg"></link>
			</Head>
			{pools[tradingPool] ? (
				<Box>
					<Box p="5">
						<Heading size={'md'}>Synthetic Swap</Heading>
						<Text color={'whiteAlpha.500'} mt={1} fontSize={'sm'}>Zero Slippage, Infinite Liquidity</Text>
					</Box>

					{/* Input */}
					<Box px="5" bg={'blackAlpha.400'} pb={10} pt={8}>
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
								<Input
									{...inputStyle}
									value={inputAmount}
									onChange={updateInputAmount}
									min={0}
								/>
							</InputGroup>

							<SelectBody
								onOpen={onInputOpen}
								asset={inputToken()}
							/>
						</Flex>

						<Flex
							fontSize={"sm"}
							color="whiteAlpha.700"
							justify={"space-between"}
							align="center"
							mt={4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									inputAmount * prices[inputToken()?.token.id] 
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text
									onClick={handleMax}
									_hover={{ textDecor: "underline" }}
									cursor="pointer"
									textDecor={'underline'} style={{textUnderlineOffset: '2px'}}
								>
									{" "}
									{tokenFormatter.format(
										inputToken()
											? Big(walletBalances[inputToken().token.id] ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					</Box>

					{/* Switch */}
					<Flex px="5" my={-4} align='center'>
						<Divider w={'10px'} border='1px' borderColor={'whiteAlpha.300'} />
						<Button
							_hover={{ bg: "whiteAlpha.50" }}
							rounded={'0'}
							onClick={switchTokens}
							variant="unstyled"
							size={'sm'}
							display="flex"
							alignItems="center"
							justifyContent="center"
							bg={'whiteAlpha.300'}
							transform={"rotate(45deg)"}
							mx={1.5}
						>
							<Box  transform="rotate(-45deg)">
							<MdOutlineSwapVert size={"20px"} />
							</Box>
						</Button>
						<Divider border='1px' borderColor={'whiteAlpha.300'} />
					</Flex>

					{/* Output */}
					<Box px="5" py={10} pb={14} bg={'blackAlpha.400'}>
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
								<Input
									{...inputStyle}
									value={outputAmount}
									onChange={updateOutputAmount}
									min={0}
								/>
							</InputGroup>

							<SelectBody
								onOpen={onOutputOpen}
								asset={outputToken()}
							/>
						</Flex>

						<Flex
							fontSize={"sm"}
							color="whiteAlpha.700"
							justify={"space-between"}
							align="center"
							mt={4}
							mb={-4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									outputAmount * prices[outputToken()?.token.id]
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text>
									{" "}
									{tokenFormatter.format(
										outputToken()
											? Big(walletBalances[outputToken().token.id] ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					</Box>

					<Box px="5">

					{ gas > 0 && <Box pb={10}>
						<Flex
							justify="space-between"
							align={"center"}
							mt={5}
							mb={!isOpen ? !account ? '-4' : '-6' : '0'}
							bg="whiteAlpha.50"
							color="whiteAlpha.700"
							// rounded={16}
							px={4}
							py={2}
							cursor="pointer"
							{...getButtonProps()}
							_hover={{ bg: "whiteAlpha.100" }}
						>
							<Flex align={"center"} gap={2} fontSize="md">
								<InfoOutlineIcon />
								<Text>
									1 {inputToken().token.symbol} ={" "}
									{tokenFormatter.format(
										prices[inputToken()?.token.id] /
											prices[outputToken()?.token.id]
									)}{" "}
									{outputToken().token.symbol}
								</Text>
								<Text fontSize={'sm'} color={"gray.400"}>
									(
									{dollarFormatter.format(
										prices[inputToken()?.token.id]
									)}
									)
								</Text>
							</Flex>
							<Flex mr={-2}>
								{!isOpen ? <RiArrowDropDownLine size={30} /> : <RiArrowDropUpLine size={30} />}
							</Flex>
						</Flex>
						<Box mb={isOpen ? 0 : 0}>
							<motion.div
								{...getDisclosureProps()}
								hidden={hidden}
								initial={false}
								onAnimationStart={() => setHidden(false)}
								onAnimationComplete={() => setHidden(!isOpen)}
								animate={{ height: isOpen ? 94 : 0 }}
								style={{
								height: 94,
								width: '100%',
								}}
							>
								{isOpen && 	
								<Box border={'2px'} borderColor='whiteAlpha.200' mt={4} px={3} py={2} fontSize='sm' color={'whiteAlpha.800'}>
									<Flex justify={'space-between'}>
									<Text>Price Impact</Text>
									<Text>{100*(Number(inputToken().burnFee) + Number(outputToken().mintFee)) / 10000} %</Text>
									</Flex>
									<Divider my={1}/>
									<Flex justify={'space-between'} mb={0.5}>
									<Text>Swap Fee</Text>
									<Text>{100*(Number(inputToken().burnFee) + Number(outputToken().mintFee))/ 10000} %</Text>
									</Flex>
									<Flex justify={'space-between'} mb={0.5}>
									<Text>Slippage</Text>
									<Text>0 %</Text>
									</Flex>
									<Flex justify={'space-between'}>
									<Text>Estimated Gas</Text>
									<Text>{dollarFormatter.format(gas)}</Text>
									</Flex>
								</Box>}
							</motion.div>
						</Box>
						</Box>}
						<Box mt={!gas ? 6 : 0.5} mb={5} className="swapButton">
						<Button
							size="lg"
							fontSize={"xl"}
							width={"100%"}
							rounded={0}
							onClick={exchange}
							bg={'transparent'}
							isDisabled={
								loading ||
								validateInput() > 0 ||
								!isValid() || 
								pools[tradingPool].paused || !isMarketOpen(pools[tradingPool].name)
							}
							loadingText="Sign the transaction in your wallet"
							isLoading={loading}
							_hover={{ opacity: 0.6 }}
							color="white"
							height={"55px"}
							_disabled={{
								color: 'whiteAlpha.700',
							}}
						>
							{(pools[tradingPool].paused || !isMarketOpen(pools[tradingPool].name)) ? 'Market Paused' : !isValid() ? 'Invalid Referral' : validateInput() > 0 ? ERROR_MSG[validateInput()] : "Swap"}
						</Button>
						</Box>
						{hash && <Box mt={-5} pb={4}>
						<Response
							response={response}
							message={message}
							hash={hash}
							confirmed={confirmed}
						/>
						</Box>}

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
			/>
			<TokenSelector
				isOpen={isOutputOpen}
				onOpen={onOutputOpen}
				onClose={onOutputClose}
				onTokenSelected={onOutputTokenSelected}
			/>
		</>
	);
}

export default Swap;
import React, { useEffect, useState } from "react";
import {
	Tabs,
	Text,
	Image,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Flex,
	useDisclosure,
	Box,
	Button,
    Divider,
    Select,
    useToast,
    Link,
} from "@chakra-ui/react";

import {
	NumberInput,
	NumberInputField
} from "@chakra-ui/react";
import SelectBody from "../../swap/SelectBody";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { useBalanceData } from "../../context/BalanceProvider";
import TokenSelector from "../TokenSelector";
import router from "next/router";
import { AiOutlineDownSquare } from "react-icons/ai";
import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";
import { usePriceData } from "../../context/PriceContext";
import { ESYX_PRICE, FACTORY, PERP_PAIRS, POOL, defaultChain, dollarFormatter, tokenFormatter } from "../../../src/const";
import { usePerpsData } from "../../context/PerpsDataProvider";
import { getABI, getContract, send } from "../../../src/contract";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Big from "big.js";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import useUpdateData from "../../utils/useUpdateData";
import { useLendingData } from "../../context/LendingDataProvider";
import { formatInput, parseInput } from "../../utils/number";

const labelStyles = {
	mt: "2",
	ml: "-2.5",
	fontSize: "sm",
};

export default function Trade() {
	const [inAmount, setInAmount] = React.useState("");
	const [outAmount, setOutAmount] = React.useState("");
	const [inAssetIndex, setInAssetIndex] = React.useState(6);
	const [leverage, setLeverage] = React.useState(5);
	const { chain } = useNetwork();
	const { pair }: any = router.query;
	const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPosition, setSelectedPosition] = React.useState(0);
    const { positions, addPosition } = usePerpsData();
	const { pools } = useLendingData();

	const {
		walletBalances,
		updateFromTx,
		tokens: _tokens,
		allowances,
		nonces,
		addNonce,
	} = useBalanceData();

	const { prices } = usePriceData();

	const tokens: any[] = [
		{
			id: ethers.constants.AddressZero,
			symbol: chain?.nativeCurrency.symbol ?? "MNT",
			name: chain?.nativeCurrency.name ?? "Mantle",
			decimals: chain?.nativeCurrency.decimals ?? 18,
			balance: walletBalances[ethers.constants.AddressZero],
		},
	].concat(_tokens);

	const onInputTokenSelected = (i: number) => {
		setInAssetIndex(i);
	};

	const setInputAmount = (e: any) => {
		e = parseInput(e);
		setInAmount(e);
		setOutAmount(
			Big(Number(e)).mul(leverage).mul(prices[tokens[inAssetIndex].id]).div(prices[PERP_PAIRS[pair].base]).toString()
		);
	};

	const setOutputAmount = (e: any) => {
		e = parseInput(e);
		setOutAmount(e);
		setLeverage(Big(e).mul(prices[PERP_PAIRS[pair].base]).div(Big(inAmount).mul(prices[tokens[inAssetIndex].id])).toNumber());
	};

	const setMax = (multiplier: number) => {
		let v1 = Big(walletBalances[tokens[inAssetIndex].id]).div(10 ** tokens[inAssetIndex].decimals).mul(multiplier);
		let v2 = Big(availableLiquidity()).mul(0.99).div(prices[tokens[inAssetIndex].id]).div(leverage).mul(multiplier);
		let min = v1.lt(v2) ? v1 : v2;
		if(min.lt(0)) min = Big(0);
		setInputAmount(min.toString());
	};

	const _setLeverage = (e: number) => {
		setLeverage(e);
		setOutAmount(Big(e).mul(inAmount).mul(prices[tokens[inAssetIndex].id]).div(prices[PERP_PAIRS[pair as string].base]).toString());
	}

	const { signTypedDataAsync } = useSignTypedData();
    const { address, isConnected } = useAccount();
	const [deadline, setDeadline] = useState('0');
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);
	const [loading, setLoading] = useState(false);

    const toast = useToast();
    const handleError = useHandleError(PlatformType.LENDING);

    const approveTx = async () => {
		setApproveLoading(true);
		const collateralContract = await getContract("MockToken", chain?.id ?? defaultChain.id, positions[selectedPosition]?.id);
		send(
			collateralContract,
			"approve",
			[
				positions[selectedPosition]?.id,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			const response = await res.wait();
			updateFromTx(response);
			setApproveLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved ${tokens[inAssetIndex].symbol}`}
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
		const value = ethers.constants.MaxUint256;
		signTypedDataAsync({
			domain: {
				name: tokens[inAssetIndex].name,
				version: "1",
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: tokens[inAssetIndex].id,
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
				spender: positions[selectedPosition]?.id,
				value,
				nonce: nonces[tokens[inAssetIndex].id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApproveLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${tokens[inAssetIndex].symbol}`}
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
		else if(Number(inAmount) == 0 || isNaN(Number(inAmount))){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (Big(inAmount).gt(Big(walletBalances[tokens[inAssetIndex].id]).div(10**tokens[inAssetIndex].decimals))) {
			return {
				stage: 0,
				message: "Amount Exceeds Balance"
			}
		} 
		else if (Big(outAmount).mul(prices[PERP_PAIRS[pair].base]).gt(availableLiquidity())) {
			return {
				stage: 0,
				message: "Insufficient Liquidity"
			}
		} 
		else if (!positions[selectedPosition]?.id) {
			return {
				stage: 0,
				message: "Loading..."
			}
		}
		
		// check allowance if not native
		if (tokens[inAssetIndex].id !== ethers.constants.AddressZero && !data) {
			// if not approved
			if(Big(allowances[tokens[inAssetIndex].id]?.[positions[selectedPosition]?.id] ?? 0).add(Big(approvedAmount).mul(10 ** (tokens[inAssetIndex].decimals ?? 18))).lt(
				Big(inAmount).mul(10 ** (tokens[inAssetIndex].decimals ?? 18))
			)) {
				return {
					stage: 1,
					message: "Approve Use Of" + " " + tokens[inAssetIndex].symbol
				}
			} else if(Big(approvedAmount).gt(0) && !Big(approvedAmount).eq(inAmount)){
				return {
					stage: 1,
					message: "Approve Use Of" + " " + tokens[inAssetIndex].symbol
				}
			}
		} else {
			return {
				stage: 3,
				message: "Long"
			}
		}

		return {
			stage: 3,
			message: ""
		}
    }

    const { getUpdateData } = useUpdateData();

    const open = async () => {
        let calls = [];
        setLoading(true);
        let position = new ethers.Contract(positions[selectedPosition]?.id, getABI("PerpPosition", chain?.id!));
        let erc20 = new ethers.Contract(tokens[inAssetIndex].id, getABI("MockToken", chain?.id!));
        let factory = new ethers.Contract(FACTORY, getABI("PerpFactory", chain?.id!));
        let _amount = ethers.utils.parseUnits(Big(inAmount).toFixed(tokens[inAssetIndex].decimals, 0), tokens[inAssetIndex].decimals);
		let _leveragedAmount = ethers.utils.parseUnits(Big(inAmount).mul(leverage - 1).div(prices[PERP_PAIRS[pair].base]).toFixed(tokens[inAssetIndex].decimals, 0), 18);
        if(data){
            // permit position to take cusd
            const {v, r, s} = ethers.utils.splitSignature(data!);
            calls.push(position.interface.encodeFunctionData("call", [tokens[inAssetIndex].id, erc20.interface.encodeFunctionData("permit", [address, position.address, ethers.constants.MaxUint256, deadline, v, r, s]), 0]));
        }
        calls.push(position.interface.encodeFunctionData("call", [tokens[inAssetIndex].id, erc20.interface.encodeFunctionData("transferFrom", [address, position.address, _amount]), 0]));
        const pythUpdateData = await getUpdateData([PERP_PAIRS[pair].quote, PERP_PAIRS[pair].base]);
        calls.push(position.interface.encodeFunctionData("updatePythData", [pythUpdateData]));

        if(tokens[inAssetIndex].id !== PERP_PAIRS[pair].base){   
            calls.push(position.interface.encodeFunctionData("swap", [tokens[inAssetIndex].id, _amount, PERP_PAIRS[pair].base]));
        }
		// position approves to supply ceth pool
        calls.push(position.interface.encodeFunctionData("call", [PERP_PAIRS[pair].base, erc20.interface.encodeFunctionData("approve", [POOL, ethers.constants.MaxUint256]), 0]));
        calls.push(position.interface.encodeFunctionData("call", [PERP_PAIRS[pair].base, erc20.interface.encodeFunctionData("approve", [PERP_PAIRS[pair].base, ethers.constants.MaxUint256]), 0]));
        // now we have eth in position contract; supply that to pool
        calls.push(position.interface.encodeFunctionData("supply", [PERP_PAIRS[pair].base, ethers.constants.MaxUint256]));
        // now open position
        calls.push(position.interface.encodeFunctionData("openPosition", [PERP_PAIRS[pair].base, _leveragedAmount, PERP_PAIRS[pair].quote]));

		let tx;
		if(selectedPosition == positions.length - 1){
			tx = send(factory, "newPosition", [calls], "10000")
		} else {
			tx = send(position, "multicall", [calls]);
		}

        tx.then(async (tx: any) => {
            tx = await tx.wait();
            updateFromTx(tx);
            setLoading(false);
        })
        .catch((err: any) => {
            handleError(err);
            setLoading(false);
        })
    }

	const availableLiquidity = () => {
		for(let i in pools){
			if(!pools[i] || !pools[i].length) continue;
			let market = pools[i].find((m: any) => m.inputToken.id == PERP_PAIRS[pair].base);
			if(market){
				return Number(((Number(market.totalDepositBalanceUSD) - Number(market.totalBorrowBalanceUSD)) * 0.99).toFixed(2));
			}
		}
		return 0;
	}

	const netAPY = () => {
		let apy = Big(0);
		let rewardsApy = Big(0);
		let total = Big(0);

		const rewardAPY = (market: any, side: string, type = "VARIABLE") => {
			let index = market.rewardTokens.map((token: any) => token.id.split('-')[0] == side && token.id.split('-')[1] == type).indexOf(true);
			if(index == -1) return '0';
			let total = Number(side == 'DEPOSIT' ? market.totalDepositBalanceUSD : market.totalBorrowBalanceUSD);
			if(total == 0) return 'Infinity';
			return Big(market.rewardTokenEmissionsAmount[index])
				.div(1e18)
				.mul(365 * ESYX_PRICE)
				.div(total)
				.mul(100)
				.toFixed(2);
		}

		for(let i in pools){
			let markets = pools[i];
			for(let j in markets){
				let market = markets[j];
				if(market.inputToken.id == PERP_PAIRS[pair].base){
					let amount = Big(Number(outAmount)).mul(prices[PERP_PAIRS[pair].base] ?? 0);
					// supplying base for long
					apy = apy.plus(Big(market.rates.find((rate: any) => rate.side == 'LENDER').rate).mul(amount));
					rewardsApy = rewardsApy.add(amount.mul(rewardAPY(markets[i], 'DEPOSIT')));
					total = total.plus(amount);
				} else if(market.inputToken.id == PERP_PAIRS[pair].quote){
					let amount = Big(Number(inAmount)).mul(leverage - 1).mul(prices[PERP_PAIRS[pair].quote] ?? 0);
					// borrowing quote for long
					apy = apy.plus(Big(market.rates.find((rate: any) => rate.side == 'BORROWER' && rate.type == 'VARIABLE').rate).mul(amount).neg());
					rewardsApy = rewardsApy.add(amount.mul(rewardAPY(markets[i], 'BORROW')));
					total = total.plus(amount);
				}
			}
		}
		return {
			apy: total.gt(0) ? apy.div(total).toFixed(4) : '0',
			rewardsApy: total.gt(0) ? rewardsApy.div(total).toFixed(2) : '0'
		}
	}

	return (
		<>
			<Tabs variant={"enclosed"}>
				<TabList>
					<Tab
						w={"50%"}
						_selected={{
							color: "primary.400",
							borderColor: "primary.400",
						}}
						rounded={0}
						border={0}
					>
						Long
					</Tab>
                    <Divider orientation="vertical" h={'40px'} />
					<Tab
						w={"50%"}
						_selected={{
							color: "primary.400",
							borderColor: "primary.400",
						}}
						rounded={0}
						border={0}
					>
						Short
					</Tab>
				</TabList>

				<TabPanels>
					<TabPanel>
						<>
							{/* Input Asset */}
							<NumberInput
								size={"xl"}
								onChange={setInputAmount}
								value={formatInput(inAmount)}
							>
								<Flex>
									<NumberInputField rounded={0} p={2} />
									<Box w="50%" mr={1}>
										<SelectBody
											asset={tokens[inAssetIndex]}
											onOpen={onOpen}
                                            size={"md"}
										/>
									</Box>
								</Flex>
							</NumberInput>

                            {/* Divider */}
							<Flex
								my={2}
								align={"center"}
								justify={"space-between"}
							>
								<AiOutlineDownSquare />
								<Flex align={"center"} gap={1}>
									<Button
										variant={"ghost"}
										size={"xs"}
										onClick={() => setMax(0.5)}
									>
										50%
									</Button>
									<Button
										variant={"ghost"}
										size={"xs"}
										onClick={() => setMax(1)}
									>
										100%
									</Button>
								</Flex>
							</Flex>

							{/* Output */}
							<NumberInput
								size={"xl"}
								onChange={setOutputAmount}
								value={formatInput(outAmount)}
							>
								<Flex>
									<NumberInputField
										h={"50px"}
										rounded={0}
										p={2}
									/>
									<Flex
										bg={"bg.200"}
										align={"center"}
										justify={"center"}
										w={"50%"}
										gap={2}
									>
										<Image
											src={`/icons/${
												(pair as string).split("-")[0]
											}.svg`}
											w={"26"}
											h={"26"}
											alt={(pair as string).split("-")[0]}
										/>
										<Text
											fontSize="md"
											color="whiteAlpha.800"
										>
											{(pair as string).split("-")[0]}
										</Text>
									</Flex>
								</Flex>
							</NumberInput>

							{/* Leverage */}
							<Box mt={4} pt={6} pb={2}>
								<Flex
									justify={"space-between"}
									align={"start"}
								>
									<Text>Leverage</Text>
                                    <Box maxW={'50%'}>
									<NumberInput
										size={"md"}
										value={leverage}
										format={(e) => Number(e).toFixed(2)}
										onChange={(e) => _setLeverage(Number(e))}
									>
										<NumberInputField rounded={0} />
									</NumberInput>
                                    </Box>
								</Flex>
								<Slider
									aria-label="slider-ex-6"
									onChange={(val) => _setLeverage(val)}
									value={leverage}
									colorScheme="primary"
								>
									<SliderMark value={25} {...labelStyles}>
										25x
									</SliderMark>
									<SliderMark value={50} {...labelStyles}>
										50x
									</SliderMark>
									<SliderMark value={75} {...labelStyles}>
										75x
									</SliderMark>
									<SliderTrack>
										<SliderFilledTrack />
									</SliderTrack>
									<SliderThumb />
								</Slider>
							</Box>

                            <Divider my={4} mt={8} />

                            {/* Select position */}
                            <Flex mt={2} align={'center'} gap={2}>
								<Text fontSize={'sm'}>Select Position: </Text>
							{positions.length > 1 && <Select rounded={0} placeholder='Select position' value={selectedPosition} onChange={(e) => setSelectedPosition(Number(e.target.value))}>
                                {positions.map((position: any, index: number) => <option key={position.id} value={index}>{(index !== (positions.length - 1)) ? position.id.slice(0, 6)+'..'+position.id.slice(-4) : 'Create New Position'}</option>)}
                            </Select>}
                            </Flex>

							{/* Long */}
							<Box mt={4}>
                                {validate().stage <= 2 && <Box mt={2} className={(validate().stage != 1 || approveLoading) ? "disabledSecondaryButton" : 'secondaryButton'}><Button
                                    isDisabled={validate().stage != 1}
                                    isLoading={approveLoading}
                                    loadingText="Please sign the transaction"
                                    color='white'
                                    width="100%"
                                    onClick={tokens[inAssetIndex].isPermit ? approve : approveTx}
                                    size="lg"
                                    rounded={0}
                                    bg={'transparent'}
                                    _hover={{ bg: "transparent" }}
                                >
                                    {validate().message}
                                </Button>
                                </Box>}
                                    
                                {validate().stage > 0 && <Box mt={2} className={(validate().stage < 2 || loading) ? "disabledSecondaryButton" : 'secondaryButton'} > <Button
                                    isDisabled={validate().stage < 2}
                                    isLoading={loading}
                                    loadingText="Please sign the transaction"
                                    width="100%"
                                    color="white"
                                    rounded={0}
                                    bg={'transparent'}
                                    onClick={open}
                                    size="lg"
                                    _hover={{ bg: "transparent" }}
                                >
                                    Long
                                </Button></Box>}
                            </Box>

							{/* Fees and Liquidity */}
							<Divider mt={6} />
							<Flex mt={5} mb={1} flexDir={'column'} gap={0.5}>
								<Flex justify={'space-between'} fontSize={'sm'}>
									<Text >Available Liquidity</Text>
									<Text ml={"auto"}>{dollarFormatter.format(availableLiquidity())}</Text>
								</Flex>
								<Flex justify={'space-between'} fontSize={'sm'}>
									<Text>Net APY + Rewards</Text>
									<Flex gap={1} align={'center'}>
									<Text ml={"auto"}>
										{netAPY().apy} %
									</Text>
									<Text ml={"auto"} color={'whiteAlpha.700'}>
										+ {netAPY().rewardsApy} %
									</Text>
									<Image ml={1} src="/veREAX.svg" w={'16px'} rounded={'0'} alt="veREAX" />
									</Flex>
								</Flex>
								<Flex justify={'space-between'} fontSize={'sm'}>
									<Text>Fees</Text>
									<Flex gap={1}>
										{/* <Text ml={"auto"}>{(0.25).toFixed(2)} %</Text> */}
										<Text ml={"auto"} color={'whiteAlpha.700'}>{dollarFormatter.format(Number(outAmount) * prices[PERP_PAIRS[pair].base] * 0.25 / (leverage * 100))}</Text>
									</Flex>
								</Flex>
							</Flex>
						</>
					</TabPanel>
					<TabPanel>
						<p>two!</p>
					</TabPanel>
				</TabPanels>
			</Tabs>

			<TokenSelector
				isOpen={isOpen}
				onClose={onClose}
				onTokenSelected={onInputTokenSelected}
			/>
		</>
	);
}

import React, { useState } from "react";

import {
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Tr,
	Td,
	Flex,
	Image,
	Text,
	Box,
	Button,
	InputGroup,
	NumberInput,
	NumberInputField,
	Divider,
} from "@chakra-ui/react";
import {
	ADDRESS_ZERO,
	dollarFormatter,
} from "../../../src/const";
import Big from "big.js";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Link from "next/link";
import { WETH_ADDRESS } from "../../../src/const";
import { useNetwork, useAccount, useSignTypedData } from "wagmi";
import { formatInput, isValidAndPositiveNS, parseInput } from "../../utils/number";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import Redeem from "./Redeem";
import Supply from "./Supply";
import { useSyntheticsData } from "../../context/SyntheticsPosition";

export default function SupplyModal({
	market,
	amount,
	setAmount,
}: any) {
	const [isNative, setIsNative] = useState(false);
	const { chain } = useNetwork();
	const { walletBalances } = useBalanceData();
	const [tabSelected, setTabSelected] = useState(0);

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const _setAmount = (e: string) => {
		e = parseInput(e);
		setAmount(e);
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return Big(
				(isNative
					? walletBalances[ADDRESS_ZERO]
					: walletBalances[market.inputToken.id]) ?? 0
			)
				.div(10 ** market.inputToken.decimals)
				.toFixed(market.inputToken.decimals);
		} else {
            if(!prices[market.inputToken.id]) return "0";
			// values in market.inputToken
			const v1 = Big(pos.availableToIssue).div(prices[market.inputToken.id]).mul(100).div(market.maximumLTV);
			const v2 = Big(walletBalances[market.outputToken.id] ?? 0).div(10 ** market.outputToken.decimals);
			// Available to withdraw from pool
			const v3 = Big(market.totalDepositBalanceUSD).sub(market.totalBorrowBalanceUSD).div(prices[market.inputToken.id]);

			// find minimum of (v1, v2, v3)
			let min = v1;
			if(v2.lt(min)) min = v2;
			if(v3.lt(min)) min = v3;

			if(min.lt(0)) min = Big(0);

			return min.toString();
		}
	};
    
	return (
		<>
			<ModalContent width={"30rem"} bgColor="transparent" shadow={'none'} rounded={0} mx={2}>
			<Box className="containerBody2">
				<ModalCloseButton rounded={"full"} mt={1} />
				<ModalHeader>
					<Flex justify={"center"} gap={2} pt={1} align={"center"}>
						<Image
							src={`/icons/${market.inputToken.symbol}.svg`}
							alt=""
							width={"32px"}
						/>
						<Text>{market.inputToken.symbol}</Text>
					</Flex>
				</ModalHeader>
				<ModalBody m={0} p={0}>
					<Divider />
					<Box bg={'bg.600'} pb={12} pt={4} px={8}>
						{market.inputToken.id ==
							WETH_ADDRESS(chain?.id!)?.toLowerCase() && (
							<>
								<Flex justify={"center"} mb={5}>
									<Tabs
										variant="unstyled"
										onChange={(index) =>
											index == 1
												? setIsNative(false)
												: setIsNative(true)
										}
										index={isNative ? 0 : 1}
										size="sm"
									>
										<TabList>
											<Box className={isNative ? `${tabSelected == 0 ? 'secondary' : 'primary'}TabLeftSelected` : `${tabSelected == 0 ? 'secondary' : 'primary'}TabLeft`}>
											<Tab>
												MNT
											</Tab>
											</Box>
											<Box className={!isNative ? `${tabSelected == 0 ? 'secondary' : 'primary'}TabRightSelected` : `${tabSelected == 0 ? 'secondary' : 'primary'}TabRight`}>
											<Tab>
												WMNT
											</Tab>
											</Box>
										</TabList>
									</Tabs>
								</Flex>
							</>
						)}
						<InputGroup
							mt={5}
							variant={"unstyled"}
							display="flex"
							placeholder="Enter amount"
						>
							<NumberInput
								w={"100%"}
								value={formatInput(amount)}
								onChange={_setAmount}
								min={0}
								step={0.01}
								display="flex"
								alignItems="center"
								justifyContent={"center"}
							>
								<Box ml={10}>
									<NumberInputField
										textAlign={"center"}
										pr={0}
										fontSize={"5xl"}
										placeholder="0"
									/>

									<Text
										fontSize="sm"
										textAlign={"center"}
										color={"whiteAlpha.600"}
									>
										{dollarFormatter.format(
											prices[market.inputToken.id] *
												Number(amount)
										)}
									</Text>
								</Box>

								<Box>
									<Button
										variant={"unstyled"}
										fontSize="sm"
										fontWeight={"bold"}
										onClick={() =>
											_setAmount(
												Big(max()).div(2).toString()
											)
										}
										py={-2}
									>
										50%
									</Button>
									<Button
										variant={"unstyled"}
										fontSize="sm"
										fontWeight={"bold"}
										onClick={() => _setAmount(max())}
									>
										MAX
									</Button>
								</Box>
							</NumberInput>
						</InputGroup>
					</Box>
					<Divider />
					<Box className="containerFooter">
					<Tabs variant={'enclosed'} onChange={selectTab}>
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
								Supply
							</Tab>
							<Divider orientation="vertical" h={'40px'} />
							<Tab
								w={"50%"}
								_selected={{
									color: "secondary.400",
									borderColor: "secondary.400",
								}}
								rounded={0}
								border={0}
							>
								Withdraw
							</Tab>
						</TabList>

						<TabPanels>
							<TabPanel m={0} p={0}>
								<Supply
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
                                    max={max()}
								/>
							</TabPanel>
							<TabPanel m={0} p={0}>
								<Redeem
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
                                    max={max()}
								/>
							</TabPanel>
						</TabPanels>
					</Tabs>
					</Box>
				</ModalBody>
				</Box>
			</ModalContent>
		</>
	);
}

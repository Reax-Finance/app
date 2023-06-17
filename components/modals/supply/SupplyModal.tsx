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
import { isValidAndPositiveNS } from "../../utils/number";
import { useBalanceData } from "../../context/BalanceContext";
import { usePriceData } from "../../context/PriceContext";
import Redeem from "./Redeem";
import Supply from "./Supply";
import { useSyntheticsData } from "../../context/SyntheticsPosition";

export default function SupplyModal({
	market,
	amountNumber,
	setAmountNumber,
	amount,
	setAmount,
}: any) {
	const [isNative, setIsNative] = useState(true);
	const { chain } = useNetwork();
	const { walletBalances } = useBalanceData();
	const [tabSelected, setTabSelected] = useState(0);

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const _setAmount = (e: string) => {
		if (Number(e) !== 0 && Number(e) < 0.000001) e = "0";
		setAmount(e);
		setAmountNumber(isValidAndPositiveNS(e) ? Number(e) : 0);
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
				.toString();
		} else {
            if(!prices[market.inputToken.id]) return "0";
			const v1 = Big(pos.availableToIssue);
			const v2 = Big(walletBalances[market.outputToken.id] ?? 0).div(
				10 ** market.outputToken.decimals
			);
			// min(v1, v2)
			return (v1.gt(v2) ? v2 : v1).toString();
		}
	};
    
	return (
		<>
			<ModalContent width={"30rem"} bgColor="bg1" rounded={0} mx={2}>
				<ModalCloseButton rounded={"full"} mt={1} />
				<ModalHeader>
					<Flex justify={"center"} gap={2} pt={1} align={"center"}>
						<Image
							src={`/icons/${market.inputToken.symbol}.svg`}
							alt=""
							width={"38px"}
						/>
						<Text>{market.inputToken.symbol}</Text>
						{chain?.testnet && (
							<Link href="/faucet">
								<Button size={"xs"} rounded="full" mb={1}>
									Use Faucet
								</Button>
							</Link>
						)}
					</Flex>
				</ModalHeader>
				<ModalBody m={0} p={0}>
					<Divider />
					<Box mb={6} mt={4} px={8}>
						{market.inputToken.id ==
							WETH_ADDRESS(chain?.id!)?.toLowerCase() && (
							<>
								<Flex justify={"center"} mb={5}>
									<Flex
										justify={"center"}
										align="center"
										gap={0.5}
										bg="whiteAlpha.400"
										rounded="0"
									>
										<Tabs
											variant="soft-rounded"
											colorScheme="primary"
											onChange={(index) =>
												index == 1
													? setIsNative(false)
													: setIsNative(true)
											}
											index={isNative ? 0 : 1}
											size="sm"
										>
											<TabList>
												<Tab
													rounded={0}
													color={"black"}
													_selected={{ bg: "white" }}
												>
													MNT
												</Tab>
												<Tab
													rounded={0}
													color={"black"}
													_selected={{ bg: "white" }}
												>
													WMNT
												</Tab>
											</TabList>
										</Tabs>
									</Flex>
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
								value={amount}
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
												amountNumber
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

					<Tabs onChange={selectTab}>
						<TabList>
							<Tab
								w={"50%"}
								_selected={{
									color: "primary.400",
									borderColor: "primary.400",
								}}
							>
								Supply
							</Tab>
							<Tab
								w={"50%"}
								_selected={{
									color: "secondary.400",
									borderColor: "secondary.400",
								}}
							>
								Withdraw
							</Tab>
						</TabList>

						<TabPanels>
							<TabPanel m={0} p={0}>
								<Supply
									market={market}
									amount={amount}
									amountNumber={amountNumber}
									setAmount={_setAmount}
									isNative={isNative}
                                    max={max()}
								/>
							</TabPanel>
							<TabPanel m={0} p={0}>
								<Redeem
									market={market}
									amount={amount}
									amountNumber={amountNumber}
									setAmount={_setAmount}
									isNative={isNative}
                                    max={max()}
								/>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
			</ModalContent>
		</>
	);
}

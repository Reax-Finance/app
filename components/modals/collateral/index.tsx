import React, { useState } from "react";

import {
	Modal,
	ModalOverlay,
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
	useDisclosure,
	Button,
	InputGroup,
	NumberInput,
	NumberInputField,
	Divider,
} from "@chakra-ui/react";
import { ADDRESS_ZERO, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Deposit from "./Deposit";
import Link from "next/link";
import Withdraw from "./Withdraw";
import { WETH_ADDRESS } from "../../../src/const";
import { useNetwork, useAccount, useSignTypedData } from 'wagmi';
import { formatInput, isValidAndPositiveNS, parseInput } from '../../utils/number';
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceProvider";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { usePriceData } from "../../context/PriceContext";
import TokenInfo from "../_utils/TokenInfo";

export default function CollateralModal({ collateral, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [tabSelected, setTabSelected] = useState(0);

	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const [isNative, setIsNative] = useState(false);
	const { chain } = useNetwork();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
		setIsNative(false);
	};

	const _setAmount = (e: string) => {
		e = parseInput(e);
		setAmount(e);
		setAmountNumber(isValidAndPositiveNS(e) ? Number(e) : 0);
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return Big((isNative ? walletBalances[ADDRESS_ZERO] : walletBalances[collateral.token.id]) ?? 0)
				.div(10 ** collateral.token.decimals)
				.toString();
		} else {
			const v1 = prices[collateral.token.id] > 0
					? Big(pos.adjustedCollateral)
							.sub(pos.debt)
							.div(prices[collateral.token.id])
							.div(collateral.baseLTV)
							.mul(1e4)
					: Big(0);
			const v2 = Big(collateral.balance ?? 0).div(10 ** collateral.token.decimals);
			// min(v1, v2)
			return (v1.gt(v2) ? v2 : v1).toString();
		}
	};

	const _onOpen = () => {
		if(collateral.token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase()) setIsNative(true);
		onOpen();
	}

	const { walletBalances, allowances, nonces } = useBalanceData();

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={_onOpen}
				_hover={{ borderColor: "primary.400", bg: "whiteAlpha.100" }}
			>
				<TdBox
					isFirst={index == 0}
					alignBox='left'
				>
					<TokenInfo token={collateral.token} />
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='right'
					isNumeric
				>
					<Box color={
						Big(collateral.balance ?? 0).gt(0)
							? "whiteAlpha.800"
							: "whiteAlpha.500"
					}>

					<Text fontSize={'md'}>

					{tokenFormatter.format(
						Big(collateral.balance ?? 0)
							.div(10 ** (collateral.token.decimals ?? 18))
							.toNumber()
					)}
					{Big(collateral.balance ?? 0).gt(0) ? "" : ".00"}
					</Text>

					{Big(collateral.balance ?? 0).gt(0) && <Text fontSize={'xs'} color={'whiteAlpha.600'}>
						{dollarFormatter.format(
							Big(collateral.balance ?? 0)
								.div(10 ** (collateral.token.decimals ?? 18))
								.mul(prices[collateral.token.id] ?? 0)
								.toNumber()
						)}
					</Text>}
					</Box>

				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<ModalContent
					width={"30rem"}
					bgColor="bg1"
					rounded={0}
					mx={2}
				>
					<ModalCloseButton rounded={"full"} mt={1} />
					<ModalHeader>
						<Flex
							justify={"center"}
							gap={2}
							pt={1}
							align={"center"}
						>
							<Image
								src={`/icons/${collateral.token.symbol}.svg`}
								alt=""
								width={"32px"}
							/>
							<Text>{collateral.token.name}</Text>
							{chain?.testnet && <Link href="/faucet">
								<Button size={"xs"} rounded="full" mb={1}>
									Use Faucet
								</Button>
							</Link>}
						</Flex>
					</ModalHeader>
					<ModalBody m={0} p={0}>
						<Divider />
						<Box mb={6} mt={4} px={8}>
							{collateral.token.id ==
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
											<Box className={isNative ? "tabButtonLeftSelected" : "tabButtonLeft"}>
											<Tab>
												MNT
											</Tab>
											</Box>
											<Box className={!isNative ? "tabButtonRightSelected" : "tabButtonRight"}>
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
														prices[collateral.token.id] *
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
															Big(max())
																.div(2)
																.toString()
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
													onClick={() =>
														_setAmount(max())
													}
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
									Deposit
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
									<Deposit
										collateral={collateral}
										amount={amount}
										amountNumber={amountNumber}
										setAmount={_setAmount}
										isNative={isNative}
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Withdraw
										collateral={collateral}
										amount={amount}
										amountNumber={amountNumber}
										setAmount={_setAmount}
									/>
								</TabPanel>
							</TabPanels>
						</Tabs>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}

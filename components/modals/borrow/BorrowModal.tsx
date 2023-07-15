import React from "react";
import { useContext, useState } from "react";
import {
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Flex,
	Image,
	Text,
	Box,
	InputGroup,
	NumberInput,
	NumberInputField,
	Button,
	Divider,
} from "@chakra-ui/react";
import {
	ADDRESS_ZERO,
	WETH_ADDRESS,
	W_NATIVE,
	dollarFormatter,
} from "../../../src/const";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Big from "big.js";
import { useAccount, useNetwork } from "wagmi";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import Repay from "./Repay";
import Borrow from "./Borrow";
import { formatInput, parseInput } from "../../utils/number";
import { NATIVE } from '../../../src/const';

export default function BorrowModal({
	market,
	amount,
	setAmount
}: any) {
	const { chain } = useNetwork();
	const [tabSelected, setTabSelected] = useState(0);
	let [debtType, setDebtType] = useState("2");
	const [isNative, setIsNative] = useState(false);

	const { address } = useAccount();
	const { walletBalances } = useBalanceData();
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
		if (!address) return "0";
		if (tabSelected == 0) {
			if (
				!prices[market.inputToken.id] ||
				prices[market.inputToken.id] == 0
			){
				return "0";
            }
			let v1 = Big(pos.adjustedCollateral).sub(pos.debt).sub(pos.stableDebt).div(prices[market.inputToken.id] ?? 0);
            if(v1.lt(0)) v1 = Big(0);
            let v2 = Big((0.96 * (market.totalDepositBalanceUSD - market.totalBorrowBalanceUSD) / prices[market.inputToken.id]) ?? 0)
            return v1.lt(v2) ? v1.toString() : v2.toString();
		} else {
			if (!Big(prices[market.inputToken.id] ?? 0).gt(0)) return "0";
			const v1 =
				debtType == "2"
					? Big(walletBalances[market._vToken.id]).div(
							10 ** market._vToken.decimals
					  )
					: Big(walletBalances[market._sToken.id]).div(
							10 ** market._sToken.decimals
					  );
			const v2 = Big(walletBalances[isNative ? ADDRESS_ZERO : market.inputToken.id] ?? 0).div(
				10 ** market.inputToken.decimals
			);
			return (v1.gt(v2) ? v2 : v1).toFixed(market.inputToken.decimals);
		}
	};

	return (
		<>
			<ModalContent width={"30rem"} bg={'transparent'} shadow={'none'} rounded={0} mx={2}>
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
					<Box bg={'bg.600'}>
					<Box pb={12} pt={6} px={8}>
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
											(prices[market.inputToken.id] ??
												0) * Number(amount)
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
										onClick={() =>
											_setAmount(
												Big(max())
													.mul(
														tabSelected == 0
															? 0.99
															: 1
													)
													.toString()
											)
										}
									>
										MAX
									</Button>
								</Box>
							</NumberInput>
						</InputGroup>
					</Box>
					</Box>
					<Divider />
					<Tabs variant={'enclosed'} onChange={selectTab} index={tabSelected}>
						<TabList>
							<Tab
								w={"50%"}
								_selected={{
									color: "primary.400",
									borderColor: "primary.400",
								}}
								border={0}
								rounded={0}
							>
								Borrow
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
								Repay
							</Tab>
						</TabList>

						<TabPanels>
							<TabPanel m={0} p={0}>
								<Borrow
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
									debtType={debtType}
									setDebtType={setDebtType}
									max={max()}
								/>
							</TabPanel>
							<TabPanel m={0} p={0}>
								<Repay
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
									debtType={debtType}
									setDebtType={setDebtType}
									max={max()}
								/>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
				</Box>
			</ModalContent>
		</>
	);
}

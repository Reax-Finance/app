import React, { useState } from "react";
import { useContext } from "react";

import {
	Modal,
	ModalOverlay,
	Tr,
	Th,
	Td,
	Flex,
	Image,
	Text,
	Box,
	useDisclosure,
} from "@chakra-ui/react";
import {
	tokenFormatter
} from "../../../src/const";
import Big from "big.js";
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceContext";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import BorrowModal from "./BorrowModal";

export default function Debt({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const { walletBalances, totalSupplies } = useBalanceData();
	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const _onClose = () => {
		setAmount("");
		setAmountNumber(0);
		onClose();
	};

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={onOpen}
				_hover={{ bg: 'whiteAlpha.100' }}
			>
				<TdBox isFirst={index == 0} alignBox='left'>
					<Flex gap={3} ml={'-2px'} textAlign='left'>
						<Image
							src={`/icons/${market.inputToken.symbol}.svg`}
							width="38px"
							alt=""
						/>
						<Box>
							<Text color={'white'}>
								{market.inputToken.symbol}
							</Text>
							<Flex color="whiteAlpha.600" fontSize={"sm"} gap={1}>
								<Text>
									{tokenFormatter.format(
										Big(walletBalances[market.inputToken.id] ?? 0)
											.div(10 ** market.inputToken.decimals)
											.toNumber()
									)}{" "}
									in wallet
								</Text>
							</Flex>
						</Box>
					</Flex>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
					<Text textAlign={'center'} w={'100%'}>
						{tokenFormatter.format(Math.min(
							Number(pos.availableToIssue) / prices[market.inputToken.id],
							0.96 * (market.totalDepositBalanceUSD - market.totalBorrowBalanceUSD) / prices[market.inputToken.id]
						))}
					</Text>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
				<Text textAlign={'center'} w={'100%'}>
					{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'STABLE')[0]?.rate ?? 0).toFixed(2)} %
				</Text>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='right' isNumeric>
					{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'VARIABLE')[0]?.rate ?? 0).toFixed(2)} %
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<BorrowModal market={market} amount={amount} setAmount={setAmount} amountNumber={amountNumber} setAmountNumber={setAmountNumber} />
			</Modal>
		</>
	);
}

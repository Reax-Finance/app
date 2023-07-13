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
	ESYX_PRICE,
	tokenFormatter
} from "../../../src/const";
import Big from "big.js";
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import BorrowModal from "./BorrowModal";
import MarketInfo from "../_utils/TokenInfo";

export default function Debt({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const pos = lendingPosition();

	const _onClose = () => {
		setAmount("");
		setAmountNumber(0);
		onClose();
	};

	const rewardAPY = (type = "VARIABLE") => {
		let index = market.rewardTokens.map((token: any) => (token.id.split('-')[0] == "BORROW" && token.id.split('-')[1] == type)).indexOf(true);
		if(index == -1) return '0';
		return Big(market.rewardTokenEmissionsAmount[index])
			.div(1e18)
			.mul(365 * ESYX_PRICE)
			.div(market.totalDepositBalanceUSD)
			.mul(100)
			.toFixed(2);
	}

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={onOpen}
				_hover={{ bg: 'bg.400' }}
			>
				<TdBox isFirst={index == 0} alignBox='left'>
					<MarketInfo token={market.inputToken} />
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
					<Text textAlign={'center'} w={'100%'}>
						{tokenFormatter.format(Math.min(
							(Number(pos.availableToIssue) / prices[market.inputToken.id]),
							0.96 * (market.totalDepositBalanceUSD - market.totalBorrowBalanceUSD) / prices[market.inputToken.id]
						) || 0)}
					</Text>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
				<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text>
							{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'STABLE')[0]?.rate ?? 0).toFixed(2)} %
						</Text>
						{Number(rewardAPY("STABLE")) > 0 && <Flex gap={1} mt={0} align={'center'}>
						<Text fontSize={'xs'}>
							+{rewardAPY("STABLE")} %
						</Text>
						<Image src="/veREAX.svg" rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='right' isNumeric>
					<Flex flexDir={'column'} align={'right'} w={'100%'} textAlign={'right'}>
						<Text>
							{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'VARIABLE')[0]?.rate ?? 0).toFixed(2)} %
						</Text>
						{Number(rewardAPY("VARIABLE")) > 0 && <Flex gap={1} mt={0} justify={'end'} align={'center'}>
						<Text fontSize={'xs'}>
							+{rewardAPY("VARIABLE")} %
						</Text>
						<Image src="/veREAX.svg" rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<BorrowModal market={market} amount={amount} setAmount={setAmount} amountNumber={amountNumber} setAmountNumber={setAmountNumber} />
			</Modal>
		</>
	);
}

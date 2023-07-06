import React, { useState } from "react";

import {
	Modal,
	ModalOverlay,
	Tr,
	Flex,
	Image,
	Text,
	Box,
	useDisclosure,
} from "@chakra-ui/react";
import { dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import TdBox from "../../dashboard/TdBox";
import { MdCheck, MdWarning } from "react-icons/md";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import SupplyModal from "./SupplyModal";
import TokenInfo from "../_utils/TokenInfo";

export default function Supply({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const { walletBalances } = useBalanceData();

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
	};

	const _onOpen = () => {
		// if(collateral.token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase()) setIsNative(true);
		onOpen();
	}

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
					<TokenInfo token={market.inputToken} />
				</TdBox>
				
				<TdBox
					isFirst={index == 0}
					alignBox='center'
				>
					<Text w={'100%'} textAlign={'center'}>
					{Number(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0).toFixed(2)} %
					</Text>
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='center'
				>
					<Flex w={'100%'} justify={'center'}>
					{market.canUseAsCollateral ? <MdCheck/> : <MdWarning/>}
					</Flex>
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='right'
					isNumeric
				>
					{dollarFormatter.format(market.totalDepositBalanceUSD)}
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<SupplyModal market={market}
					amountNumber={amountNumber}
					setAmountNumber={setAmountNumber}
					amount={amount}
					setAmount={setAmount}
				/>
			</Modal>
		</>
	);
}

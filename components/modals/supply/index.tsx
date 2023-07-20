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
import { ESYX_PRICE, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import TdBox from "../../dashboard/TdBox";
import { MdCheck, MdWarning } from "react-icons/md";
import SupplyModal from "./SupplyModal";
import TokenInfo from "../_utils/TokenInfo";

export default function Supply({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState("");

	const _onClose = () => {
		setAmount("0");
		onClose();
	};

	const _onOpen = () => {
		// if(collateral.token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase()) setIsNative(true);
		onOpen();
	}

	const rewardAPY = () => {
		let index = market.rewardTokens.map((token: any) => token.id.split('-')[0] == "DEPOSIT").indexOf(true);
		if(index == -1) return '0';
		if(Number(market.totalDepositBalanceUSD) == 0) return 'Infinity';
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
				onClick={_onOpen}
				_hover={{ borderColor: "primary.400", bg: "bg.400" }}
			>
				<TdBox
					isFirst={index == 0}
					alignBox='left'
				>
					<TokenInfo token={market.inputToken} color='primary.200' />
				</TdBox>
				
				<TdBox
					isFirst={index == 0}
					alignBox='center'
				>
					<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text color={'primary.200'}>
						{Number(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0).toFixed(2)} %
						</Text>
						{Number(rewardAPY()) > 0 && <Flex gap={1} mt={0.5} align={'center'}>
						<Text fontSize={'xs'} >
							+{rewardAPY()} %
						</Text>
						<Image src="/veREAX.svg" rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='center'
				>
					<Flex w={'100%'} justify={'center'}>
					{market.canUseAsCollateral ? <MdCheck color="green" size={'20px'}/> : <MdWarning/>}
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
					amount={amount}
					setAmount={setAmount}
				/>
			</Modal>
		</>
	);
}

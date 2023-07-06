import React, { useState } from "react";
import {
	Modal,
	ModalOverlay,
	Tr,
	Flex,
	Text,
	Box,
	useDisclosure,
	Select,
	useToast,
} from "@chakra-ui/react";
import {
	dollarFormatter,
	tokenFormatter
} from "../../../src/const";
import Big from "big.js";
import { useNetwork } from "wagmi";
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { getContract, send } from "../../../src/contract";
import BorrowModal from "./BorrowModal";
import MarketInfo from "../_utils/TokenInfo";
import useHandleError, { PlatformType } from "../../utils/useHandleError";

export default function YourBorrow({ market, index, type }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();
	const [loading, setLoading] = useState(false);

	const _onClose = () => {
		setAmount("");
		setAmountNumber(0);
		onClose();
	};

	const _onOpen = (e: any) => {
		if (e.target.className.includes("chakra-select")) return;
		onOpen();
	}

	const { chain } = useNetwork();
	const toast = useToast();

	const handleError = useHandleError(PlatformType.LENDING);

	const _onSwapModeChange = async (e: any) => {
		const typeNow = type == 'VARIABLE' ? '2' : '1';
		if(e.target.value == typeNow) return;
		setLoading(true);
		const pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
		send(pool, "swapBorrowRateMode", [market.inputToken.id, type == 'VARIABLE' ? '2' : '1'])
		.then(async (res: any) => {
			await res.wait();
			toast({
				title: `Switched ${type} to ${
					type == "VARIABLE" ? "STABLE" : "VARIABLE"
				} for ${market.inputToken.symbol}`,
				description: ``,
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top-right"
			});
			setLoading(false);

		})
		.catch((err: any) => {
			setLoading(false);
			handleError(err);
		})
	}

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={_onOpen}
				_hover={{ bg: 'whiteAlpha.100' }}
			>
				<TdBox isFirst={index == 0} alignBox='left'>
					<MarketInfo token={market.inputToken} />
				</TdBox>
				
				<TdBox isFirst={index == 0} alignBox='center'>
				<Text textAlign={'center'} w={'100%'}>
					{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == type)[0]?.rate ?? 0).toFixed(2)} %
				</Text>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox='center'>
					<Flex w={'100%'} justify={'center'}>
					<Select disabled={loading} size={'xs'} maxW={'100px'} rounded={0} value={type == 'VARIABLE' ? '2' : '1'} onChange={_onSwapModeChange}>
						<option value="2">VARIABLE</option>
						<option value="1">STABLE</option>
					</Select>
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox='right' isNumeric>
					<Box>
					<Text>
					{
						tokenFormatter.format(type == 'VARIABLE' ? Big(walletBalances[market._vToken.id]).div(10**market._vToken.decimals).toNumber() : Big(walletBalances[market._sToken.id]).div(10**market._sToken.decimals).toNumber())
					}
					</Text>
					<Text fontSize={'xs'}>
					{
						dollarFormatter.format((type == 'VARIABLE' ? Big(walletBalances[market._vToken.id]).div(10**market._vToken.decimals) : Big(walletBalances[market._sToken.id]).div(10**market._sToken.decimals)).mul(prices[market.inputToken.id] ?? 0).toNumber())
					}
					</Text>
					</Box>
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<BorrowModal market={market} amount={amount} setAmount={setAmount} amountNumber={amountNumber} setAmountNumber={setAmountNumber} />
			</Modal>
		</>
	);
}

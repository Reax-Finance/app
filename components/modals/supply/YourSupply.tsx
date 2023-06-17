import React, { useState } from "react";

import {
	Modal,
	ModalOverlay,
	Tr,
	Td,
	Flex,
	Image,
	Text,
	Box,
	useDisclosure,
	Switch,
	useToast,
	CircularProgress,
} from "@chakra-ui/react";
import { ADDRESS_ZERO, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";

import { useNetwork, useAccount, useSignTypedData } from 'wagmi';
import { isValidAndPositiveNS } from '../../utils/number';
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceContext";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { getContract } from "../../../src/contract";
import { useLendingData } from "../../context/LendingDataContext";
import { formatLendingError } from "../../../src/errors";
import SupplyModal from "./SupplyModal";

export default function YourSupply({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [tabSelected, setTabSelected] = useState(0);

	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const [isNative, setIsNative] = useState(false);
	const { chain } = useNetwork();
	const { address } = useAccount();
	const { walletBalances } = useBalanceData();
	const [loading, setLoading] = useState(false);

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
		setIsNative(false);
	};

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const { toggleIsCollateral } = useLendingData();
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
				(isNative ? walletBalances[ADDRESS_ZERO] : walletBalances[market.inputToken.id]) ?? 0
			).div(10**market.inputToken.decimals).toString();
		} else {
			const v1 = prices[market.inputToken.id] > 0 ? Big(pos.adjustedCollateral).sub(pos.debt).sub(pos.stableDebt).div(prices[market.inputToken.id]).mul(1e4).div(market.maximumLTV) : Big(0);
			const v2 = Big(walletBalances[market.inputToken.id] ?? 0).div(10**market.inputToken.decimals);
			// min(v1, v2)
			return (v1.gt(v2) ? v2 : v1).toString();
		}
	};

	const _onOpen = (e: any) => {
		// we have a switch (with classname isCollateralSwitch) in this row, so we need to prevent the modal from opening
		if (e.target.className.includes("chakra-switch")) return;
		onOpen();
	}

	const toast = useToast();

	const _switchIsCollateral = async () => {
		setLoading(true);
		// call setUserUseReserveAsCollateral
		const pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
		pool.setUserUseReserveAsCollateral(market.inputToken.id, !market.isCollateral)
		.then(async (res: any) => {
			await res.wait();
			toggleIsCollateral(market.id);
			toast({
				title: `${!market.isCollateral ? 'Disabled' : 'Enabled'} ${market.inputToken.symbol} as collateral`,
				description: `You have ${!market.isCollateral ? 'disabled' : 'enabled'} ${market.inputToken.symbol} as collateral`,
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top-right"
			});
			setLoading(false);

		})
		.catch((err: any) => {
			setLoading(false);
			if(err?.reason == "user rejected transaction"){
				toast({
					title: "Transaction Rejected",
					description: "You have rejected the transaction",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else if(formatLendingError(err)){
				toast({
					title: "Transaction Failed",
					description: formatLendingError(err),
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			} else {
				toast({
					title: "Transaction Failed",
					description: err?.data?.message || JSON.stringify(err).slice(0, 100),
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right"
				})
			}
		})
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
					<Flex gap={3} textAlign='left'>
						<Image
							src={`/icons/${market.inputToken.symbol}.svg`}
							width="38px"
							alt=""
						/>
						<Box>
							<Text color="whiteAlpha.800">{market.inputToken.symbol}</Text>
							<Flex color="whiteAlpha.600" fontSize={"sm"} gap={1}>
								<Text>
									{tokenFormatter.format(
										Big(walletBalances[market.inputToken.id] ?? 0)
										// .add(collateral.nativeBalance ?? 0)
											.div(
												10 **
													(market.inputToken.decimals ?? 18)
											)
											.toNumber()
									)}{" "}
								</Text>
								<Text>
								in wallet
								</Text>
							</Flex>
						</Box>
					</Flex>
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
					<Box w={'100%'} textAlign={'center'}>

					<Text >
					{tokenFormatter.format(Big(walletBalances[market.outputToken.id] ?? 0).div(10**(market.outputToken.decimals ?? 18)).toNumber())}
					</Text>
					<Text fontSize={'xs'} mt={0.5}>
					{dollarFormatter.format(Big(walletBalances[market.outputToken.id] ?? 0).mul(prices[market.inputToken.id] ?? 0).div(10**(market.outputToken.decimals ?? 18)).toNumber())}
					</Text>
					</Box>
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='right'
					isNumeric
				>
					<Flex gap={2}>
					<Switch size="md" isDisabled={loading} className="isCollateralSwitch" colorScheme="secondary" isChecked={market.isCollateral} onChange={_switchIsCollateral} />
					{loading && <CircularProgress size={'20px'} ringColor={'red'} color="red" isIndeterminate={true} />}
					</Flex>
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

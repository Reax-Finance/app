import React from "react";
import {
	Box,
	useDisclosure,
	Text,
	Flex,
	Link,
	useColorMode,
	Heading,
	Divider,
} from "@chakra-ui/react";
import Big from "big.js";
import { ONE_ETH, dollarFormatter } from "../../src/const";
import { VARIANT } from "../../styles/theme";
import { BsBank, BsHeart, BsWallet } from "react-icons/bs";
import { useAppData } from "../context/AppDataProvider";
import { FaArrowRight } from "react-icons/fa";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { RiCashLine } from "react-icons/ri";
import { VscDebugStart } from "react-icons/vsc";

export default function PoolPosition({updatedAccount}: any) {
    const { colorMode } = useColorMode();
	const { account } = useAppData();
    const formatHealthFactor = (hf: string) => Big(hf).div(ONE_ETH).gt(10) ? "10+" : Big(hf).div(ONE_ETH).toFixed(2);
	if(!account) return <></>;

	return (
		<Box
			className={`${VARIANT}-${colorMode}-containerBody`}
			p={4}
		>
			<Flex justify={"space-between"}>
				<Flex gap={2} align={"center"}>
					<Heading size={"sm"}>Your Position</Heading>
				</Flex>
			</Flex>
			<Divider mt={2} />
			<Flex flexDir={'column'} mt={4}>
				<PoolStat icon={<RiCashLine size={'18px'}/>} title={'Staked Balance'} value={dollarFormatter.format(Big(account.userTotalBalanceUSD).div(ONE_ETH).toNumber())} updatedValue={dollarFormatter.format(Big(updatedAccount.userTotalBalanceUSD).div(ONE_ETH).toNumber())} />
				<PoolStat icon={<BsBank />} title={'Debt'} value={dollarFormatter.format(Big(account.userTotalDebtUSD).div(ONE_ETH).toNumber())} updatedValue={dollarFormatter.format(Big(updatedAccount.userTotalDebtUSD).div(ONE_ETH).toNumber())} />
				<Divider my={2} />
				<PoolStat icon={<BsHeart />} title={'Health Factor'} value={formatHealthFactor(account.healthFactor)} updatedValue={formatHealthFactor(updatedAccount.healthFactor)} />
				<PoolStat icon={<VscDebugStart />} title={'Available to mint'} value={dollarFormatter.format(Big(account.availableToMintUSD).div(ONE_ETH).toNumber())} updatedValue={dollarFormatter.format(Big(updatedAccount.availableToMintUSD).div(ONE_ETH).toNumber())} />
			</Flex>
		</Box>
	);
}

export const PoolStat = ({ title, value, updatedValue, icon }: any) => {
	const { colorMode } = useColorMode();
	const hasChanged = updatedValue ? value !== updatedValue : false;

	return (<Flex w={'100%'} align={'center'} className={`${VARIANT}-${colorMode}-containerBody2`} p={3} px={3} my={1} gap={3}>
		<Box color={'secondary.400'}>
		{icon}
		</Box>
		<Flex flexDir={'column'} justify="space-between" >
			<Text fontSize={'sm'} casing={'uppercase'} fontWeight={'bold'}>{title}</Text>
			<Flex align={"center"} gap={1}>
				<Text>{value}</Text>
				{hasChanged && <Flex align={'center'} gap={1} color={'primary.400'}>
				<ArrowRightIcon h={"10px"} />
				<Text>{updatedValue}</Text>
				</Flex>}
			</Flex>
		</Flex>
		</Flex>
	);
}

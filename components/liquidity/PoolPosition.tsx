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
import { DiAtom } from "react-icons/di";
import { Account } from "../utils/types";

export default function PoolPosition({ updatedAccount, account }: { updatedAccount?: Account; account?: Account }) {
	const { colorMode } = useColorMode();
	const formatHealthFactor = (hf: string) =>
		Big(hf).div(ONE_ETH).gt(10) ? "10+" : Big(hf).div(ONE_ETH).toFixed(2);
	if (!account || !updatedAccount?.userDebtUSD) return <></>;

	return (
		<Box className={`${VARIANT}-${colorMode}-containerBody`} p={4}>
			<Flex justify={"space-between"}>
				<Flex gap={2} align={"center"}>
					<Heading size={"sm"}>Your Position</Heading>
				</Flex>
			</Flex>
			<Divider mt={2} />
			<Flex flexDir={"column"} mt={4}>
				<PoolStat
					icon={<RiCashLine size={"18px"} />}
					title={"Staked Balance"}
					value={Big(account.userTotalBalanceUSD.toString()).div(ONE_ETH).toNumber()}
					updatedValue={Big(updatedAccount.userTotalBalanceUSD.toString())
							.div(ONE_ETH)
							.toNumber()}
					formatter={dollarFormatter.format}
				/>
				<PoolStat
					icon={<BsBank />}
					title={"Debt"}
					value={Big(account.userDebtUSD.toString()).div(ONE_ETH).toNumber()}
					updatedValue={Big(updatedAccount.userDebtUSD.toString())
							.div(ONE_ETH)
							.toNumber()}
					formatter={dollarFormatter.format}
				/>
				<Divider my={2} />
				<PoolStat
					icon={<BsHeart />}
					title={"Health Factor"}
					value={account.accountHealth.toString()}
					updatedValue={updatedAccount.accountHealth.toString()}
					formatter={formatHealthFactor}
				/>
				<PoolStat
					icon={<DiAtom size={'20px'} />}
					title={"Available to mint"}
					value={Big(account.userAdjustedBalanceUSD.toString()).sub(account.userDebtUSD.toString()).div(ONE_ETH).toNumber()}
					updatedValue={Big(account.userAdjustedBalanceUSD.toString()).sub(account.userDebtUSD.toString())
							.div(ONE_ETH)
							.toNumber()}
					formatter={dollarFormatter.format}
				/>
			</Flex>
		</Box>
	);
}

export const PoolStat = ({ title, value, updatedValue, icon, formatter }: any) => {
	const { colorMode } = useColorMode();
	// if diff is greater than 1%
	const hasChanged = updatedValue !== undefined ? Math.abs(
				(value - updatedValue) / value
		  ) > 0.01 : false;

	return (
		<Flex
			w={"100%"}
			align={"center"}
			className={`${VARIANT}-${colorMode}-containerBody2`}
			p={3}
			px={3}
			my={1}
			gap={3}
		>
			<Box color={"secondary.400"}>{icon}</Box>
			<Flex flexDir={"column"} justify="space-between">
				<Text fontSize={"sm"} casing={"uppercase"} fontWeight={"bold"}>
					{title}
				</Text>
				<Flex align={"center"} gap={1}>
					<Text>{formatter(value)}</Text>
					{hasChanged && (
						<Flex align={"center"} gap={1} color={"primary.400"}>
							<ArrowRightIcon h={"10px"} />
							<Text>{formatter(updatedValue)}</Text>
						</Flex>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
};

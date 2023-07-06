import {
	Flex,
	Modal,
	Image,
	Text,
	Button,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Tr,
	useDisclosure,
	ModalBody,
	Box,
	Tag,
} from "@chakra-ui/react";
import React from "react";
import TdBox from "../dashboard/TdBox";
import { dollarFormatter } from "../../src/const";
import Join from "./actions/join/index";
import { useBalanceData } from "../context/BalanceProvider";
import Exit from "./actions/exit";
import { usePriceData } from "../context/PriceContext";

export default function YourPoolPosition({ pool, index }: any) {
	const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
	const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
    const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();

	const calcApy = () => {
		let totalFees = 0;
		for(let i in pool.snapshots){
			totalFees += Number(pool.snapshots[i].swapFees);
		}
		const dailyFee = totalFees / pool.snapshots.length;
		if(pool.totalLiquidity == 0) return (dailyFee * 365);
		const dailyApy = (1 + dailyFee / liquidity) ** 365 - 1;
		return dailyApy * 100;
	}

	const liquidity = pool.tokens.reduce((acc: any, token: any) => {
		return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
	}, 0);

	const yourBalance = () => {
		const totalShares = pool.totalShares;
		const yourShares = walletBalances[pool.address];
		const liquidity = pool.tokens.reduce((acc: any, token: any) => {
			return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
		}, 0);
		return (yourShares / totalShares) * liquidity / 1e18;
	}

	return (
		<>
			<Tr>
				<TdBox isFirst={index == 0} alignBox="center">
					<Flex ml={4}>
						{pool.tokens.map((token: any, index: number) => {
							return (
								pool.address !== token.token.id && (
									<Flex
										ml={"-2"}
										key={index}
										align="center"
										gap={2}
									>
										<Image
											src={`/icons/${token.token.symbol}.svg`}
											alt=""
											width={"32px"}
										/>
									</Flex>
								)
							);
						})}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
					<Flex align={'center'} gap={1}>
						{pool.tokens.map((token: any, index: number) => {
							return (
								pool.address !== token.token.id && (
									<Flex
										className="smallcutoutcornersbox"
										p={2}
										key={index}
										align="center"
										gap={2}
									>
										<Text>
											{token.token.symbol}
											{pool.totalWeight > 0
											? "(" +(100 * token.weight) /
													pool.totalWeight +
												"%" + ")"
											: ""}
										</Text>
									</Flex>
								)
							);
						})}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
					<Flex w={"100%"} justify={"center"}>
						{dollarFormatter.format(yourBalance())}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
				<Flex w={'100%'} justify={'center'}>
					{calcApy().toFixed(2)}%
                  </Flex>
				</TdBox>

				<TdBox isNumeric>
					<Flex gap={2}>
						<Box className="mainButton">
							<Button
								onClick={onWithdrawOpen}
								color={"white"}
								size={"md"} 
								bg={'transparent'} 
								_hover={{bg: 'transparent'}}
							>
								Withdraw
							</Button>
						</Box>
						<Box className="outlinedButton">
							<Button onClick={onDepositOpen} size={"md"} bg={'transparent'} _hover={{bg: 'transparent'}}>
								Deposit
							</Button>
						</Box>
					</Flex>
				</TdBox>
			</Tr>

			<Join pool={pool} isOpen={isDepositOpen} onClose={onDepositClose} />
			<Exit pool={pool} isOpen={isWithdrawOpen} onClose={onWithdrawClose} />
		</>
	);
}

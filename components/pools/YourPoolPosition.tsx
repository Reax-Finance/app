import {
	Flex,
	Image,
	Text,
	Button,
	Tr,
	useDisclosure,
	Box,
} from "@chakra-ui/react";
import React from "react";
import TdBox from "../dashboard/TdBox";
import { ESYX_PRICE, dollarFormatter } from "../../src/const";
import Join from "./actions/join/index";
import { useBalanceData } from "../context/BalanceProvider";
import Exit from "./actions/exit";
import { usePriceData } from "../context/PriceContext";
import Big from "big.js";
import { useDexData } from "../context/DexDataProvider";
import Stake from "./actions/stake";

export default function YourPoolPosition({ pool, index }: any) {
	const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
	const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
	const { isOpen: isStakeOpen, onOpen: onStakeOpen, onClose: onStakeClose } = useDisclosure();

    const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();
	const { dex } = useDexData();

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

	const stakedBalance = () => {
		const totalShares = pool.totalShares;
		const yourShares = pool.stakedBalance;
		const liquidity = pool.tokens.reduce((acc: any, token: any) => {
			return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
		}, 0);
		return (yourShares / totalShares) * liquidity / 1e18;
	}

	const rewardsApy = liquidity > 0 ? Big(pool.allocPoint ?? 0)
			.div(dex.totalAllocPoint ?? 1)
			.mul(dex.sushiPerSecond)
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(liquidity ?? 1)
			.mul(100)
			.toFixed(2) : 0;

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
										className="outlinedBox"
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
					<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text>{dollarFormatter.format(yourBalance())}</Text>
						<Flex gap={1.5} mt={1} align={'center'}>
						<Text color={'whiteAlpha.600'} fontSize={'xs'}>{(calcApy()).toFixed(2)}%</Text>
						</Flex>
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
				<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text color={'secondary.200'}>{dollarFormatter.format(stakedBalance())}</Text>
						<Flex gap={1.5} mt={1} align={'center'}>
						{Number(rewardsApy) > 0 && <Flex gap={1} mt={0} align={'center'}>
						<Text color={'whiteAlpha.600'} fontSize={'xs'}>
						{(calcApy()).toFixed(2)}% + {rewardsApy} %
						</Text>
						<Image src="/veREAX.svg" rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}						</Flex>
					</Flex>
				</TdBox>

				<TdBox isNumeric>
					<Flex gap={2}>
					<Box className="primaryButton">
							<Button
								onClick={onStakeOpen}
								color={"white"}
								size={"md"} 
								bg={'transparent'} 
								_hover={{bg: 'transparent'}}
							>
								Stake
							</Button>
						</Box>
						<Box className="secondaryButton">
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
			<Stake pool={pool} isOpen={isStakeOpen} onClose={onStakeClose} />
		</>
	);
}

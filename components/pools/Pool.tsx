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
import { dollarFormatter } from "../../src/const";
import Join from "./actions/join/index";
import Details from "./actions/Details";
import { usePriceData } from "../context/PriceContext";

export default function Pool({ pool, index }: any) {
	const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
	const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

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

	const { prices } = usePriceData();

	const liquidity = pool.tokens.reduce((acc: any, token: any) => {
		return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
	}, 0);

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
					<Flex gap={1}>
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
						{dollarFormatter.format(liquidity)}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
					<Flex w={"100%"} justify={"center"}>
					{calcApy().toFixed(2)}%
					</Flex>
				</TdBox>

				<TdBox isNumeric>
					<Flex gap={2}>
						<Box className="mainButton">
							<Button
								onClick={onDepositOpen}
								color={"white"}
								size={"md"} 
								bg={'transparent'} 
								_hover={{bg: 'transparent'}}
							>
								Deposit
							</Button>
						</Box>
						<Box className="outlinedButton">
							<Button onClick={onDetailsOpen} size={"md"} bg={'transparent'} _hover={{bg: 'transparent'}}>
								View Details
							</Button>
						</Box>
					</Flex>
				</TdBox>
			</Tr>
			
			<Join pool={pool} isOpen={isDepositOpen} onClose={onDepositClose} />
			<Details pool={pool} isOpen={isDetailsOpen} onClose={onDetailsClose} />
		</>
	);
}

import React from "react";
import { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableContainer,
	Box,
	Skeleton,
	Heading,
	Text,
	Flex
} from "@chakra-ui/react";

import ThBox from "./../ThBox";
import { useLendingData } from "../../context/LendingDataContext";
import { useBalanceData } from "../../context/BalanceContext";
import YourSupply from "../../modals/supply/YourSupply";
import { dollarFormatter, tokenFormatter } from '../../../src/const';
import { usePriceData } from "../../context/PriceContext";
import Big from "big.js";

export default function YourSupplies() {
	const { markets } = useLendingData();
	const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();

	const suppliedMarkets = markets.filter((market: any) => {
		return walletBalances[market.outputToken.id] > 0;
	});

	if(suppliedMarkets.length > 0) return (
		<Box>
			<Box className="cutoutcornersboxright" px={5} py={5}>
				<Heading size={'md'} color={'primary.400'}>Your Supplies</Heading>
			</Box>

			{markets.length > 0 ? ( <>
					{suppliedMarkets.length > 0 ? <TableContainer pb={4}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										APY
									</Text>
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										Balance
									</Text>
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Collateral
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{suppliedMarkets.map(
									(market: any, index: number) => {
										return <YourSupply
											key={index}
											market={market}
											index={index}
										/>
									}
								)}
							</Tbody>
						</Table>
					</TableContainer> : <Box py={5}>
						<Text textAlign={'center'} color={'whiteAlpha.400'}>You have no supplied assets.</Text>
						</Box>}
					</>
			) : (
				<Box pt={0.5}>
					<Skeleton height="50px" m={6} mt={8} rounded={12} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
				</Box>
			)}
		</Box>
	);

	else return <></>;
}

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
	Divider,
	Flex,
	Text
} from "@chakra-ui/react";

import ThBox from "../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";

import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useBalanceData } from "../../context/BalanceProvider";
import YourSupply from "../../modals/supply/YourSupply";
import YourBorrow from "../../modals/borrow/YourBorrow";
import Big from "big.js";
import { usePriceData } from "../../context/PriceContext";
import { dollarFormatter, tokenFormatter } from "../../../src/const";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
const pageSize = 9;

export default function YourBorrows() {
	const { markets } = useLendingData();
	
	const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();
	
	const borrowedMarkets = markets.filter((market: any) => {
		return walletBalances[market._vToken.id] > 0 || walletBalances[market._sToken.id] > 0;
	});

	if(borrowedMarkets.length > 0) return (
		<Box h={'100%'}>
			<Box className="containerHeader" px={5} py={5}>
				<Heading fontSize={'18px'} color={'primary.400'}>Your Borrows</Heading>
			</Box>

			{markets.length > 0 ? ( <>
					{borrowedMarkets.length > 0 ? <TableContainer pb={4}>
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
										Type
									</Text>
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Balance
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{borrowedMarkets.map(
									(market: any, index: number) => ( <>
										{walletBalances[market._vToken.id] > 0 && <YourBorrow
											key={index}
											market={market}
											index={index}
											type='VARIABLE'
										/>}

										{walletBalances[market._sToken.id] > 0 && <YourBorrow
											key={index}
											market={market}
											index={index}
											type='STABLE'
										/>}
										</>
									)
								)}
							</Tbody>
						</Table>
					</TableContainer>
					
				: <Box py={5}>
				<Text textAlign={'center'} color={'whiteAlpha.400'}>You have no borrowed assets.</Text>
				</Box>
				}
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

	else return <></>
}

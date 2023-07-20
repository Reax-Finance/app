import React from "react";
import { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tr,
	TableContainer,
	Box,
	Skeleton,
	Heading,
	Flex,
	Text
} from "@chakra-ui/react";

import ThBox from "../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";
import { useBalanceData } from "../../context/BalanceProvider";
import YourBorrow from "../../modals/borrow/YourBorrow";
import { usePriceData } from "../../context/PriceContext";

export default function YourBorrows() {
	const { markets } = useLendingData();	
	const { walletBalances } = useBalanceData();
	
	const borrowedMarkets = markets.filter((market: any) => {
		return walletBalances[market._vToken.id] > 0 || walletBalances[market._sToken.id] > 0;
	});

	const suppliedMarkets = markets.filter((market: any) => {
		return walletBalances[market.outputToken.id] > 0;
	});

	if(borrowedMarkets.length > 0 || suppliedMarkets.length > 0) return (
		<Flex flexDir={'column'} justify={'center'} h={'100%'}>
			<Box className="containerHeader" px={5} py={5}>
				<Heading fontSize={'18px'} color={'secondary.400'}>Your Borrows</Heading>
			</Box>

			{markets.length > 0 ? ( <>
					{borrowedMarkets.length > 0 ? <TableContainer h='100%' pb={4}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										Interest APY
									</Text>
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
									My Balance
									</Text>
									</ThBox>
									<ThBox alignBox='right' isNumeric>
									Type
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
					: <Flex flexDir={'column'} justify={'center'} h='100%' py={5}>
					<Text textAlign={'center'} color={'whiteAlpha.600'}>You have no borrowed assets.</Text>
					</Flex>
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
		</Flex>
	);

	else return <></>
}

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
	Flex,
	useColorMode
} from "@chakra-ui/react";

import ThBox from "./../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";
import { useBalanceData } from "../../context/BalanceProvider";
import YourSupply from "../../modals/supply/YourSupply";
import { dollarFormatter, tokenFormatter } from '../../../src/const';
import { usePriceData } from "../../context/PriceContext";
import Big from "big.js";
import { VARIANT } from "../../../styles/theme";

export default function YourSupplies() {
	const { markets } = useLendingData();
	const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();

	const suppliedMarkets = markets.filter((market: any) => {
		if(!walletBalances[market.outputToken.id] || !prices[market.inputToken.id]) return false;
		let supplied = Big(walletBalances[market.outputToken.id]).mul(prices[market.inputToken.id]).div(10**market.outputToken.decimals);
		return supplied.gt(0);
	});

	const { colorMode } = useColorMode();

	if(suppliedMarkets.length > 0) return (
		<Box>
			<Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={5}>
				<Heading fontSize={'18px'} color={'primary.400'}>Your Supplies</Heading>
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
										Earning APY
									</Text>
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										My Balance
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
						<Text textAlign={'center'} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>You have no supplied assets.</Text>
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

import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import { useLendingData } from '../../context/LendingDataProvider'
import { dollarFormatter } from '../../../src/const';

export default function LendingMarket() {
    const {protocol} = useLendingData();
  return (
    <>
        <Box
            w="100%"
            display={{ sm: "block", md: "flex" }}
            justifyContent={"space-between"}
            alignContent={"start"}
            mt={10}
            mb={6}
        >
            <Box>
					<Heading fontSize={{sm: '3xl', md: "3xl", lg: '32px'}} fontWeight='bold'>Lending Market</Heading>
					<Flex mt={7} mb={4} gap={10}>
						<Flex gap={2}>
							<Heading size={"sm"} color={"primary.400"}>
								Total Supplied
							</Heading>
							<Heading size={"sm"}>{dollarFormatter.format(protocol.totalDepositBalanceUSD ?? 0)}</Heading>
						</Flex>

						<Flex gap={2}>
							<Heading size={"sm"} color={"secondary.400"}>
								Total Borrowed
							</Heading>
							<Heading size={"sm"}>{dollarFormatter.format(protocol.totalBorrowBalanceUSD ?? 0)}</Heading>
						</Flex>
					</Flex>
				</Box>
        </Box>
    </>
  )
}

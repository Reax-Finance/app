import { Box, Button, Flex, Heading, useToast, Text } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { useLendingData } from '../../context/LendingDataProvider'
import { dollarFormatter } from '../../../src/const';
import PoolSelector from './PoolSelector';
import { TokenContext } from '../../context/TokenContext';
import { useAccount, useNetwork } from 'wagmi';
import { getContract } from '../../../src/contract';
import Big from 'big.js';

export default function LendingMarket() {
    const {protocol, markets, pools, selectedPool} = useLendingData();

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);
	const { chain: connectedChain } = useNetwork();
	const { address, isConnected } = useAccount();

	const { claimed } = useContext(TokenContext);
	const toast = useToast();

	useEffect(() => {
		if (connectedChain && pools[selectedPool]) {
			if (
				isConnected &&
				!(connectedChain as any).unsupported &&
				pools.length > 0
			) {
				// getContract("RewardsController", connectedChain!.id).then((synthex) => {
				// 	synthex.callStatic
				// 		.getRewardsAccrued(
				// 			[pools[0].rewardTokens[0].id],
				// 			address,
				// 			[pools[selectedPool].id]
				// 		)
				// 		.then((result) => {
				// 			setSynAccrued(result[0].toString());
				// 		})
				// 		.catch((err) => {
				// 			console.log("Failed to getRewardsAccrued", err);
				// 		})
				// });
			}
		}
	}, [connectedChain, synAccrued, isConnected, pools, address, selectedPool]);


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
					{/* <Heading fontSize={{sm: '3xl', md: "3xl", lg: '32px'}} fontWeight='bold'>Lending Market</Heading> */}
					<PoolSelector />
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

				{
					(pools[selectedPool] /**?.userDebt > 0 || synAccrued > 0*/) 
					&&
					<Box textAlign={"right"}>
					<Heading size={"sm"} color={"whiteAlpha.600"}>
						Rewards
					</Heading>
					<Box gap={20} mt={2}>
						<Flex justify={"end"} align={"center"} gap={2}>
							<Text fontSize={"2xl"}>{synAccrued ? Big(synAccrued).div(10**18).toFixed(2) : '-'} </Text>
							<Text fontSize={"2xl"} color={"whiteAlpha.400"}>
								veREAX
							</Text>
						</Flex>
						<Box mt={2} w={'100%'} className="outlinedButton">
						<Button
							// onClick={claim}
							bg={'transparent'}
							w="100%"
							rounded={0}
							size={"sm"}
                            isLoading={claiming}
                            loadingText={"Claiming"}
                            isDisabled={synAccrued == null || Number(synAccrued) == 0}
							_hover={{ bg: "transparent" }}
						>
							Claim
						</Button>
						</Box>
					</Box>
				</Box>}
        </Box>
    </>
  )
}

import React from 'react'
import TradingViewWidget from './TradingViewWidget'
import { useRouter } from 'next/router';
import { useLendingData } from '../context/LendingDataProvider';
import { Box, Divider, Flex, Heading } from '@chakra-ui/react';
import { useBalanceData } from '../context/BalanceProvider';
import PairSelector from './PairSelector';
import TitleBar from './TitleBar';
import Trade from './trade';
import Positions from './positions';

export default function Perps({pair}: any) {
    const router = useRouter();
    const { tokens : allTokens } = useBalanceData();

    if(allTokens.length == 0) return <></>;

    return (
        <>
            <Box className="containerBody" my={5} px={5}>
                <TitleBar />
            </Box>
            <Flex gap={2}>
                <Box w={'68%'}>
                    {pair && <TradingViewWidget/>}
                </Box>
                <Divider orientation="vertical" h={'100%'} />
                <Box w={'32%'} className="containerBody">
                    <Trade />
                </Box>
            </Flex>
            <Positions />

        </>
    )
}

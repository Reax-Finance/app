import React from 'react'
import TradingViewWidget from './TradingViewWidget'
import { useRouter } from 'next/router';
import { useLendingData } from '../context/LendingDataProvider';
import { Box, Divider, Flex, Heading, useColorMode } from '@chakra-ui/react';
import { useBalanceData } from '../context/BalanceProvider';
import PairSelector from './PairSelector';
import TitleBar from './TitleBar';
import Trade from './trade';
import Positions from './positions';
import { VARIANT } from '../../styles/theme';

export default function Perps({pair}: any) {
    const router = useRouter();
    const { tokens : allTokens } = useBalanceData();
    const {colorMode} = useColorMode();

    if(allTokens.length == 0) return <></>;


    return (
        <>
            <Box className={`${VARIANT}-${colorMode}-containerBody2`} mb={4} mt={10} px={5}>
                <TitleBar />
            </Box>
            <Flex gap={2}>
                <Box w={'65%'}>
                    {pair && <TradingViewWidget/>}
                </Box>
                <Divider orientation="vertical" h={'100%'} />
                <Box w={'35%'} className={`${VARIANT}-${colorMode}-containerBody`}>
                    <Trade />
                </Box>
            </Flex>
            <Positions />

        </>
    )
}

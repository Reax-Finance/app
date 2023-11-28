import React from 'react'
import TradingViewWidget from './graph/TradingViewWidget'
import { Box, Divider, Flex, Heading, useColorMode } from '@chakra-ui/react';
import { useBalanceData } from '../context/BalanceProvider';
import TitleBar from './TitleBar';
import Trade from './trade';
import Positions from './positions';
import { VARIANT } from '../../styles/theme';
import Loading from '../utils/Loading';

export default function Perps({pair}: any) {
    const { tokens : allTokens } = useBalanceData();
    const {colorMode} = useColorMode();

    if(allTokens.length == 0) return <Loading />

    return (
        <>
            <Box className={`${VARIANT}-${colorMode}-containerHeader`} mb={4} mt={10} px={5}>
                <TitleBar />
            </Box>
            <Flex gap={2} align={'stretch'}>
                <Box w={'65%'} h={'100%'}>
                    {pair && <TradingViewWidget pair={pair} colorMode={colorMode}/>}
                </Box>
                <Divider orientation="vertical" h={'100%'} />
                <Box w={'35%'} bg={colorMode + 'Bg.600'}>
                    <Trade />
                </Box>
            </Flex>
            <Positions />
        </>
    )
}

import { Box, Divider, Flex, Heading, Text, Tooltip, useColorMode } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import PairSelector from './PairSelector'
import { usePriceData } from '../context/PriceContext';
import router from 'next/router';
import { useAppData } from '../context/AppDataProvider';
import { SynthData } from '../utils/types';

export default function TitleBar({pair}: any) {
    const { prices } = usePriceData();
    const { pairs, synths } = useAppData();

    const [token0Rate, setToken0Rate] = React.useState(['0', '0']);
    const [token1Rate, setToken1Rate] = React.useState(['0', '0']);
    
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (!pair || !pairs) return;

        const currentPair = pairs.find(p => p.id === pair);
        if (!currentPair) return;

        const updateRates = (synth: SynthData, setRate: React.Dispatch<React.SetStateAction<string[]>>) => {
            const interestRate = synth.market.interestRate;
            setRate([
                (Number(interestRate) / 1e18).toFixed(2),
                (-Number(interestRate) / 1e18).toFixed(2)
            ]);
        };

        updateRates(currentPair.synth1, setToken0Rate);
        updateRates(currentPair.synth2, setToken1Rate);
    }, [pair, pairs, synths]);

    const getCurrentPair = () => pairs?.find(p => p.id === pair);

    return (
        <>
        <Flex minH={'80px'} align={'center'}>
            <Box>
            <PairSelector />
            </Box>
            <Divider orientation="vertical" h={'80px'} />
            <Box px={10}>
                <Text color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'} fontSize={'sm'}>Index Price</Text>
                <Heading size={'md'}>
                    {(() => {
                        const currentPair = getCurrentPair();
                        if (!currentPair) return '0';
                        const price0 = Number(currentPair.synth1.synth.price) / 1e18;
                        const price1 = Number(currentPair.synth2.synth.price) / 1e18;
                        return (price0 / price1).toFixed(4);
                    })()}
                </Heading>
            </Box>
            <Divider orientation="vertical" h={'80px'} />
            <Box px={6}>
                <Text color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'} fontSize={'sm'}>Base APY</Text>
                <Flex>
                    <Tooltip label="LONG" aria-label="LONG">
                        <Heading size={'sm'}>
                            {((Number(token0Rate[0]) ?? 0) + (Number(token1Rate[1]) ?? 0)).toFixed(4)}%
                        </Heading>
                    </Tooltip>
                    <Text>
                        /
                    </Text>
                    <Tooltip label="SHORT" aria-label="SHORT">
                        <Heading size={'sm'}>
                            {((Number(token0Rate[1]) ?? 0) + (Number(token1Rate[0]) ?? 0)).toFixed(4)}%
                        </Heading>
                    </Tooltip>
                </Flex>
            </Box>
        </Flex>
        </>
    )
}

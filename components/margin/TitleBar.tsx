import { Box, Divider, Flex, Heading, Text, Tooltip, useColorMode } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import PairSelector from './PairSelector'
import { usePriceData } from '../context/PriceContext';
import router from 'next/router';
import { useLendingData } from '../context/LendingDataProvider';
import { usePerpsData } from '../context/PerpsDataProvider';

export default function TitleBar() {
    
    const { prices } = usePriceData();
    const { pair }: any = router.query;
    const {pairs } = usePerpsData();

    const [token0Rate, setToken0Rate] = React.useState(['0', '0']);
    const [token1Rate, setToken1Rate] = React.useState(['0', '0']);
    
    const { pools } = useLendingData();
    const { colorMode } = useColorMode();

    useEffect(() => {
        for(let i in pools){
            let markets = pools[i];
            for(let j in markets){
                if(markets[j].inputToken.id == pairs[pair].token0.id){
                    setToken0Rate([
                        Number(markets[j].rates.find((rate: any) => rate.side == "LENDER").rate).toFixed(2),
                        (Number(markets[j].rates.find((rate: any) => rate.side == "BORROWER" && rate.type == "VARIABLE").rate) * -1).toFixed(2),
                    ])
                } else if(markets[j].inputToken.id == pairs[pair].token1.id){
                    setToken1Rate([
                        Number(markets[j].rates.find((rate: any) => rate.side == "LENDER").rate).toFixed(2),
                        (Number(markets[j].rates.find((rate: any) => rate.side == "BORROWER" && rate.type == "VARIABLE").rate) * -1).toFixed(2),
                    ])
                }
            }
        }
    }, [pair]);

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
                    {(Number(prices[pairs[pair as string]?.token0?.id] ?? 0) / Number(prices[pairs[pair as string]?.token1?.id] ?? 0)).toFixed(4)}
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

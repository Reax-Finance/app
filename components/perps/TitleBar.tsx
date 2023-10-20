import { Box, Divider, Flex, Heading, Text, Tooltip } from '@chakra-ui/react'
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

    const [baseFundingRate, setBaseFundingRate] = React.useState(['0', '0']);
    const [quoteFundingRate, setQuoteFundingRate] = React.useState(['0', '0']);
    
    const { pools } = useLendingData();
    useEffect(() => {
        for(let i in pools){
            let markets = pools[i];
            for(let j in markets){
                if(markets[j].inputToken.id == pairs[pair].token0.id){
                    setBaseFundingRate([
                        Number(markets[j].rates.find((rate: any) => rate.side == "LENDER").rate).toFixed(2),
                        (Number(markets[j].rates.find((rate: any) => rate.side == "BORROWER" && rate.type == "VARIABLE").rate) * -1).toFixed(2),
                    ])
                } else if(markets[j].inputToken.id == pairs[pair].token1.id){
                    setQuoteFundingRate([
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
                <Text color={'whiteAlpha.600'} fontSize={'sm'}>Index Price</Text>
                <Heading size={'md'}>
                    {(Number(prices[pairs[pair as string]?.token0?.id] ?? 0) / Number(prices[pairs[pair as string]?.token1?.id] ?? 0)).toFixed(4)}
                </Heading>
            </Box>
            <Divider orientation="vertical" h={'80px'} />
            <Box px={6}>
                <Text color={'whiteAlpha.600'} fontSize={'sm'}>Funding Rate</Text>
                <Flex>
                    <Tooltip label="LONG" aria-label="LONG">
                        <Heading size={'sm'}>
                            {((Number(baseFundingRate[0]) ?? 0) + (Number(quoteFundingRate[1]) ?? 0)).toFixed(4)}%
                        </Heading>
                    </Tooltip>
                    <Tooltip label="SHORT" aria-label="SHORT">
                        <Heading size={'sm'}>
                            / {((Number(baseFundingRate[1]) ?? 0) + (Number(quoteFundingRate[0]) ?? 0)).toFixed(4)}%
                        </Heading>
                    </Tooltip>
                </Flex>
            </Box>
        </Flex>
        </>
    )
}

import React from 'react'
import TradingViewWidget from './TradingViewWidget'
import { useRouter } from 'next/router';
import { useLendingData } from '../context/LendingDataProvider';
import { Heading } from '@chakra-ui/react';
import { PERP_CATEGORIES } from '../../src/const';
import TokenSelector from './TokenSelector';
import { useBalanceData } from '../context/BalanceProvider';

export default function Perps({category}: any) {
    const router = useRouter();
    const { tokens : allTokens } = useBalanceData();

    if(allTokens.length == 0) return <></>;

    let tokens = category.tokens.map((i: any) => allTokens.find((j: any) => j.id == i));

    return (
        <>
        {/* <TokenSelector tokens={tokens} /> */}
            {/* {asset && <TradingViewWidget asset={parsedAsset}/>} */}
        </>
    )
}

import React from 'react'
import { useLendingData } from '../../components/context/LendingDataProvider'
import { Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PERP_CATEGORIES } from '../../src/const';

export default function Perps() {
    const {markets} = useLendingData();
    const router = useRouter();
    let firstCategory = 10;
    let asset = '';
    for(let i in markets){
        if(markets[i].eModeCategory && Number(markets[i].eModeCategory.id) < firstCategory && PERP_CATEGORIES[markets[i].eModeCategory.id]){
            firstCategory = Number(markets[i].eModeCategory.id);
            asset = markets[i].inputToken.symbol;
        }
    }

    if(firstCategory === 10){
  return (
    <Heading color={'secondary.400'}>
    Taking you through
    </Heading>
  )} else {
    router.push(`/perps/${firstCategory}`);
    return (
        <></>
    )
  }
}

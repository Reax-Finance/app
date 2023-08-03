import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import Perps from '../../components/perps'
import router, { useRouter } from 'next/router';
import { PERP_PAIRS } from '../../src/const';
import { useBalanceData } from '../../components/context/BalanceProvider';

export default function PerpsPair() {
  // get pair id from url
  const { pair } = router.query;

  if(!pair) return <></>;

  const selectedCategory = Object.keys(PERP_PAIRS).filter((i: any) => i == pair);
  if(selectedCategory.length == 0) {
    router.push(`/perps/${Object.keys(PERP_PAIRS)[0]}`)
    return <></>
  }

  return (
    <>
      <Perps pair={pair} />
    </>
  )
}

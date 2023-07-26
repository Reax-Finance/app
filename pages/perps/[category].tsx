import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import Perps from '../../components/perps'
import { useRouter } from 'next/router';
import { PERP_CATEGORIES } from '../../src/const';
import { useBalanceData } from '../../components/context/BalanceProvider';

export default function PerpsPair() {
  // get pair id from url
  const router = useRouter();
  const { tokens : allTokens } = useBalanceData();
  const { category } = router.query;

  const selectedCategory = PERP_CATEGORIES.filter((i: any) => i.name == category);
  if(selectedCategory.length == 0) {
    router.push(`/perps/${PERP_CATEGORIES[0].name}`)
    return <></>
  }

  return (
    <>
      <Perps category={selectedCategory[0]}/>
    </>
  )
}

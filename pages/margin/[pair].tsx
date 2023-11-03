import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import Perps from '../../components/margin'
import router, { useRouter } from 'next/router';
import { usePerpsData } from '../../components/context/PerpsDataProvider';
import Loading from '../../components/utils/Loading';

export default function PerpsPair() {
  // get pair id from url
  const { pair } = router.query;
  const { pairs } = usePerpsData();

  if(!pair) return <Loading />

  if(Object.keys(pairs).length > 0){
    const selectedCategory = Object.keys(pairs).filter((i: any) => i == pair);
    if(selectedCategory.length == 0) {
      router.push(`/margin/${Object.keys(pairs)[0]}`)
      return <Loading />
    }
  }

  return (
    <>
      <Perps pair={pair} />
    </>
  )
}

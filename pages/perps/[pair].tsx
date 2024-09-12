import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import Perps from '../../components/perps'
import router, { useRouter } from 'next/router';
import { usePerpsData } from '../../components/context/PerpsDataProvider';
import Loading from '../../components/utils/Loading';
import Head from 'next/head';

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
      <Head>
        <title>{process.env.NEXT_PUBLIC_TOKEN_SYMBOL} | Margin</title>
        <link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}></link>
      </Head>
      <Perps pair={pair} />
    </>
  )
}
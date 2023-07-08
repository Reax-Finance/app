import React from 'react'
import Pools from '../components/pools'
import Positions from '../components/pools/Positions'
import { Flex, Heading, Text } from '@chakra-ui/react'
import Head from 'next/head'

export default function PoolsPage() {
  return (
    <>
      <Head>
				<title>REAX | Pools</title>
				<link rel="icon" type="image/x-icon" href="/REAX.svg"></link>
			</Head>
      <Flex flexDir={'column'} mb={'7vh'} mt={'80px'} gap={5}>
        <Flex flexDir={'column'} align={'start'} gap={6} mb={5}>
          <Heading fontSize={'32px'}>DEX Pools</Heading>
          <Text>Earn from trading fees by providing <span style={{color : 'orange'}}>liquidity</span> to the pools.</Text>
        </Flex>
        <Positions />
        <Pools/>
      </Flex>
    </>
  )
}

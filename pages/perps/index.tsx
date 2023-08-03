import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PERP_PAIRS } from '../../src/const';

export default function Perps() {
  const router = useRouter();
  router.push(`/perps/${Object.keys(PERP_PAIRS)[0]}`)
  return (
    <Flex opacity={'0.8'} flexDir={'column'} align={'center'}>
        <Box mt={'22vh'} className='comingSoonText'>
        <Heading px={10} fontSize={'60px'} fontWeight={'bold'}>Loading</Heading>
        </Box>
      </Flex>
  )
}

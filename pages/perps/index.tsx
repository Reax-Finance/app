import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PERP_CATEGORIES } from '../../src/const';

export default function Perps() {
  const router = useRouter();
  router.push(`/perps/${PERP_CATEGORIES[0].name}`)
  return (
    <Flex opacity={'0.8'} flexDir={'column'} align={'center'}>
        <Box mt={'22vh'} className='comingSoonText'>
        <Heading px={10} fontSize={'60px'} fontWeight={'bold'}>Loading</Heading>
        </Box>
      </Flex>
  )
}

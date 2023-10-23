import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { usePerpsData } from '../../components/context/PerpsDataProvider';

export default function Perps() {
  const router = useRouter();
  const {pairs} = usePerpsData();

  if(Object.keys(pairs).length > 0) router.push(`/perps/${Object.keys(pairs)[0]}`);

  return (
    <Flex opacity={'0.8'} flexDir={'column'} align={'center'}>
        <Box mt={'22vh'} className='comingSoonText'>
        <Heading px={10} fontSize={'60px'} fontWeight={'bold'}>Loading</Heading>
        </Box>
      </Flex>
  )
}

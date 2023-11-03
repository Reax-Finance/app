import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { usePerpsData } from '../../components/context/PerpsDataProvider';
import Loading from '../../components/utils/Loading';

export default function Perps() {
  const router = useRouter();
  const {pairs} = usePerpsData();

  if(Object.keys(pairs).length > 0) router.push(`/margin/${Object.keys(pairs)[0]}`);

  return (
    <Loading />
  )
}

import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAppData } from '../../components/context/AppDataProvider';

export default function PerpsPage() {
  const router = useRouter();
  const {pairs} = useAppData();

  if(pairs.length > 0) router.push(`/perps/${pairs[0].id}`);

  return (
    <>
    </>
  )
}
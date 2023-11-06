import { Flex, Heading, Image } from '@chakra-ui/react'
import React from 'react'

export default function Loading() {
  return (
    <Flex flexDir={'column'} minH={'100vh'} gap={2} align={'center'} justify={'center'}>
        <Image src={'https://media.tenor.com/6w1aupPULL4AAAAj/pepe.gif'} alt='Loading' width={100} height={100} />
        <Heading size={'xs'}>Loading</Heading>
    </Flex>
  )
}

import { Flex, Text, Heading, Image, Box } from '@chakra-ui/react'
import React from 'react'
import { CustomConnectButton } from '../core/ConnectButton'

export default function Connect() {
  return (
    <Flex h={'100vh'} py={10} flexDir={'column'} align={'center'} justify={'space-between'} bgImage={'/static/blackhole.jpeg'} bgSize={'cover'} bgRepeat={'no-repeat'}>
        <Image src='/logo.svg' w={100} h={100} alt='' />
        <Flex flexDir={'column'} align={'center'} bg={'blackAlpha.600'} w={'100%'} >
            <Box bg={'black'} px={20} py={10}>
                
            <Heading>
                Get Started
            </Heading>

            <Box mt={6}>
            <CustomConnectButton />
            </Box>
            </Box>
        </Flex>
        <Text>
            Only the best DeFi experience
        </Text>
    </Flex>
  )
}

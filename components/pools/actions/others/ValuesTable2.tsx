import { Box, Flex, Divider, Text } from '@chakra-ui/react'
import React from 'react'
import { dollarFormatter, tokenFormatter } from '../../../../src/const'

export default function ValuesTable({values, bptIn, pool}: any) {
    if(!values) {
        values = {slippage: 0, inputUSD: 0, outputUSD: 0}
        bptIn = 0;
    }
  return (
    <>
    {values && <Box fontSize={'sm'} mx={4} p={2} border={'1px'} borderColor={'whiteAlpha.200'} bg={'whiteAlpha.50'}>
            <Flex flexDir={'column'}>
                <Flex fontSize={'md'} gap={2}>
                    <Flex minW={'120px'}>
                        <Text>Total:</Text>
                    </Flex>
                    <Divider orientation="vertical" h='20px' />
                    <Flex>
                        <Text >{dollarFormatter.format(values.inputUSD)}</Text>
                    </Flex>
                </Flex>

                <Divider my={2} />
                <Flex fontSize={'sm'} align={'center'} color={Number(values.slippage) >= 0 ? 'green.400' : 'red.400'} gap={2}>
                    <Flex minW={'120px'}>
                        <Text>{Number(values.slippage) >= 0 ? 'Slippage Bonus' : 'Price Impact'}:</Text>
                    </Flex>
                    <Divider orientation="vertical" h='20px' />
                    <Flex gap={1}>
                        <Text>{Number(values.slippage)}</Text>
                        <Text>%</Text>
                    </Flex>
                </Flex>
            </Flex>
        </Box>}
    </>
  )
}

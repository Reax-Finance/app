import React from 'react'
import { useDexData } from '../context/DexDataProvider'
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Button,
    Box,
    Heading,
    Text,
    Flex
  } from '@chakra-ui/react'
import Pool from './Pool';
import ThBox from '../dashboard/ThBox';

export default function Pools() {
    const { pools } = useDexData();
    return (
      <Box className='positionTable'>
        <Box className='cutoutcornersboxright'>
          <Flex align={'center'} p={4} px={5} gap={4}>
            <Heading fontSize={'18px'} color={'secondary.400'}>All Pools</Heading>
          </Flex>
        </Box>
        <TableContainer px={4} pb={4}>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <ThBox>Assets</ThBox>
                <ThBox alignBox='center'>Composition</ThBox>
                <ThBox alignBox='center'>
                  <Flex w={'100%'} justify={'center'}>
                  Liquidity
                  </Flex>
                </ThBox>
                <ThBox alignBox='center'>
                <Flex w={'100%'} justify={'center'}>
                  APR
                  </Flex>
                </ThBox>
                <ThBox isNumeric>.</ThBox>
              </Tr>
            </Thead>
            <Tbody>
              {pools.map((pool: any, index: number) => (
                  <Pool key={index} pool={pool} index={index} />
              ))}
            </Tbody>
          </Table>
      </TableContainer>
    </Box>
  )
}

import React from 'react'
import { useDexData } from '../context/DexDataProvider'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    TableContainer,
    Box,
    Heading,
    Text,
    Flex
  } from '@chakra-ui/react'
import ThBox from '../dashboard/ThBox';
import { useBalanceData } from '../context/BalanceProvider';
import YourPoolPosition from './YourPoolPosition';
import Big from 'big.js';

export default function Positions() {
    const {walletBalances} = useBalanceData();
    const { pools: dexPools } = useDexData();
    
    const yourPositions = dexPools.filter((pool: any) => {
      return( walletBalances[pool.address] > 0 || Big(pool.stakedBalance).gt(0));
    });

    if(yourPositions.length == 0) return <></>;
    
    return (
    <>
    <Box className='containerBody'>
      <Box className='containerHeader'>
        <Flex align={'center'} p={4} px={5} gap={4}>
          <Heading fontSize={'18px'} color={'primary.400'}>Your Balances</Heading>
        </Flex>
      </Box>
      {yourPositions.length > 0 ? <TableContainer px={4} pb={4}>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <ThBox>Assets</ThBox>
              <ThBox alignBox='center'>Composition</ThBox>
              <ThBox alignBox='center'>
                <Flex w={'100%'} justify={'center'}>
                  My Balance
                </Flex>
              </ThBox>
              <ThBox alignBox='center'>
                <Flex w={'100%'} justify={'center'}>
                  Staked
                </Flex>
              </ThBox>
              <ThBox isNumeric>.</ThBox>
            </Tr>
          </Thead>
          <Tbody>
          {yourPositions.map((pool: any, index: number) => {
            return (
                <YourPoolPosition key={index} pool={pool} index={index} />
            )
          })}
          </Tbody>
        </Table>
        </TableContainer> : <><Text color={'whiteAlpha.600'} p={6}>No Active Positions</Text></>}
    </Box>
    </>
  )
}

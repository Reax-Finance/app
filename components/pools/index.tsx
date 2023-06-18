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
  } from '@chakra-ui/react'
import Pool from './Pool';

export default function Pools() {
    const {pools } = useDexData();
    return (
    <>
    <TableContainer>
  <Table variant='simple'>
    <Thead>
      <Tr>
        <Th>Assets</Th>
        <Th>Composition</Th>

        <Th>Liquidity</Th>
        <Th isNumeric>APR</Th>
      </Tr>
    </Thead>
    <Tbody>
        {pools.map((pool: any, index: number) => (
            <Pool key={index} pool={pool} />
        ))}
    </Tbody>
  </Table>
</TableContainer>
    </>
  )
}

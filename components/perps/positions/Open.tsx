import { Box, Flex, Heading, useColorMode } from '@chakra-ui/react'
import React from 'react'
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
    Text
} from '@chakra-ui/react'
import { usePerpsData } from '../../context/PerpsDataProvider'
import Position from './Position';
import { VARIANT } from '../../../styles/theme';

export default function Open() {
    const {positions} = usePerpsData();

    return (   
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                <Tr>
                    <Th>Vault</Th>
                    <Th>Leverage</Th>
                    <Th>Net APY</Th>
                    <Th>Position</Th>
                    <Th>Borrowed</Th>
                    <Th>PnL</Th>
                    <Th isNumeric>Close</Th>
                </Tr>
                </Thead>
                <Tbody>
                    {positions.length > 0 ? positions.map((position: any, index: number) => (<Position key={index} index={index} position={position}/>)) : <><Text color={'whiteAlpha.600'} mx={4} mt={4}>No Positions Found</Text></>}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

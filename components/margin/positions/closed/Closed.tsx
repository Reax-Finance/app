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
import { usePerpsData } from '../../../context/PerpsDataProvider'
import Position from '../opened/Position';
import { VARIANT } from '../../../../styles/theme';
import ClosedPosition from './ClosedPosition';

export default function Closed() {
    const {positions, closedPositions} = usePerpsData();

    console.log(closedPositions);

    return (   
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                <Tr>
                    <Th>Vault</Th>
                    <Th>Leverage</Th>
                    <Th>Position</Th>
                    <Th>Borrowed</Th>
                    <Th>PnL</Th>
                    <Th isNumeric>Open/Close</Th>
                </Tr>
                </Thead>
                <Tbody>
                    {closedPositions.length > 0 ? closedPositions.map((position: any, index: number) => (<ClosedPosition key={index} index={index} position={position}/>)) : <><Text color={'whiteAlpha.600'} mx={4} mt={4}>No Positions Found</Text></>}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

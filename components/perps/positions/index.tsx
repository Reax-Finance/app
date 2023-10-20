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

export default function Positions() {
    const {positions} = usePerpsData();
    const { colorMode } = useColorMode();

    return (   
        <Box className={`${VARIANT}-${colorMode}-containerBody`} mt={4} pb={8} mb={10}>
            <Box className={`${VARIANT}-${colorMode}-containerHeader`} p={4}>
            <Heading size='sm'>Open Positions</Heading>
            </Box>
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
                    {positions.length > 1 ? positions.map((position: any, index: number) => (<Position key={index} index={index} position={position}/>)) : <><Text color={'whiteAlpha.600'} mx={4} mt={4}>No Positions Found</Text></>}
                </Tbody>
            </Table>
            </TableContainer>
        </Box>
    )
}

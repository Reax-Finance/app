import { Box, Flex, Heading, useColorMode } from '@chakra-ui/react'
import React from 'react'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    TableContainer,
    Text
} from '@chakra-ui/react'
import { usePerpsData } from '../../../context/PerpsDataProvider'
import HistoryRow from './HistoryRow';

export default function History() {
    const {history} = usePerpsData();

    console.log(history);

    return (   
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                <Tr>
                    <Th>Vault</Th>
                    <Th>Asset</Th>
                    <Th>Action</Th>
                    <Th>Amount</Th>
                    <Th isNumeric>Timestamp</Th>
                </Tr>
                </Thead>
                <Tbody>
                    {history.length > 0 ? history.map((_history: any, index: number) => (<HistoryRow key={index} index={index} history={_history}/>)) : <><Text color={'whiteAlpha.600'} mx={4} mt={4}>No Positions Found</Text></>}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

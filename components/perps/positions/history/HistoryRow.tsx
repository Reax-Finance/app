import { ethers } from 'ethers';
import React, { useEffect } from 'react'
import { useLendingData } from '../../../context/LendingDataProvider';
import { usePriceData } from '../../../context/PriceContext';
import { useBalanceData } from '../../../context/BalanceProvider';
import Big from 'big.js';
import { Td, Flex, Text, Box, Image, Divider, IconButton, Tr, Button, Heading, useDisclosure, NumberInput, NumberInputField,  } from '@chakra-ui/react';
import { MdOpenInNew } from 'react-icons/md';
import { ESYX_PRICE, defaultChain, dollarFormatter, tokenFormatter } from '../../../../src/const';
import { usePerpsData } from '../../../context/PerpsDataProvider';
import { getABI } from '../../../../src/contract';
import { useNetwork } from 'wagmi';
import CloseModal from '../opened/CloseModal';


export default function HistoryRow({history, index}: any) {
    return (<>
        <Tr>
            <Td>
                <Box>
                    <Flex align={'center'} cursor={'pointer'}  onClick={() => window.open(defaultChain.blockExplorers.default.url + '/address/' + history.vault)}>
                    <Flex align={'center'} gap={1} mt={1}>
                        <Text fontSize={'sm'}>{history.vault.slice(0, 6)}...{history.vault.slice(-4)}</Text>
                        <MdOpenInNew size={'14px'}/>
                    </Flex>
                    </Flex>
                </Box>
            </Td>

            <Td>
                <Flex align={'center'} gap={0.5}>
                    <Image src={`/icons/${history.tokenSymbol}.svg`} boxSize={'20px'} mr={2} alt={history.tokenSymbol}/>
                    {history.tokenSymbol}
                </Flex>
            </Td>

            <Td>
                <Text fontSize={'sm'} fontWeight={'medium'}>
                    {history.action.toUpperCase()}
                </Text>
            </Td>

            <Td>
                <Flex flexDir={'row'} align={'center'}>
                    <Flex fontSize={'md'}>
                        {dollarFormatter.format(history.amountUSD)}
                    </Flex>
                </Flex>
            </Td>

            <Td isNumeric>
                <Flex justify={'end'} gap={2} align={'center'} cursor={'pointer'}  onClick={() => window.open(defaultChain.blockExplorers.default.url + '/tx/' + history.hash)}>
                    <Text fontSize={'sm'}>{(new Date(history.timestamp * 1000)).toLocaleString()}</Text>
                    <MdOpenInNew size={'14px'}/>
                </Flex>
            </Td>
        </Tr>    
    </>
    )
}

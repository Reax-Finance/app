import { Flex, Td, Tr, Text } from '@chakra-ui/react';
import React from 'react'
import { useAccount, useEnsName } from 'wagmi'
import { defaultChain, dollarFormatter, tokenFormatter } from '../../src/const';
import { IoMdOpen } from 'react-icons/io';

export default function LeaderboardRow({index, _account}: any) {
    const {address} = useAccount();
    
    return (
        <>
        <Tr bg={address && address.toLowerCase() == _account.id ? 'whiteAlpha.100' : 'transparent'}>
            <Td borderColor={'whiteAlpha.50'}>
            <Flex gap={2} align='center'>
                <Text>
                {index}
                </Text>
            </Flex>
            </Td>
            <Td borderColor={'whiteAlpha.50'} _hover={{cursor: 'pointer'}} onClick={() => window.open(defaultChain.blockExplorers.default.url + '/address/' + _account.id)}>
                <Flex align={'center'} gap={3}>

                <Text>
                {(address && address.toLowerCase() == _account?.id ? `You (${_account?.id?.slice(0,8)})` : _account?.id?.slice(0, 8) + '...' + _account?.id?.slice(36))}
                </Text>
                <IoMdOpen />
                </Flex>

            </Td>
            <Td borderColor={'whiteAlpha.50'}>{tokenFormatter.format(_account.totalPoints ?? 0)}</Td>
            <Td borderColor={'whiteAlpha.50'}>{dollarFormatter.format(_account.totalVolumeUSD ?? 0)}</Td>

            <Td borderColor={'whiteAlpha.50'} isNumeric>
                
                {index <= 10 ? <Text fontWeight={'bold'} color={'secondary.400'}>2x</Text> : index <= 25 ? <Text fontWeight={'bold'} color={'primary.400'}>1.5x</Text> : '1x'}
                
            </Td>
        </Tr>
        </>
    )
}
import { Flex, Text, Heading, Image, Box, Divider } from '@chakra-ui/react'
import React from 'react'
import { CustomConnectButton } from '../core/ConnectButton'
import { useUserData } from '../context/UserDataProvider';
import { useSession } from 'next-auth/react';
import { Status } from '../utils/status';
import { useAccount } from 'wagmi';

export default function Connect() {
	const { user, status: userStatus } = useUserData();
	const { status: sessionStatus } = useSession();
  const { address, status } = useAccount()

    return (
        <Flex h={'100vh'} py={10} flexDir={'column'} align={'center'} justify={'space-between'} >
            <Image src='/logo.svg' w={100} h={100} alt='' />
            <Flex flexDir={'column'} align={'center'} bg={'blackAlpha.600'} w={'100%'} >
                <Box bg={'black'} px={20} py={10}>
                    
                <Heading>
                    Welcome to Reax!
                </Heading>

                {(status != "connected" || sessionStatus != "authenticated") && <Text mt={2}>
                    Please connect your wallet to continue.
                    </Text>}

                {status == "connected" && !user && userStatus === Status.SUCCESS && <Box> <Text mt={2}>
                    You are not on the allowed list. Please try a different account.
                </Text>

                <Flex flexDir={'column'} p={4} border={'1px'} borderColor={'whiteAlpha.600'} maxW={'500px'} my={4}>
                  <Heading size={'sm'} color={'primary.400'}>Allowlists</Heading>
                  <Divider my={4} />
                  <Box>

                  <Text>
                    Reax Mainnet Users (Snapshot 24 July 2024 00:00 GMT)
                  </Text>
                  <Text fontSize={'xs'} color={'whiteAlpha.600'}>
                    You must have used Reax Protocol on Mainnet, either by providing liquidity or swapping tokens.
                  </Text>
                  </Box>
                </Flex>
                </Box>
                }

                <Box mt={6}>
                    <CustomConnectButton />
                </Box>
                </Box>
            </Flex>
            <Text>
                Only the best DeFi experience
            </Text>
        </Flex>
    )
}

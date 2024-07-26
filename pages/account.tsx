import { Box, Divider, Flex, Heading, Input, Text } from '@chakra-ui/react'
import React from 'react'
import { useAccount } from 'wagmi'
import { useUserData } from '../components/context/UserDataProvider';

export default function Account() {
    const {address} = useAccount();
    const {user} = useUserData();
  return (
    <Box>
    <Flex gap={10}>
    <Box>
        <Heading>Account</Heading>
        <Text>{address}</Text>
    </Box>
    <Box>
        <Heading>{user?.user?.balance}</Heading>
        <Text>XP</Text>
    </Box>
    </Flex>

    <Divider my={4} />
    <Text>
        Joined on: {(new Date(user?.user?.createdAt?.toString() as any)).toDateString()}
    </Text>
    <Divider my={4} />
    <Box>
        <Flex justify={'space-between'}>
        <Heading size={'md'}>Select an username</Heading>
        <Box>
            <Text>Earn</Text>
            <Text>100 XP</Text>
        </Box>
        </Flex>
            

        <Input mt={2} placeholder="Username" />
    </Box>
    </Box>
  )
}

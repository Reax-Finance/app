import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { useAccount } from 'wagmi';
import { AppDataContext } from '../context/AppDataProvider';

export default function Title() {
    const { account } = useContext(AppDataContext);
    const { address } = useAccount();

  return (
    <Flex pt="100px" justify={'space-between'}>
    <Box >
				<Heading size={"lg"}>
					Your Account
				</Heading>
				<Text mt={1} color='whiteAlpha.700'>{address}</Text>				
			</Box>

      <Box textAlign={'right'}>
					<Heading size={"sm"} color="whiteAlpha.700">
						Minting Synths Since
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? new Date(account.createdAt * 1000)
									.toDateString()
									.slice(4)
							: "-"}
					</Text>
				</Box>
    </Flex>
  )
}

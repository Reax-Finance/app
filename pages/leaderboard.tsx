import { Box, Button, Divider, Flex, Heading, IconButton } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Text,
  Image
} from '@chakra-ui/react'
import { dollarFormatter, tokenFormatter } from '../src/const';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { useDexData } from '../components/context/DexDataProvider';
import LeaderboardRow from '../components/others/LeaderboardRow';

export default function Leaderboard() {
  const { dex } = useDexData();
  const {address} = useAccount();

  const isAddressInLeaderboard = dex?.leaderboard?.some((account: any) => account.id.toLowerCase() === address?.toLowerCase());

  return (
    <>
    <Head>
      <title>Trading Rewards | REAX</title>
      <link rel="icon" type="image/x-icon" href="/logo32.png"></link>
		</Head>
    <Box pt={'70px'}>
      <Flex justify={'space-between'} align={'end'}>
      <Box>
      <Heading size={"lg"}>Trading Rewards</Heading>
      <Text mt={2} pb={5} color='whiteAlpha.700'>
        Get rewarded for trading on REAX. Build for traders, to be owned by traders.
      </Text>
      </Box>

      <Image mb={-8} src='/rewards-illustration.svg' w='300px' />
      </Flex>
      <Flex align='end' justify='start' my={4}>
        <Box className='outlinedButton'>
        <Button bg={'transparent'} _hover={{bg: 'transparent'}}>Epoch 1</Button>
        </Box>
        <Divider/>
      </Flex>
      <Flex gap={10} mt={6}>
      <Box py={5}>
        <Heading size={'sm'} color={'whiteAlpha.700'}>Your Points</Heading>
        <Text fontSize={'3xl'} my={3}>{tokenFormatter.format(dex?.yourPoints?.totalPoints ?? 0)}</Text>
      </Box>

      <Divider orientation='vertical' mt={5} h='80px'/>

      <Box>
        <Flex gap={20}>
        <Box py={5}>
          <Flex>
              <Heading size={'sm'} color={'whiteAlpha.700'}>Total Volume</Heading>
          </Flex>
          <Text fontSize={'3xl'} my={3}>{dollarFormatter.format(dex?.yourPoints?.totalVolumeUSD ?? 0)}</Text>
          </Box>
          </Flex>
          </Box>
        </Flex>
      </Box>
      <Box mt={4} pt={1} mb={20} pb={5} borderColor='whiteAlpha.50' className='containerBody'>

      <TableContainer >
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>
              <Flex>
              Rank
              </Flex>
              </Th>
            <Th>Account</Th>
            <Th>Total Points</Th>
            <Th>Total Volume (USD)</Th>

            <Th isNumeric>Multiplier</Th>
          </Tr>
        </Thead>
        <Tbody>
        {dex.leaderboard?.map((_account: any, index: number): any => {
        return <>
          <LeaderboardRow _account={_account} index={index + 1} />
        </>
        })}
        {(!isAddressInLeaderboard && address) && <LeaderboardRow _account={{id: address?.toLowerCase(), totalPoints: dex?.yourPoints?.totalPoints, totalVolumeUSD: dex?.yourPoints?.totalVolumeUSD}} index={'...'} />}
    </Tbody>
  </Table>
</TableContainer>
</Box>
    </>
  )
}

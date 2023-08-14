import { Box, Button, Divider, Flex, Heading, IconButton, Tag, useColorMode } from '@chakra-ui/react'
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
import { VARIANT } from '../styles/theme';

export default function Leaderboard() {
  const { dex } = useDexData();
  const {address} = useAccount();

  const rank = dex?.leaderboard?.findIndex((account: any) => account.id.toLowerCase() === address?.toLowerCase()) + 1;
  const isAddressInLeaderboard = rank > 0;
  const multiplier = rank <= 0 ? '1x' : rank < 10 ? '2x' : rank < 25 ? '1.5x' : '1x';

  const {colorMode} = useColorMode();

  return (
    <>
    <Head>
      <title>Trading Rewards | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}</title>
      <link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}></link>
		</Head>
    <Box pt={'70px'}>
      <Flex justify={'space-between'} align={'end'}>
      <Box>
      <Heading size={"lg"}>Trading Rewards</Heading>
      <Text mt={2} pb={5} color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>
        Earn protocol ownership by trading on {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}. Build for traders, to be owned by traders.
      </Text>
      </Box>

      <Image mb={-8} src='/rewards-illustration.svg' w='300px' />
      </Flex>
      <Flex align='end' justify='start' my={4}>
        <Box className={`${VARIANT}-${colorMode}-halfContainerBody2`}>
        <Button bg={'transparent'} _hover={{bg: 'transparent'}}>Epoch 1</Button>
        </Box>
        {/* <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />  */}
      </Flex>
      <Flex gap={6} className={`${VARIANT}-${colorMode}-halfContainerBody2`} my={4} p={4} align={'center'} wrap={'wrap'}>
          <PointBox title='Ending On' value={
            // Time for 4 weeks from now
            new Date('31 Aug 2023').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) + "*"
          } tbd={true} />
          <PointDivider />
          <PointBox title='Total Rewards' value={tokenFormatter.format(1000000) + ' ' + process.env.NEXT_PUBLIC_TOKEN_SYMBOL} tbd={true} />
          <PointDivider />
          <PointBox title='Your Points' value={<Flex gap={1} align={'center'}> {tokenFormatter.format(dex?.yourPoints?.totalPoints ?? 0)} <Tag p={1} size={'sm'} colorScheme={multiplier == '1.5x' ? 'primary' : (multiplier == "2x" ? 'secondary' : 'white')}>{multiplier}</Tag> </Flex>} />
          <PointDivider />
          <PointBox title='Your Volume' value={dollarFormatter.format(dex?.yourPoints?.totalVolumeUSD ?? 0)} />
          <PointDivider />
          <PointBox title='Estimated Rewards' value={tokenFormatter.format(
            dex?.totalPoints > 0 ? 1000000 * ((dex?.yourPoints?.totalPoints ?? 0) / dex?.totalPoints) : 0
          ) + ' ' + process.env.NEXT_PUBLIC_TOKEN_SYMBOL + "*"} tbd={true} />
          <Button colorScheme='primary' size='sm' variant='outline' rounded={0} isDisabled={true}>Claim Rewards</Button>
          <PointDivider />
          <PointBox title='Weightage' value={<Box fontSize={'sm'}>
            <Flex gap={1}><Text color={'whiteAlpha.700'}>Synth Swap: </Text>1 point / $1</Flex>
            <Flex gap={1}><Text color={'whiteAlpha.700'}>AMM Swap: </Text>0.5 point / $1</Flex>
            </Box>
          } />
          {/* <PointDivider /> */}
        </Flex>

      </Box>
      <Box mb={10} mt={4}>
      <Box pt={1} pb={5} borderColor='whiteAlpha.50' className={`${VARIANT}-${colorMode}-containerBody`}>

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
<Box mt={4}>
          <PointBox title='* To be updated' value={""} tbd={true} />
</Box>
          </Box>
    </>
  )
}

const PointDivider = () => (<><Divider orientation='vertical' mt={0} h='40px' /></>)

const PointBox = ({title, value, tbd = false}: any) => {
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Text fontSize={'sm'} color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'}>{title}</Text>
      <Text fontSize={'lg'} color={tbd ? `${colorMode == 'dark' ? 'white' : 'black'}Alpha.500` : `${colorMode == 'dark' ? 'white' : 'black'}`}>{value}</Text>
    </Box>
  )
}
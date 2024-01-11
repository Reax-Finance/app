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
import { EPOCH_REWARDS, dollarFormatter, tokenFormatter } from '../src/const';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { useDexData } from '../components/context/DexDataProvider';
import LeaderboardRow from '../components/others/LeaderboardRow';
import { VARIANT } from '../styles/theme';
import Leaderboard from '../components/others/Leaderboard';

export default function LeaderboardPage({}: any) {
  const { epoches } = useDexData();
  const { address } = useAccount();
  const [selectedEpoch, setSelectedEpoch] = React.useState<Number|null>(Object.keys(EPOCH_REWARDS).filter((epoch: any) => EPOCH_REWARDS[epoch] > 0).length);

  const {colorMode} = useColorMode();
  return <></>;
  
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
      <Box>
      <Image mb={-8} src='/rewards-illustration.svg' w='300px' alt='rewards' />
      </Box>
      </Flex>
      <Flex align='end' justify='start' my={4} gap={2}>
        {epoches.map((epoch: any, index: number) => (epoch.id <= 6 && <>
          {EPOCH_REWARDS[Number(epoch.id) + 1] > 0 && <> <Flex align={'center'} p={2} gap={1} px={4} cursor={'pointer'} className={selectedEpoch == index ? `${VARIANT}-${colorMode}-halfButtonSelected` : `${VARIANT}-${colorMode}-halfButton`} color={selectedEpoch == index ? 'primary.400' : 'whiteAlpha.600'} onClick={()=>setSelectedEpoch(index)}>
            <Heading fontSize={'md'}>Epoch {Number(epoch.id) + 1}</Heading>
            {Number(epoch.id) + 1 == epoches.length && <Tag ml={2} size={'sm'} colorScheme={'green'}><Box w={1} h={1} bg={'green.400'} rounded={'full'} mr={1}/> Live</Tag>}
          </Flex> </>}
        </>))}
      </Flex>
      <Leaderboard epochIndex={selectedEpoch} />
      </Box>
    </>
  )
}
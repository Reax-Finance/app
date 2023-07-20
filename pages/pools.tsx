import React, { useEffect, useState } from 'react'
import Pools from '../components/pools'
import Positions from '../components/pools/Positions'
import { Flex, Heading, Text, Box, Button, useToast } from '@chakra-ui/react'
import Head from 'next/head'
import { useDexData } from '../components/context/DexDataProvider'
import { defaultChain, dollarFormatter, tokenFormatter } from '../src/const'
import Big from 'big.js'
import { BigNumber, ethers } from 'ethers'
import { getABI, send } from '../src/contract'
import { useAccount } from 'wagmi'

export default function PoolsPage() {
  const { dex, pools } = useDexData();
  const [rewardsAccrued, setRewardsAccrued] = useState('0');
  const [claiming, setClaiming] = useState(false);
  const { address } = useAccount();
  const toast = useToast()

  const claim = () => {
    setClaiming(true);
    const miniChefContract = new ethers.Contract(dex.miniChef, getABI('MiniChef', defaultChain.id));
    let calls = [];
    for(let i in pools){
      calls.push(
        miniChefContract.interface.encodeFunctionData('harvest', [pools[i].pid, address])
      )
    }
    send(miniChefContract, 'multicall', [calls])
    .then((res: any) => {
      setRewardsAccrued('0')
      setClaiming(false);
      toast({
        title: "Claimed!",
        description: "Your rewards have been claimed.",
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    })
    .catch((err: any) => {
      console.log(err);
      setClaiming(false);
      toast({
        title: "Error",
        description: "There was an error claiming your rewards.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    })
  }

  useEffect(() => {
    if(dex.miniChef && pools.length > 0 && address){
      let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0])
      const miniChefContract = new ethers.Contract(dex.miniChef, getABI('MiniChef', defaultChain.id), provider);
      let calls = [];
      for(let i in pools){
        if(pools[i].pid){
          calls.push(
            miniChefContract.interface.encodeFunctionData('pendingSushi', [pools[i].pid, address])
          )
        }
      }
      miniChefContract.callStatic.multicall(calls)
      .then((res: any) => {
        let sum = res.reduce((total: string, value: string) => Big(total).add(BigNumber.from(value).toString()), '0');
        setRewardsAccrued(sum.toString());
      })
      .catch((err: any) => {
        console.log(err);
      })
    }
  }, [dex])

  return (
    <>
      <Head>
				<title>REAX | Pools</title>
				<link rel="icon" type="image/x-icon" href="/REAX.svg"></link>
			</Head>
      <Flex flexDir={'column'} mb={'7vh'} mt={'80px'} gap={5}>
        <Flex justify={'space-between'} align={'center'}>
        <Flex flexDir={'column'} align={'start'} gap={6} mb={5}>
          <Heading fontWeight={'bold'} fontSize={'32px'}>DEX Pools</Heading>
          <Flex gap={8} mt={2}>
            <Flex align={'center'} gap={2}>
              <Heading color={'primary.400'} size={'sm'}>TVL </Heading>
              <Heading size={'sm'}>{dollarFormatter.format(dex.totalLiquidity ?? 0)}</Heading>
            </Flex>
            <Flex align={'center'} gap={2}>
              <Heading color={'secondary.400'} size={'sm'}>Total Volume </Heading>
              <Heading size={'sm'}> {dollarFormatter.format(dex.totalSwapVolume ?? 0)}</Heading>
            </Flex>
          </Flex>
        </Flex>
        {
					(Big(rewardsAccrued).gt(0)) &&
					<Box textAlign={"right"}>
					<Heading size={"sm"} color={"whiteAlpha.600"}>
						LP Rewards
					</Heading>
					<Box gap={20} mt={2}>
						<Flex justify={"end"} align={"center"} gap={2}>
							<Text fontSize={"2xl"}>{rewardsAccrued ? Big(rewardsAccrued).div(10**18).toFixed(2) : '-'} </Text>
							<Text fontSize={"2xl"} color={"whiteAlpha.400"}>
								veREAX
							</Text>
						</Flex>
						<Box mt={2} w={'100%'} className="outlinedButton">
						<Button
							onClick={claim}
							bg={'transparent'}
							w="100%"
							rounded={0}
							size={"sm"}
              isLoading={claiming}
              loadingText={"Claiming"}
              isDisabled={rewardsAccrued == null || Number(rewardsAccrued) == 0}
							_hover={{ bg: "transparent" }}
						>
							Claim
						</Button>
						</Box>
					</Box>
				</Box>}
        </Flex>
        <Positions />
        <Pools/>


      </Flex>
    </>
  )
}

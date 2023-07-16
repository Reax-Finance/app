import React from 'react'
import Info from '../../infos/Info'
import { Flex, Text, Box, Heading, Grid, GridItem, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { IoMdCash } from 'react-icons/io'
import IconBox from './../IconBox'
import { TbReportMoney } from 'react-icons/tb'
import Big from 'big.js'
import { useAppData } from '../../context/AppDataProvider'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { dollarFormatter, tokenFormatter } from '../../../src/const'
import { useSyntheticsData } from '../../context/SyntheticsPosition'
import { FaPercentage } from 'react-icons/fa'
import { useLendingData } from '../../context/LendingDataProvider'
import { AiOutlineArrowRight } from 'react-icons/ai'
import { useRouter } from 'next/router'

export default function MinimalLendingPosition({poolIndex}: any) {
    const {pools, protocols, setSelectedPool} = useLendingData();
    const { lendingPosition, netAPY } = useSyntheticsData();

    const pos = lendingPosition(poolIndex);
    const router = useRouter();

    const view = () => {
        localStorage.setItem("lendingPool", poolIndex.toString());
		setSelectedPool(poolIndex);
		router.push('/lend')
	}

    return (
    <>
        {Big(lendingPosition()?.collateral).gt(0) ? <Box
            display={{ sm: "block", md: "block" }}
            className='containerBody'
        >
            <Flex align={'center'} justify={'space-between'} px={5} py={4} className='containerHeader'>
                <Heading fontSize={'18px'}>
                    {protocols[poolIndex].name}
                </Heading>

                <Button variant={'unstyled'} onClick={view}>
                    <Flex align={'center'} gap={2} color={'whiteAlpha.600'}>
                        <Text fontSize={'sm'} fontWeight={'normal'}>
                    View Position
                        </Text>
                    <AiOutlineArrowRight />
                    </Flex>
                </Button>
            </Flex>
            <Flex p={5} justifyContent={"space-between"} alignContent={"center"}>
                <Flex flexDir={"column"} justify="center">
                    <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.25 }}
                        key={poolIndex}
                    >
                        <Grid
                            templateColumns='repeat(3, 1fr)'
                            gap={{ sm: 10, md: 6 }}
                            my={0}
                            zIndex={1}
                        >
                            <GridItem>
                            <Flex gap={3} align="start">
                                <Info
                                    message={`
                                        Sum of all your collateral enabled in USD
                                    `}
                                    title={"Total Collateral"}
                                >

                                <Box cursor={'help'}>
                                    <Heading
                                        size={"xs"}
                                        color="whiteAlpha.700"
                                        mb={0.5}
                                    >
                                        Collateral
                                    </Heading>
                                    <Flex
                                        fontWeight={"semibold"}
                                        fontSize={"lg"}
                                        gap={1}
                                        color={"whiteAlpha.800"}
                                    >
                                        <Text
                                            fontWeight={"normal"}
                                        >
                                            $
                                        </Text>
                                        <Text>
                                            {tokenFormatter.format(Number(pos.collateral))}
                                        </Text>
                                    </Flex>
                                </Box>
                                </Info>
                            </Flex>
                            </GridItem>

                            <GridItem>
                            <Flex gap={3} align="start">
                                <Info
                                    message={`
                                        Sum of all your debt in USD
                                    `}
                                    title={"Total debt"}
                                >
                                    <Box cursor={"help"}>
                                        <Heading
                                            mb={0.5}
                                            size={"xs"}
                                            color="whiteAlpha.700"
                                        >
                                            Debt
                                        </Heading>
                                        <Flex gap={2} align="center">
                                            <Flex
                                                fontWeight={"semibold"}
                                                fontSize={"lg"}
                                                gap={1}
                                                color={"whiteAlpha.800"}
                                            >
                                                <Text fontWeight={"normal"}>
                                                    $
                                                </Text>
                                                <Text>
                                                    {tokenFormatter.format(Number(pos.debt))}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex>
                            </GridItem>

                            <GridItem>
                            {Big(pos.debt).gt(0) && <Flex gap={3} align="start">
                                <Info
                                    message={`
                                        Net APY is the difference between the interest you pay and the interest you earn`}
                                    title={"Net APY"}
                                >
                                    <Box cursor={"help"}>
                                        <Heading
                                            mb={0.5}
                                            size={"xs"}
                                            color="whiteAlpha.700"
                                        >
                                            Net APY
                                        </Heading>
                                        <Flex gap={2} align="center">
                                            <Flex
                                                fontWeight={"semibold"}
                                                fontSize={"lg"}
                                                gap={1}
                                                // color={Big(netAPY(poolIndex)).gt(0) ? 'green.400' : 'red.400'}
                                            >
                                                <Text>
                                                    {(netAPY(poolIndex)).toFixed(2)}%
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex>}
                            </GridItem>

                            <GridItem>
                            <Flex gap={3} align="start">
                                <Info
                                    message={`You can issue borrow till you reach Collateral's Base LTV`}
                                    title={"Borrow Capacity"}
                                >
                                    <Box cursor={"help"}>
                                        <Heading
                                            mb={0.5}
                                            size={"xs"}
                                            color="whiteAlpha.700"
                                        >
                                            Available to Borrow
                                        </Heading>
                                        <Flex gap={2} align="center">
                                            <Flex
                                                fontWeight={"semibold"}
                                                fontSize={"lg"}
                                                gap={1}
                                                color={"whiteAlpha.800"}
                                            >
                                                <Text fontWeight={"normal"}>
                                                    $
                                                </Text>
                                                <Text>
                                                    {tokenFormatter.format(Number(pos.debt))}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex> 
                            </GridItem>

                            <GridItem>
                            <Flex gap={3} align="start">
                                <Info
                                    message={`Your Debt Limit depends on your LTV %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`}
                                    title={"Loan to Value (LTV) Ratio"}
                                >
                                    <Box cursor={"help"}>
                                        <Heading
                                            mb={0.5}
                                            size={"xs"}
                                            color="whiteAlpha.700"
                                        >
                                            Borrow Limit
                                        </Heading>
                                        <Flex gap={2} align="center">
                                            <Flex
                                                fontWeight={"semibold"}
                                                fontSize={"lg"}
                                                gap={1}
                                                color={"whiteAlpha.800"}
                                            >
                                                <Text
                                                    fontWeight={"semibold"}
                                                    fontSize={"xl"}
                                                    color={
                                                        Big(pos.availableToIssue).gt(0)
                                                            ? "green.400"
                                                            : "yellow.400"
                                                    }
                                                >
                                                    {Number(pos.debtLimit).toFixed(1)}{" "}
                                                    %
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex> 
                            </GridItem>

                        </Grid>                           
                    </motion.div>
                </Flex>
            </Flex>
        </Box>
    : <></>}
    </>
  )
}

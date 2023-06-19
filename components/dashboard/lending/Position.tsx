import React from 'react'
import Info from '../../infos/Info'
import { Flex, Text, Box, Heading } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { IoMdAnalytics, IoMdCash } from 'react-icons/io'
import IconBox from './../IconBox'
import { TbReportMoney } from 'react-icons/tb'
import Big from 'big.js'
import { useAppData } from '../../context/AppDataProvider'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { dollarFormatter } from '../../../src/const'
import { useBalanceData } from '../../context/BalanceProvider'
import { usePriceData } from '../../context/PriceContext'
import { useSyntheticsData } from '../../context/SyntheticsPosition'
import { FaPercentage } from 'react-icons/fa'

export default function LendingPosition() {
    const { pools, tradingPool, account } = useAppData();
    const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();
    const { lendingPosition, netAPY } = useSyntheticsData();

    const pos = lendingPosition();

  return (
    <>
        {Big(pos?.collateral).gt(0) ? <Box
            w='100%'
            display={{ sm: "block", md: "block" }}
            className='cutoutcornersboxright'
        >
            <Flex align={'center'} justify={'space-between'} px={5} py={4} className='cutoutcornersboxright'>
                <Heading fontSize={'18px'}>
                    Your Position
                </Heading>

                {/* <Info
                    message={`You can issue debt till you reach Collateral's Base LTV`}
                    title={"Borrow Capacity"}
                >
                    <Flex
                        justify={{ sm: "start", md: "end" }}
                        align="center"
                        gap={1}
                        cursor={"help"}
                        fontSize={"sm"} 
                    >
                        <Text color="whiteAlpha.700">
                            Available to Borrow: {" "}
                        </Text>
                        <Text
                            mr={0.5}
                            fontWeight="medium"
                        >
                            {dollarFormatter.format(
                                Number(pos.availableToIssue)
                            )}
                        </Text>
                    </Flex>
                </Info> */}
            </Flex>
            <Flex p={5} justifyContent={"space-between"} alignContent={"center"}>
                <Flex flexDir={"column"} justify="center">
                    <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.25 }}
                        key={tradingPool}
                    >
                        <Flex
                            flexDir={{ sm: "column", md: "row" }}
                            gap={{ sm: 10, md: 12 }}
                            zIndex={1}
                        >
                            <Flex gap={3} align="start">
                                <IconBox>
                                    <IoMdCash size={'22px'} />
                                </IconBox>

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
                                            {Number(pos.collateral).toFixed(2)}
                                        </Text>
                                    </Flex>
                                </Box>
                                </Info>
                            </Flex>

                            <Flex gap={3} align="start">
                                <IconBox>
                                    <TbReportMoney size={'22px'}  />
                                </IconBox>

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
                                                    {Number(pos.debt).toFixed(2)}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex>

                            {Big(pos.debt).gt(0) && <Flex gap={3} align="start">
                                <IconBox>
                                    <FaPercentage size={'20px'} />
                                </IconBox>

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
                                                color={Big(netAPY()).gt(0) ? 'green.400' : 'red.400'}
                                            >
                                                <Text>
                                                    {(netAPY()).toFixed(2)}%
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex>}
                        </Flex>
                    </motion.div>
                </Flex>
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.25 }}
                    key={tradingPool}
                >
                    <Box
                        textAlign={{ sm: "left", md: "right" }}
                        mt={{ sm: 16, md: 1.5 }}
                    >
                        <Info
                            message={`Your Debt Limit depends on your LTV %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`}
                            title={"Loan to Value (LTV) Ratio"}
                        >
                            <Flex
                                justify={{ sm: "start", md: "end" }}
                                align="center"
                                gap={1}
                                cursor={"help"}
                            >
                                <Heading
                                    size={"sm"}
                                    color="whiteAlpha.700"
                                >
                                    Borrow Limit
                                </Heading>

                                <Box mb={1}>
                                    <InfoOutlineIcon
                                        color={"whiteAlpha.500"}
                                        h={3}
                                    />
                                </Box>
                            </Flex>
                        </Info>
                        <Text
                            fontWeight={"semibold"}
                            fontSize={"3xl"}
                            color={
                                Big(pos.availableToIssue).gt(0)
                                    ? "green.400"
                                    : "yellow.400"
                            }
                        >
                            {Number(pos.debtLimit).toFixed(1)}{" "}
                            %
                        </Text>
                    </Box>
                </motion.div>       
            </Flex>
            <Box
                // mt={2}
                width={"100%"}
                bg="whiteAlpha.200"
            >
                <Box
                    h={'1'}
                    bg={
                        Big(pos.availableToIssue).gt(0)
                                    ? "green.400"
                                    : "yellow.400"
                    }
                    // shadow to only top of this line
                    // boxShadow={`0px -3px 30px 0.5px ${Big(pos.availableToIssue).gt(0)
                    //     ? 'rgba(0,255,0,0.4)' : 'rgba(255,255,0,0.5)'}`}
                    width={
                        pos.debtLimit + "%"
                    }
                ></Box>
            </Box>
        </Box>
    : <></>    
    }
    </>
  )
}

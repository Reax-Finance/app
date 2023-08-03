import React from 'react'
import Info from '../../infos/Info'
import { Flex, Text, Box, Heading, Image } from '@chakra-ui/react'
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

export default function LendingPosition() {
    const { tradingPool } = useAppData();
    const { lendingPosition, netAPY, netRewardsAPY } = useSyntheticsData();

    const pos = lendingPosition();

    return (
    <>
        {Big(lendingPosition()?.collateral).gt(0) ? <Box
            w='100%'
            display={{ sm: "block", md: "block" }}
            className='halfContainerBody'
        >
            <Flex align={'center'} justify={'space-between'} px={5} py={4} className='containerHeader'>
                <Heading fontSize={'18px'}>
                    Your Position
                </Heading>

                <Info
                    message={`You can issue borrow till you reach Collateral's Base LTV`}
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
                </Info>
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
                                    <IoMdCash size={'18px'} />
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
                                            {tokenFormatter.format(Number(pos.collateral))}
                                        </Text>
                                    </Flex>
                                </Box>
                                </Info>
                            </Flex>

                            <Flex gap={3} align="start">
                                <IconBox>
                                    <TbReportMoney size={'18px'}  />
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
                                                    {tokenFormatter.format(Number(pos.debt))}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex>

                            {Big(pos.debt).gt(0) && <Flex gap={3} align="start">
                                <IconBox>
                                    <FaPercentage size={'16px'} />
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
                                                align={'center'}
                                            >
                                                <Text>
                                                    {(netAPY()).toFixed(2)}%
                                                </Text>
                                                <Text fontSize={'md'} fontWeight={'medium'} color={'whiteAlpha.600'}> + {netRewardsAPY().toFixed(2)}%</Text>
                                                <Image ml={1} src={'/veREAX.svg'} rounded={'full'} boxSize={'18px'} />
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
                        mt={{ sm: 16, md: 0 }}
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
                                    : "primary.400"
                    }
                    width={
                        pos.debtLimit + "%"
                    }
                ></Box>
            </Box>
        </Box>
    : <></>}
    </>
  )
}

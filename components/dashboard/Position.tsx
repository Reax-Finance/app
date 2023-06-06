import React from 'react'
import Info from '../infos/Info'
import { Flex, Text, Box, Heading } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { IoMdAnalytics, IoMdCash } from 'react-icons/io'
import IconBox from './IconBox'
import { TbReportMoney } from 'react-icons/tb'
import Big from 'big.js'
import { useAppData } from '../context/AppDataProvider'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { dollarFormatter } from '../../src/const'

export default function Position() {
    const { pools, tradingPool, account } = useAppData();

	const debtLimit = () =>
		(100 * pools[tradingPool]?.userDebt) /
		pools[tradingPool]?.userCollateral;

	const availableToIssue = () => {
		if(!pools[tradingPool]?.adjustedCollateral) return 0;
		if(pools[tradingPool].adjustedCollateral - pools[tradingPool]?.userDebt < 0) return 0;
		return pools[tradingPool].adjustedCollateral - pools[tradingPool].userDebt
	}

	const totalPortfolioValue = () => {
		if (!pools[tradingPool]) return "0";
		let total = Big(0);
		for (let i = 0; i < pools[tradingPool]?.synths.length; i++) {
			const synth = pools[tradingPool]?.synths[i];
			total = total.add(
				Big(synth.walletBalance ?? 0)
					.div(1e18)
					.mul(synth.priceUSD ?? 0)
			);
		}
		return total.toFixed(2);
	}
  return (
    <>
        {pools[tradingPool]?.userCollateral > 0 ? <Box
            w='100%'
            display={{ sm: "block", md: "block" }}
            className='positionTable'
        >
            <Flex align={'center'} justify={'space-between'} px={5} py={4} className='cutoutcornersboxright'>
                <Heading fontSize={'xl'}>
                    <span className='gradienttext'>
                    Your Position
                    </span>
                </Heading>

                <Info
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
										Available to Mint: {" "}
									</Text>
									<Text
										mr={0.5}
										fontWeight="medium"
									>
										{dollarFormatter.format(
											availableToIssue()
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
                                    <IoMdCash size={'22px'} />
                                </IconBox>

                                <Info
                                    message={`
                                        Sum of all your collateral deposited in USD
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
                                            {(
                                                pools[tradingPool]
                                                    ?.userCollateral ?? 0
                                            ).toFixed(2)}
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
                                    message={`When you issue synths, you are allocated a share of pool's total debt. As the pool's total value changes, your debt changes as well`}
                                    title={"Debt is variable"}
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
                                                    {(
                                                        pools[tradingPool]
                                                            ?.userDebt ?? 0
                                                    ).toFixed(2)}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                </Info>
                            </Flex>

                            {Big(pools[tradingPool]?.userDebt ?? 0).gt(0) && <Flex gap={3} align="start">
                                <IconBox>
                                    <IoMdAnalytics size={'20px'} />
                                </IconBox>

                                <Info
                                    message={`
                                    In order to make profit, you'd mint synthetics that move up relative to pool's total liquidity. So your debt will be lower to your synthetic holdings.
                                    `}
                                    title={"Profit and Loss"}
                                >
                                    <Box cursor={"help"}>
                                        <Heading
                                            mb={0.5}
                                            size={"xs"}
                                            color="whiteAlpha.700"
                                        >
                                            PnL
                                        </Heading>
                                        <Flex gap={2} align="center">
                                            <Flex
                                                fontWeight={"semibold"}
                                                fontSize={"lg"}
                                                gap={1}
                                                color={Big(totalPortfolioValue()).gt(pools[tradingPool]?.userDebt ?? 0) ? 'green.400' : 'red.400'}
                                            >
                                                <Text
                                                    // color={"whiteAlpha.800"}
                                                    fontWeight={"normal"}
                                                >
                                                    $
                                                </Text>
                                                <Text>
                                                    {Big(totalPortfolioValue()).sub(pools[tradingPool]?.userDebt).toFixed(2)} ({Big(totalPortfolioValue()).sub(pools[tradingPool]?.userDebt).mul(100).div(pools[tradingPool]?.userDebt).toFixed(2)}%)
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
                                pools[tradingPool]?.userCollateral > 0
                                    ? availableToIssue() > 1
                                    ? "green.400"
                                    : "yellow.400"
                                    : "red.400"
                            }
                        >
                            {(pools[tradingPool]?.userCollateral > 0
                                ? debtLimit()
                                : pools[tradingPool]?.userCollateral ?? 0
                            ).toFixed(1)}{" "}
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
                                h={1}
                                bg={"primary.400"}
                                width={
                                    (pools[tradingPool]?.userCollateral > 0
                                        ? debtLimit()
                                        : "0") + "%"
                                }
                            ></Box>
                        </Box>
        </Box>
    : <Box h={'20px'}></Box>    
    }
    </>
  )
}

import { Box, Button, Divider, Flex, Heading, Image, Input, Skeleton, Text, Tooltip, useColorMode } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useLendingData } from "../../components/context/LendingDataProvider";
import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
} from "@chakra-ui/react";
import { BsArrowRight, BsArrowRightShort } from "react-icons/bs";
import { dollarFormatter } from "../../src/const";
import ThBox from "../../components/dashboard/ThBox";
import { HEADING_FONT, VARIANT } from "../../styles/theme";
import TdBox from "../../components/dashboard/TdBox";
import { useRouter } from "next/router";
import Head from "next/head";

const POPULAR_ASSETS = ['USDT', 'ETH', 'cUSD', 'MNT']

export default function Lend() {
	const { pools: allPools, protocols } = useLendingData();
	const { colorMode } = useColorMode();
    const router = useRouter();

    const [pools, setPools] = useState<any>([]);
    const [searchedPools, setSearchedPools] = useState<any>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        if(pools.length > 0) return;
        if(!allPools[0][0] || !protocols[0]._lendingPoolAddress) return;
        // clone allPools
        let allPoolsClone = JSON.parse(JSON.stringify(allPools));
        // Sort pools by protocols[index].totaldepositbalance, and add to pools array, preserving index number
        let sortedPools = allPoolsClone.sort((a: any, b: any) => {
            return protocols.find((protocol: any) => protocol._lendingPoolAddress == b[0].protocol._lendingPoolAddress).totalDepositBalanceUSD - protocols.find((protocol: any) => protocol._lendingPoolAddress == a[0].protocol._lendingPoolAddress).totalDepositBalanceUSD
        });
        // Set index to sorted pools
        sortedPools = sortedPools.map((pool: any) => {
            let index = protocols.findIndex((protocol: any) => protocol._lendingPoolAddress == pool[0].protocol._lendingPoolAddress);
            return pool.map((market: any) => {
                market.poolIndex = index;
                return market;
            })
        });
        setPools(sortedPools);
        setSearchedPools(sortedPools);
    }, [allPools, protocols]);


    const search = (term: string) => {
        let _searchedPools = [];
        term = term.toLowerCase();
        for(let i in pools){
            for (let j in pools[i]){
                let market = pools[i][j];
                if(market.inputToken.symbol.toLowerCase().includes(term) || market.inputToken.name.toLowerCase().includes(term)){
                    _searchedPools.push(pools[i]);
                    break;
                }
            }
        }
        setSearchedPools(_searchedPools);
        setSearchTerm(term);
    }

	return (<>
        <Head>
            <title>{process.env.NEXT_PUBLIC_TOKEN_SYMBOL} | Lend</title>
            <link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}></link>
        </Head>
		<Box mt={"80px"}>
            <Flex justify={'space-between'} align={'start'}>
                <Flex flexDir={'column'} align={'start'} gap={6} mb={10}>
                <Heading fontWeight={HEADING_FONT == 'Chakra Petch' ? 'bold' : 'semibold'} fontSize={'32px'}>Lending Pools</Heading>
                <Text color={'whiteAlpha.600'}>
                    Isolated pools for secure and simple Lending/Borrowing
                </Text>
                </Flex>
                <Flex>
                    {/* <Box className={`${VARIANT}-${colorMode}-outlinedButton`}>
                        <Button bg={'transparent'} _hover={{bg: 'transparent'}} isDisabled={true}>Create A New Pool</Button>
                    </Box> */}
                </Flex>
            </Flex>
			<Box mt={4} className={`${VARIANT}-${colorMode}-containerBody`}>
            <Flex justify={'space-between'} className={`${VARIANT}-${colorMode}-containerHeader`}>
                <Flex align={'center'} p={4} px={5} gap={4}>
                    <Heading fontSize={'18px'} color={'secondary.400'}>All Pools</Heading>
                </Flex>

                <Flex align={'center'} mr={5}>
                    {/* Search Pool by Name */}
                    <Input placeholder="Filter by Token" variant="filled" size="sm" w={'200px'} onChange={(e) => search(e.target.value)} />
                    {POPULAR_ASSETS.map((asset: string) => {
                        return (
                            <>
                            <Divider orientation="vertical" h={'30px'} borderColor={'whiteAlpha.400'}/>
                            <Button size={'sm'} rounded={0} gap={2} key={asset} onClick={() => searchTerm == asset ? search('') : search(asset)} bg={searchTerm == asset ? 'whiteAlpha.600' : 'whiteAlpha.200'}> 
                                <Image src={`/icons/${asset}.svg`} alt="" w={'20px'} />
                            </Button>
                            </>
                        )
                    })}
                </Flex>
            </Flex>
				<TableContainer h={'100%'} pb={4}>
					<Table variant="simple">
						<Thead>
							<Tr>
								<ThBox alignBox='left'>ID</ThBox>
								<ThBox alignBox='center'>Assets</ThBox>
								<ThBox alignBox='center'>Total Supplied</ThBox>
								<ThBox alignBox='center'>Total Borrowed</ThBox>
								<ThBox isNumeric alignBox='right'></ThBox>
							</Tr>
						</Thead>
						<Tbody>
							{pools.length > 0 ? searchedPools.length > 0 ? searchedPools.map((pool: any, index: number) => (
								<>
									<Tr cursor={'pointer'} _hover={{bg:'whiteAlpha.100'}} onClick={() => {
                                        router.push(`/lend/${pool[0].poolIndex}`);
                                    }}>
                                    <TdBox alignBox='left'>
                                        #{pool[0].poolIndex}
                                    </TdBox>
                                    <TdBox alignBox='center'>
                                        <Box my={5}>
                                        <Flex ml={2}>
                                            {pool.map((market: any) => (
                                                <>
                                                <Tooltip label={market.inputToken.symbol} >
                                                <Flex
                                                    ml={"-2"}
                                                    key={index}
                                                    align="center"
                                                    gap={2}
                                                    border={'2px'}
                                                    borderRadius={'full'}
                                                    borderColor={'white'}
                                                >
                                                        <Image
                                                            src={`/icons/${market.inputToken.symbol}.svg`}
                                                            alt=""
                                                            w={"28px"}
                                                        />
                                                    </Flex>
                                                </Tooltip>
                                                </>
                                            ))}
                                        </Flex>
                                        <Text fontSize={"lg"} textAlign={'left'} pt={2}>
                                            {protocols[pool[0].poolIndex].name}
                                        </Text>
                                        </Box>
                                    </TdBox>
                                    <TdBox>
                                        <Text mt={0.5} color={'primary.400'}>{dollarFormatter.format(protocols[pool[0].poolIndex].totalDepositBalanceUSD)}</Text>
                                    </TdBox>
                                    <TdBox>
                                        <Text mt={0.5} color={'secondary.400'}>{dollarFormatter.format(protocols[pool[0].poolIndex].totalBorrowBalanceUSD)}</Text>
                                    </TdBox>
                                    <TdBox isNumeric alignBox='right'>
                                        <Flex>
                                            <BsArrowRightShort color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'} size={'25px'} />
                                        </Flex>
                                    </TdBox>
                                </Tr>
                            </>
							)) : <>
                                <Flex w={'100%'} py={4} px={6}>
                                    <Text color={'whiteAlpha.400'}>No Pools Found for {'"'}{searchTerm}{'"'}</Text>
                                </Flex>
                            </> : <>
                                <Tr>
                                    <Td>
                                        <Skeleton height="40px" />
                                    </Td>
                                    <Td>
                                        <Skeleton height="40px" />
                                    </Td>
                                    <Td>
                                        <Skeleton height="40px" />
                                    </Td>
                                    <Td>
                                        <Skeleton height="40px" />
                                    </Td>
                                </Tr>
                            </>}
						</Tbody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
        </>
	);
}

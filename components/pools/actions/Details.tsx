import { Flex, Text, Image, ModalOverlay, ModalCloseButton, Modal, ModalBody, ModalContent, ModalHeader, Box, Heading, Divider } from '@chakra-ui/react'
import React from 'react'
import { dollarFormatter, tokenFormatter } from '../../../src/const';
import Big from 'big.js';
import { usePriceData } from '../../context/PriceContext';

export default function Details({pool, isOpen, onClose}: any) {
	
	const { prices } = usePriceData();

	const tvl = pool.tokens.reduce((acc: any, token: any) => {
		return acc + Big(token.balance ?? 0).mul(prices[token.token.id] ?? 0).toNumber()
	}, 0)

  	return (
    <>
    <Modal
				isCentered
				isOpen={isOpen}
				onClose={onClose}
			>
				<ModalOverlay />
				<ModalContent width={"30rem"} bgColor="bg1" rounded={0} mx={2}>
					<ModalCloseButton rounded={"0"} mt={1} />
					<ModalHeader>
						<Flex
							justify={"center"}
							gap={2}
							pt={1}
							align={"center"}
						>
							<Flex ml={-4}>
								{pool.tokens.map(
									(token: any, index: number) => {
										return (
											pool.address !== token.token.id && (
												<Flex
													ml={"-2"}
													key={index}
													align="center"
													gap={2}
												>
													<Image
														rounded={"full"}
														src={`/icons/${token.token.symbol}.svg`}
														alt=""
														width={"30px"}
													/>
												</Flex>
											)
										);
									}
								)}
							</Flex>
							<Text>{pool.name}</Text>
						</Flex>
					</ModalHeader>
    <ModalBody p={0}>
        {/* {JSON.stringify(pool)} */}
		<Divider />
		<Flex>
		<Box mx={4} my={4}>
			<Text mt={2} mb={2}>Total Value Locked</Text>
			<Flex gap={2} flexDir={'column'}>
				<Heading size={'md'}>
			{dollarFormatter.format(tvl)}
			</Heading>
			</Flex>
		</Box>

		<Divider orientation="vertical" h={'110px'} />

		<Box mx={4} my={4}>
			<Text mt={2} mb={2}>24H Volume</Text>
			<Flex gap={2} flexDir={'column'}>
				<Heading size={'md'}>
				{dollarFormatter.format(pool.totalSwapVolume)}
				</Heading>
			</Flex>
		</Box>

		</Flex>

		<Divider />

		<Flex>
		<Box mx={4} my={4}>
			<Text mt={2} mb={2}>Fees Generated</Text>
			<Flex gap={8}>
				<Box>
					<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>24hr</Text>
					<Heading size={'md'}>
					{dollarFormatter.format(pool.totalSwapFee)}
					</Heading>
				</Box>

				<Box>
					<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>7 Days</Text>
					<Heading size={'md'}>
					{dollarFormatter.format(pool.totalSwapFee)}
					</Heading>
				</Box>

				<Box>
					<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>1 Year</Text>
					<Heading size={'md'}>
					{dollarFormatter.format(pool.totalSwapFee)}
					</Heading>
				</Box>
			</Flex>
		</Box>

		<Divider orientation="vertical" h={'130px'} />

		<Box mx={4} my={4}>
			<Text mt={2} mb={2}>APR</Text>
			<Box>
				<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>7d Annualized</Text>
				<Heading size={'md'}>
				{dollarFormatter.format(((pool.totalSwapFee / pool.totalSwapVolume) || 0) * 365)}
				</Heading>
			</Box>
		</Box>
		</Flex>

		<Divider />

		<Box mx={4} my={4}>
			<Heading size={'md'} mt={2} mb={4}>Pool Composition</Heading>
			<Flex gap={2} flexDir={'column'}>
			{pool.tokens.map((token: any, index: number) => {
				if(token.token.id == pool.address) return <></>
				return <Flex key={index} justify={'space-between'} >
					<Flex gap={2}>
					<Image
						rounded={"full"}
						src={`/icons/${token.token.symbol}.svg`}
						alt=""
						width={"30px"}
					/>
					<Text>{token.token.symbol}</Text>
					<Text>({tvl > 0 && Big(token.balance ?? 0).mul(prices[token.token.id] ?? 0).div(tvl).mul(100).toFixed(2)}%)</Text>
					</Flex>
					<Text size={'md'}>{tokenFormatter.format(token.balance)} ({dollarFormatter.format(Big(token.balance ?? 0).mul(prices[token.token.id] ?? 0).toNumber())})</Text>
				</Flex>
			})}
			</Flex>
		</Box>
    </ModalBody>
    </ModalContent>
    </Modal>
    </>
  )
}

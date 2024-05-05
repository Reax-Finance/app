import {
	Box,
	Text,
	Flex,
	Input,
	Divider,
	Image,
	Button,
	Tooltip,
	Heading,
	useColorMode
} from "@chakra-ui/react";

import { useContext, useState, useEffect } from "react";
import { tokenFormatter } from "../../src/const";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { MdTrendingUp, MdVerified } from "react-icons/md";
import { VARIANT } from "../../styles/theme";
import Big from "big.js";

const POPULAR_TOKENS = ['WETH', 'MNT', 'USDT', 'cUSD']

function TokenSelector({
	onTokenSelected,
	onPoolChange,
	isOpen,
	onOpen,
	onClose,
	tokens
}: any) {
	const [searchedTokens, setSearchedTokens] = useState<any[]>([]);
	const {isConnected, address} = useAccount();

	const selectToken = (tokenIndex: number) => {
		onTokenSelected(tokenIndex);
	};

	useEffect(() => {
		if (tokens.length > 1) {
			searchToken("");
		}
	}, [tokens.length, address]);

	const searchToken = (searchTerm: string) => {
		// search token from all pool _mintedTokens
		const _searchedTokens = [];
		for (let j in tokens) {
			const _token = tokens[j];
			if (
				_token.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				_token.symbol
					.toLowerCase()
					.includes(searchTerm.toLowerCase())
			) {
				_searchedTokens.push(j);
			}
		}
		setSearchedTokens(_searchedTokens);
	};

	const _onClose = () => {
		searchToken("");
		onClose();
	}

	if(tokens.length <= 1) return <></>

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { colorMode } = useColorMode();

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={_onClose}
				scrollBehavior={"inside"}
				isCentered
			>
				<ModalOverlay bg="blackAlpha.800" backdropFilter="blur(30px)" />
				<ModalContent bg={'transparent'} shadow={'none'} rounded={0} maxH={"800px"} mx={2}>
					<Box className={`${VARIANT}-${colorMode}-containerBody`}>
						<Box className={`${VARIANT}-${colorMode}-containerHeader`}>
					<ModalHeader>Select a Token </ModalHeader>
					<Box mx={5} mb={0}>
						<Input bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} size={'lg'} _focus={{border: 0, outline: 0}} focusBorderColor='secondary.100' rounded={0} placeholder="Search by Token Name or Address" onChange={(e) => searchToken(e.target.value)} />
					</Box>
					<Box mx={5} mt={2} pb={4}>
						<Flex align={'center'} >
						{/* <Text mr={2} fontSize={'sm'} color={'whiteAlpha.700'}>Trending </Text> */}
						<Box p={'3'} border={'1px'} borderColor={colorMode == 'dark' ? 'whiteAlpha.300' : 'blackAlpha.300'}>
							<MdTrendingUp/>
						</Box>
						{POPULAR_TOKENS.map((token, index) => (
							tokens.map((t: any, i: number) => (
								t.symbol === token && (
									<Box border={'1px'} borderColor={colorMode == 'dark' ? 'whiteAlpha.300' : 'blackAlpha.300'} bg={colorMode == 'dark' ? 'darkBg.200' : 'blackAlpha.100'} py={1} px={3} pr={4} _hover={{bg: 'blackAlpha.50'}} key={i}>
										<Button size={'sm'} fontWeight={'normal'} variant={'unstyled'} onClick={() => selectToken(i)}>
											<Flex align={'center'}>
											<Image src={`/icons/${t.symbol}.svg`} w={'22px'} alt="" />
											<Text fontSize={'sm'} ml={2} color={colorMode == 'dark' ? 'white' : 'black'}>{t.symbol}</Text>
											</Flex>
										</Button>
									</Box>
								)
							))
						))}
						</Flex>
					</Box>

					{ VARIANT == 'edgy' && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }

					<ModalCloseButton rounded={'full'} mt={1} />

					</Box>
					<ModalBody bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} maxH={'55vh'}>

						{/* Token List */}
						<Box mx={-6} mt={-2}>
						{searchedTokens.map(
							(tokenIndex: number) => tokens[tokenIndex] && (
								<Box key={tokenIndex}>
								{tokenIndex > 0 && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }
								<Flex
									justify="space-between"
									align={"center"}
									py={3}
									px={6}
									_hover={{
										bg: "bg.400",
										cursor: "pointer",
									}}
									onClick={() =>
										selectToken(
											tokenIndex
										)
									}
								>
									<Box
										borderColor={"gray.700"}
									>
										<Flex
											align={"center"}
											gap={"2"}
											ml={-1}
										>
											<Image
												src={
													"/icons/" +
													tokens[tokenIndex].symbol +
													".svg"
												}
												height={'40px'}
												alt={''}
											/>

											<Box>
												<Flex gap={1} align={'center'}>
												<Text>
													{tokens[tokenIndex].symbol}
												</Text>
												{/* {whitelistedTokens.includes(token.id) && ( */}
													<Tooltip label={'Verified'}>
														<Box color="green.400">
														<MdVerified />
														</Box>
													</Tooltip>
												{/* )} */}
												</Flex>

												<Text
													color={
														"gray.500"
													}
													fontSize={"sm"}
												>
													{tokens[tokenIndex].name}
												</Text>
											</Box>
										</Flex>
									</Box>

									{isConnected && <Box
										borderColor={"gray.700"}
										pl={2}
										textAlign="right"
									>
										<Text fontSize={'xs'} color={"gray.500"}>Balance</Text>
										<Text fontSize={"md"}>
											{tokenFormatter.format(Big(tokens[tokenIndex].balance ?? 0).div(10 ** (tokens[tokenIndex].decimals ?? 18)).toNumber())}
										</Text>
									</Box>}
								</Flex>
								</Box>
							)
						)}
						</Box>
					</ModalBody>
					<Flex className={`${VARIANT}-${colorMode}-containerFooter`} roundedBottom={16} py={1} justify='space-between' px={4} fontSize='sm' >
						<Text>{tokens.length} Tokens</Text>
						<Text>{process.env.NEXT_PUBLIC_TOKEN_SYMBOL} Token List</Text>
					</Flex>
					</Box>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;

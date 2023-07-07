import {
	Box,
	Text,
	Flex,
	Input,
	Divider,
	Image,
	Button,
	Tooltip,
	Heading
} from "@chakra-ui/react";

import { useContext, useState, useEffect } from "react";
import { AppDataContext } from "../context/AppDataProvider";
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
import { useBalanceData } from "../context/BalanceProvider";
import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { MdTrendingUp, MdVerified } from "react-icons/md";
import whitelistedTokens from "../../src/whitelistedTokens";

const POPULAR_TOKENS = ['ETH', 'MNT', 'USDC', 'cUSD']

function TokenSelector({
	onTokenSelected,
	onPoolChange,
	isOpen,
	onOpen,
	onClose,
}: any) {
	const [searchedTokens, setSearchedTokens] = useState<any[]>([]);
	const { walletBalances, tokens: _tokens } = useBalanceData();
	const {chain} = useNetwork();
    const tokens: any[] = _tokens.concat({ id: ethers.constants.AddressZero, symbol: chain?.nativeCurrency.symbol ?? 'MNT', name: chain?.nativeCurrency.name ?? 'Mantle', decimals: chain?.nativeCurrency.decimals ?? 18, balance: walletBalances[ethers.constants.AddressZero] });

	const selectToken = (tokenIndex: number) => {
		onTokenSelected(tokenIndex);
	};

	useEffect(() => {
		if (tokens.length > 1) {
			searchToken("");
		}
	}, [tokens.length]);

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
				_searchedTokens.push({
					..._token,
					tokenIndex: j,
				});
			}
		}
		setSearchedTokens(_searchedTokens);
	};

	const _onClose = () => {
		searchToken("");
		onClose();
	}

	if(tokens.length <= 1) return <></>

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={_onClose}
				scrollBehavior={"inside"}
				isCentered
			>
				<ModalOverlay bg="blackAlpha.800" backdropFilter="blur(30px)" />
				<ModalContent bg={'transparent'} bgGradient={'linear-gradient(-135deg, transparent 10px, bg1 0) '} shadow={'none'} rounded={0} maxH={"800px"} mx={2}>
					<ModalHeader>Select a Token </ModalHeader>
					<Box mx={5} mb={0}>
						<Input bg={'blackAlpha.200'} size={'lg'} _focus={{border: 0, outline: 0}} focusBorderColor='secondary.100' rounded={0} placeholder="Search by Token Name or Address" onChange={(e) => searchToken(e.target.value)} />
					</Box>
					<Box mx={5} mt={2} mb={4}>

						<Flex align={'center'} >
						{/* <Text mr={2} fontSize={'sm'} color={'whiteAlpha.700'}>Trending </Text> */}
						<Box p={'3'} border={'1px'} borderColor={'whiteAlpha.300'} bg={'blackAlpha.200'}>
						<MdTrendingUp/>
						</Box>
							{POPULAR_TOKENS.map((token, index) => (
								tokens.map((t: any, i: number) => (
									t.symbol === token && (
										<Box border={'1px'} borderColor={'whiteAlpha.300'} bg={'blackAlpha.400'} py={1} px={3} pr={4} _hover={{bg: 'blackAlpha.50'}} key={i}>
											<Button size={'sm'} fontWeight={'normal'} variant={'unstyled'} onClick={() => selectToken(i)}>
												<Flex align={'center'}>
												<Image src={`/icons/${t.symbol}.svg`} w={'22px'} alt="" />
												<Text fontSize={'sm'} ml={2} color={'white'}>{t.symbol}</Text>
												</Flex>
											</Button>
										</Box>
									)
								))
							))}
						</Flex>
					</Box>
					<Divider />

					<ModalCloseButton rounded={'full'} mt={1} />
					<ModalBody bg={'bg2'}>

						{/* Token List */}
						<Box mx={-6} mt={-2}>
						{searchedTokens.map(
							(token: any, tokenIndex: number) => (
								<Box key={tokenIndex}>
								<Divider/>
								<Flex
									justify="space-between"
									align={"center"}
									py={3}
									px={6}
									_hover={{
										bg: "whiteAlpha.50",
										cursor: "pointer",
									}}
									onClick={() =>
										selectToken(
											token.tokenIndex
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
													token.symbol +
													".svg"
												}
												height={'40px'}
												alt={''}
											/>

											<Box>
												<Flex gap={1} align={'center'}>
												<Text>
													{token.symbol}
												</Text>
												{whitelistedTokens.includes(token.id) && (
													<Tooltip label={'Verified'}>
														<Box color="green.400">
														<MdVerified />
														</Box>
													</Tooltip>
												)}
												</Flex>

												<Text
													color={
														"gray.500"
													}
													fontSize={"sm"}
												>
													{token.name}
												</Text>
											</Box>
										</Flex>
									</Box>

									<Box
										borderColor={"gray.700"}
										px={2}
										textAlign="right"
									>
										<Text fontSize={'xs'} color={"gray.500"}>Balance</Text>
										<Text fontSize={"md"}>
											{tokenFormatter.format((walletBalances[token.id] ?? 0) / 10 ** (token.decimals ?? 18))}
										</Text>
									</Box>
								</Flex>
								</Box>
							)
						)}
						</Box>
					</ModalBody>
					<Flex roundedBottom={16} py={1} justify='space-between' px={4} fontSize='sm' >
						<Text>{tokens.length} Tokens</Text>
						<Text>Reax Token List</Text>
					</Flex>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;

import {
	Box,
	Text,
	Flex,
	Input,
	Divider,
	Image,
	Button
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

const POPULAR_TOKENS = ['ETH', 'MNT', 'USDC', 'USDT']

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

	if(tokens.length <= 1) return <></>

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				scrollBehavior={"inside"}
				isCentered
			>
				<ModalOverlay bg="blackAlpha.800" backdropFilter="blur(30px)" />
				<ModalContent bg={'transparent'} bgGradient={'linear-gradient(-135deg, transparent 10px, bg1 0) '} shadow={'none'} rounded={0} maxH={"800px"} mx={2}>
					<ModalHeader>Select a token</ModalHeader>
					<Box mx={5} mb={2}>
						<Input rounded={0} placeholder="Search token" onChange={(e) => searchToken(e.target.value)} />
					</Box>
					<Box mx={5} mt={1}>

						<Flex align={'center'} mb={4} mt={2}>
						<Text mr={2} fontSize={'sm'} color={'whiteAlpha.700'}>Trending </Text>
							{POPULAR_TOKENS.map((token, index) => (
								tokens.map((t: any, i: number) => (
									t.symbol === token && (
										<Box className="smallcutoutcornersbox" pl={2} py={0.5} pr={4} mr={2} key={i}>
											<Button size={'sm'} fontWeight={'normal'} variant={'unstyled'} onClick={() =>
										selectToken(
											i
										)
									}>
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
													token.symbol +
													".svg"
												}
												height={'40px'}
												alt={''}
											/>

											<Box>
												<Text>
													{token.symbol}
												</Text>

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
						<Text>Reax</Text>
					</Flex>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;

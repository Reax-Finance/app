import {
	Box,
	Text,
	Flex,
	Select,
	useDisclosure,
	Button,
	Input,
	Tooltip,
	Divider,
	Image
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

function TokenSelector({
	onTokenSelected,
	onPoolChange,
	isOpen,
	onOpen,
	onClose,
}: any) {
	const { tradingPool, setTradingPool, pools } = useContext(AppDataContext);

	const [searchPools, setSearchPools] = useState<any[]>([]);
	const { walletBalances } = useBalanceData();

	const selectToken = (tokenIndex: number) => {
		onTokenSelected(tokenIndex);
	};

	const searchToken = (searchTerm: string) => {
		// search token from all pool _mintedTokens
		const _pools = [...pools];
		const _searchedTokens = [];
		for (let i in _pools) {
			const _mintedTokens = _pools[i]._mintedTokens;
			const _seachedPool: any = { ..._pools[i] };
			_seachedPool._mintedTokens = [];
			for (let j in _mintedTokens) {
				const _token = _mintedTokens[j];
				if (
					_token.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					_token.symbol
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
				) {
					_seachedPool._mintedTokens.push({
						..._token,
						poolIndex: i,
						tokenIndex: j,
					});
				}
			}
			_searchedTokens.push(_seachedPool);
		}
		setSearchPools(_searchedTokens);
	};

	useEffect(() => {
		if (pools.length > 0 && searchPools.length == 0) {
			searchToken("");
		}
	}, [searchToken]);

	if(!pools[tradingPool]) return <></>

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				scrollBehavior={"inside"}
				isCentered
			>
				<ModalOverlay bg="blackAlpha.800" backdropFilter="blur(30px)" />
				<ModalContent bg={'transparent'} bgGradient={'linear-gradient(-135deg, transparent 10px, bg1 0) '} shadow={'none'} rounded={0} maxH={"600px"} mx={2}>
					<ModalHeader>Select a token</ModalHeader>
					<Box mx={5} mb={5}>
					<Select rounded={'0'} placeholder="Select debt pool" value={tradingPool} onChange={(e) => {
						if(e.target.value !== ''){
							setTradingPool(Number(e.target.value))
							localStorage.setItem("tradingPool", e.target.value);
						}}} bg='whiteAlpha.100' variant={'filled'}  _focus={{bg: 'whiteAlpha.200'}} focusBorderColor='transparent'>
							{pools.map((pool: any, index: number) => (
								<option value={index} key={pool.id}>
									{pool.name}
								</option>
							))}
						</Select>
						</Box>
						{/* <Divider/> */}
					<ModalCloseButton rounded={'full'} mt={1} />
					<ModalBody bg={'bg2'}>

						{/* Token List */}
						<Box mx={-6} mt={-2}>
						{pools[tradingPool].synths.map(
							(_synth: any, tokenIndex: number) => (
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
													_synth.token.symbol +
													".svg"
												}
												height={'40px'}
												alt={_synth.token.symbol}
											/>

											<Box>
												<Text>
													{_synth.token.symbol}
												</Text>

												<Text
													color={
														"gray.500"
													}
													fontSize={"sm"}
												>
													{_synth.token.name.split(" ").slice(1, -2).join(" ")}
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
											{tokenFormatter.format((walletBalances[_synth.token.id] ?? 0) / 10 ** 18)}
										</Text>
									</Box>
								</Flex>
								</Box>
							)
						)}
						</Box>
					</ModalBody>
					<Flex roundedBottom={16} py={1} justify='space-between' px={4} fontSize='sm' >
						<Text>{pools[tradingPool].synths.length} Tokens</Text>
						<Text>Reax</Text>
					</Flex>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;
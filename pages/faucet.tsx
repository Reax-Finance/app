import {
	Box,
	Button,
	Divider,
	Flex,
	Heading,
	IconButton,
	Link,
	useColorMode,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import React, { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tr,
	TableContainer,
	Text,
	Image,
} from "@chakra-ui/react";
import {
	AppDataContext,
	useAppData,
} from "../components/context/AppDataProvider";

const nonMintable = [
	"ETH",
	"WETH",
	"cUSD",
	"sUSD",
	"cBTC",
	"cETH",
	"cBNB",
	"sAAPL",
	"sMSFT",
	"sCOIN",
	"sGOOGL",
	"cXRP",
	"cDOGE",
	"cSOL",
	"cDOT",
	"cADA",
	"cLTC",
	"WMNT",
];

import Head from "next/head";

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
import { ethers } from "ethers";
import { useBalanceData } from "../components/context/BalanceProvider";
import Big from "big.js";
import { VARIANT } from "../styles/theme";
import { MdOpenInNew } from "react-icons/md";
import ThBox from "../components/ui/table/ThBox";
import TdBox from "../components/ui/table/TdBox";
import { NATIVE_FAUCET_LINK, isSupportedChain } from "../src/const";
import useChainData from "../components/context/useChainData";

export default function Faucet() {
	const { reserveData } = useAppData();
	const [loading, setLoading] = React.useState<any>(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openedCollateral, setOpenedCollateral] = React.useState<any>(null);
	const { getContract, send } = useChainData();

	const { address, isConnected, chain } = useAccount();

	const tokens = reserveData
		? reserveData.vaults.map((vault: any) => vault.asset)
		: [];

	const _onOpen = (collateral: any) => {
		setOpenedCollateral(collateral);
		onOpen();
	};

	const _onClose = () => {
		setOpenedCollateral(null);
		setLoading(false);

		onClose();
	};

	const toast = useToast();

	const mint = async () => {
		setLoading(true);
		const token = getContract("MockToken", openedCollateral.id);
		send(token, "mint", [])
			.then(async (res: any) => {
				await res.wait();
				// updateFromTx(response);

				setLoading(false);
				toast({
					title: `Minted ${openedCollateral.symbol}`,
					description: `${openedCollateral.symbol} minted to your wallet.`,
					status: "success",
					duration: 5000,
					isClosable: true,
					position: "top-right",
				});
				onClose();
			})
			.catch((err: any) => {
				console.log(err);
				setLoading(false);
			});
	};

	const addToMetamask = async (token: any) => {
		(window as any).ethereum.request({
			method: "wallet_watchAsset",
			params: {
				type: "ERC20", // Initially only supports ERC20, but eventually more!
				options: {
					address: token.id, // The address that the token is at.
					symbol: token.symbol, // A ticker symbol or shorthand, up to 5 chars.
					decimals: token.decimals, // The number of decimals in the token
					image:
						process.env.NEXT_PUBLIC_VERCEL_URL +
						"/icons/" +
						token.symbol +
						".svg", // A string url of the token logo
				},
			},
		});
	};
	const { colorMode } = useColorMode();
	if(!chain) return <></>;

	const validate = () => {
		if (!isConnected)
			return { valid: false, message: "Please connect your wallet." };
		else if (!isSupportedChain(chain?.id))
			return { valid: false, message: "Unsupported network" };
		else return { valid: true, message: "Mint" };
	};

	return (
		<Box h={'60vh'}>
			<Head>
				<title>
					Test Faucet | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
				</title>
				<link
					rel="icon"
					type="image/x-icon"
					href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}
				></link>
			</Head>
			<Heading mt={"80px"} fontSize={"3xl"}>
				Faucet
			</Heading>
			<Text
				color={
					colorMode == "dark" ? "whiteAlpha.500" : "blackAlpha.500"
				}
				mt={2}
				mb={10}
			>
				Note: This is a testnet faucet. These tokens are not real and
				have no value.
			</Text>

			<TableContainer
				px={4}
				pb={4}
				className={`${VARIANT}-${colorMode}-containerBody`}
				rounded={0}
			>
				<Table variant="simple">
					<Thead>
						<Tr>
							<ThBox>Asset</ThBox>
							<ThBox isNumeric></ThBox>
						</Tr>
					</Thead>
					<Tbody>
						{tokens.map((token: any, index: number) => {
							if (nonMintable.includes(token.symbol)) return;
							return (
								<Tr key={index}>
									<TdBox
										style={
											index == token.length - 1
												? { border: 0 }
												: {}
										}
									>
										<Flex gap={2}>
											<Image
												src={`/icons/${token.symbol}.svg`}
												w="34px"
                                                alt={token.symbol}
											/>
											<Box>
												<Flex align={"center"} gap={2}>
													<Text>{token.symbol}</Text>
													<IconButton
														icon={
															<Image
																src="https://cdn.consensys.net/uploads/metamask-1.svg"
																w={"20px"}
																alt=""
															/>
														}
														onClick={() =>
															addToMetamask(token)
														}
														size={"xs"}
														rounded="full"
														aria-label={""}
													/>
												</Flex>
												<Text
													textAlign={"left"}
													fontSize={"sm"}
													color="gray.500"
												>
													{/* {Big(walletBalances[token.id] ?? 0).div(10**token.decimals).toNumber()} in wallet */}
												</Text>
											</Box>
										</Flex>
									</TdBox>
									<TdBox
										style={
											index == tokens.length - 1
												? { border: 0 }
												: {}
										}
										isNumeric
									>
										<Flex justify={"end"}>
											<Box
												className={`${VARIANT}-${colorMode}-primaryButton`}
											>
												<Button
													onClick={() =>
														_onOpen(token)
													}
													color={"white"}
													size={"md"}
													bg={"transparent"}
													_hover={{
														bg: "transparent",
													}}
												>
													Mint
												</Button>
											</Box>
										</Flex>
									</TdBox>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</TableContainer>

            {NATIVE_FAUCET_LINK[chain.id] && <Flex align={'center'} justify={'space-between'} className={`${VARIANT}-${colorMode}-containerBody`} p={4} rounded={0} mt={4}>
				<Image src={'/icons/ETH.svg'} w={'40px'} />
                <Box>
                    <Heading size={'md'} mb={2}>{chain.nativeCurrency.name} Faucet</Heading>
                    <Text fontSize={'sm'} color={'whiteAlpha.600'}>
                        Get some test {chain.nativeCurrency.symbol} on this external faucet.
                    </Text>
                </Box>
                <Link href={NATIVE_FAUCET_LINK[chain.id]} target="_blank">
                    <Button rounded={0}>Get {chain.nativeCurrency.symbol} <MdOpenInNew style={{marginLeft: 6}} /> </Button>
                </Link>
            </Flex>}

			{openedCollateral && (
				<Modal isOpen={isOpen} onClose={_onClose} isCentered>
					<ModalOverlay bg={"blackAlpha.800"} backdropFilter={"blur(30px)"} />
					<ModalContent
						rounded={0}
						bg={"transparent"}
						shadow={0}
						width={"400px"}
					>
						<Box
							className={`${VARIANT}-${colorMode}-containerBody2`}
						>
							<ModalHeader>{openedCollateral.name}</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<Flex gap={4}>
									<Image
										alt={openedCollateral.symbol}
										src={`/icons/${openedCollateral.symbol}.svg`}
										w="44px"
										mb={2}
									/>
									<Box mb={2}>
										<Text color={"gray.400"}>
											You are about to mint{" "}
											{openedCollateral.symbol}.
										</Text>
									</Box>
								</Flex>
							</ModalBody>

							<ModalFooter justifyContent={"center"}>
								<Box
									w={"100%"}
									className={`${VARIANT}-${colorMode}-primaryButton`}
								>
									<Button
										w={"100%"}
										isDisabled={!validate().valid}
										color={"white"}
										size={"lg"}
										bg={"transparent"}
										_hover={{ bg: "transparent" }}
										loadingText="Minting"
										isLoading={loading}
										mb={0}
										rounded={0}
										onClick={mint}
									>
										{validate().message}
									</Button>
								</Box>
							</ModalFooter>
						</Box>
					</ModalContent>
				</Modal>
			)}
		</Box>
	);
}

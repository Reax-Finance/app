import {
	Flex,
	Box,
	Image,
	useDisclosure,
	Collapse,
	IconButton,
	Heading,
	Divider,
	Text,
	useColorMode,
	Button,
	Link,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "../../styles/Home.module.css";
import { useAccount, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { TokenContext } from "../context/TokenContext";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import NavLocalLink from "./NavLocalLink";
import { Status } from "../utils/status";
import { useLendingData } from "../context/LendingDataProvider";
import { CustomConnectButton } from "./ConnectButton";
import { useDexData } from "../context/DexDataProvider";
import { tokenFormatter } from "../../src/const";
import { VARIANT } from "../../styles/theme";
import { MdOpenInNew } from "react-icons/md";

function NavBar() {
	const { status, account, fetchData } = useContext(AppDataContext);
	const { fetchData: fetchTokenData } = useContext(TokenContext);
	const { fetchData: fetchLendingData } = useLendingData();
	const { fetchData: fetchDexData, dex } = useDexData();

	const { chain, chains } = useNetwork();
	const [init, setInit] = useState(false);

	const { isOpen: isToggleOpen, onToggle } = useDisclosure();
	const [isSubscribed, setIsSubscribed] = useState(false);

	const {
		address,
		isConnected,
		isConnecting,
		connector: activeConnector,
	} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			// if(!chain) return;
			// if ((chain as any).unsupported) return;
			fetchData(address!);
			fetchLendingData(address!);
			fetchDexData(address!);
			fetchTokenData(address!);
			setInit(true);
		},
		onDisconnect() {
			console.log("onDisconnect");
			window.location.reload();
		},
	});

	useEffect(() => {
		if (activeConnector && window.ethereum && !isSubscribed) {
			(window as any).ethereum.on(
				"accountsChanged",
				function (accounts: any[]) {
					// refresh page
					window.location.reload();
				}
			);
			(window as any).ethereum.on(
				"chainChanged",
				function (chainId: any[]) {
					// refresh page
					window.location.reload();
				}
			);
			setIsSubscribed(true);
		}
		// if (localStorage.getItem("chakra-ui-color-mode") === "light") {
		// 	localStorage.setItem("chakra-ui-color-mode", "dark");
		// 	// reload
		// 	window.location.reload();
		// }
		if (
			(!(isConnected && !isConnecting) || chain?.unsupported) &&
			status !== Status.FETCHING &&
			!init
		) {
			setInit(true);
			fetchData();
			fetchLendingData();
			fetchDexData();
			fetchTokenData();
		}
	}, [
		activeConnector,
		address,
		chain?.unsupported,
		chains,
		fetchData,
		init,
		isConnected,
		isConnecting,
		isSubscribed,
		status,
	]);

	const [isOpen, setIsOpen] = React.useState(false);

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("dao-nav-link")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}
	});

	const { colorMode } = useColorMode();
	const router = useRouter();

	return (
		<>
			<Flex
				className={`${VARIANT}-${colorMode}-navBar`}
				justify={"center"}
				zIndex={0}
				mt={8}
				align="center"
			>
				<Box minW="0" w={"100%"} maxW="1250px">
					<Flex align={"center"} justify="space-between">
						<Flex justify="space-between" align={"center"} w="100%">
							<Flex gap={10} align="center">
								<Image
									src={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}-logo-${colorMode}.svg`}
									alt="reax logo"
									height="16px"
								/>
								<Flex
									align="center"
									display={{ sm: "none", md: "flex" }}
								>
									<NavLocalLink
										path={"/"}
										title="Trade"
									></NavLocalLink>

									<NavLocalLink
										path={"/synthetics"}
										title={"Synths"}
									></NavLocalLink>

									<NavLocalLink
										path={"/lend"}
										title="Markets"
									></NavLocalLink>

									<NavLocalLink
										path={"/pools"}
										title="Liquidity"
									></NavLocalLink>
								</Flex>
							</Flex>

							<Flex
								display={{ sm: "flex", md: "none" }}
								my={4}
								gap={2}
							>
								<CustomConnectButton />
								<IconButton
									onClick={onToggle}
									icon={
										isToggleOpen ? (
											<CloseIcon w={3} h={3} />
										) : (
											<HamburgerIcon w={5} h={5} />
										)
									}
									variant={"ghost"}
									aria-label={"Toggle Navigation"}
									rounded={0}
								/>
							</Flex>
						</Flex>

						<Flex
							display={{ sm: "none", md: "flex" }}
							justify="flex-end"
							align={"center"}
							// gap={2}
							w="100%"
						>
							<Flex>
								<Button
									colorScheme="orange"
									color={"white"}
									bg={"secondary.400"}
									rounded={0}
								>
									<Link
										href={
											"https://docs.google.com/forms/d/e/1FAIpQLSes7aa3khrpH_duozRG5llQRZA2V6j03mGswm3qXcMxwcKekQ/viewform"
										}
										target={"_blank"}
									>
										<Flex gap={2}>
											<Text>Give Feedback</Text>
											<MdOpenInNew />
										</Flex>
									</Link>
								</Button>
							</Flex>
							{isConnected &&
								process.env.NEXT_PUBLIC_NETWORK ==
									"testnet" && (
									<>
										<NavLocalLink
											path={"/faucet"}
											title="Faucet"
										></NavLocalLink>
									</>
								)}
							{/* <Box>
						<AccountButton />
					</Box> */}
							<Box ml={2}>
								<CustomConnectButton />
							</Box>
						</Flex>
					</Flex>
				</Box>
			</Flex>
			<Collapse in={isToggleOpen} animateOpacity>
				<MobileNav />
			</Collapse>
		</>
	);
}

const MobileNav = ({}: any) => {
	const router = useRouter();
	const { dex } = useDexData();
	return (
		<Flex flexDir={"row"} wrap={"wrap"} gap={0}>
			<NavLocalLink path={"/"} title={"Trade"}></NavLocalLink>
			<NavLocalLink path={"/synthetics"} title="Synths"></NavLocalLink>
			<NavLocalLink path={"/lend"} title="Lending"></NavLocalLink>
			<NavLocalLink path={"/pools"} title="Pools"></NavLocalLink>
			<Flex>
				<Button
					colorScheme="orange"
					color={"white"}
					bg={"secondary.400"}
					rounded={0}
				>
					<Link
						href={
							"https://docs.google.com/forms/d/e/1FAIpQLSes7aa3khrpH_duozRG5llQRZA2V6j03mGswm3qXcMxwcKekQ/viewform"
						}
						target={"_blank"}
					>
						<Flex gap={2}>
							<Text>Give Feedback</Text>
							<MdOpenInNew />
						</Flex>
					</Link>
				</Button>
			</Flex>
		</Flex>
	);
};

export default NavBar;

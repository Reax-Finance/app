import {
	Flex,
	Box,
	Image,
	useDisclosure,
	Collapse,
	IconButton,
	Text,
	useColorMode,
	Button,
	Link,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import "../../styles/Home.module.css";
import { useAccount, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import NavLocalLink from "./NavLocalLink";
import { Status } from "../utils/status";
import { CustomConnectButton } from "./ConnectButton";
import { VARIANT } from "../../styles/theme";
import { MdOpenInNew } from "react-icons/md";

function NavBar() {
	const { status, account, fetchData } = useContext(AppDataContext);

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
			fetchData(address!);
			setInit(true);
		},
		onDisconnect() {
			console.log("onDisconnect");
			// window.location.reload();
		},
	});

	useEffect(() => {
		if (activeConnector && window.ethereum && !isSubscribed) {
			(window as any).ethereum.on(
				"accountsChanged",
				function (accounts: any[]) {
					// refresh page
					// window.location.reload();
					fetchData(accounts[0]);
				}
			);
			(window as any).ethereum.on(
				"chainChanged",
				function (chainId: any[]) {
					// refresh page
					// window.location.reload();
					// fetchData(accounts[0]);
				}
			);
			setIsSubscribed(true);
		}
		if (
			(!(isConnected && !isConnecting) || chain?.unsupported) &&
			status !== Status.FETCHING &&
			!init
		) {
			setInit(true);
			fetchData();
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

	const { colorMode } = useColorMode();

	return (
		<>
			<Flex
				className={`${VARIANT}-${colorMode}-navBar`}
				justify={"center"}
				zIndex={0}
				mt={{ base: 0, md: 6 }}
				align="center"
			>
				<Box minW="0" w={"100%"} maxW="100%" mx={{base: 0, md: 6}}>
					<Flex align={"center"} justify="space-between">
						<Flex justify="space-between" align={"center"} w="100%">
							<Flex gap={10} align="center">
								<Image
									src={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}-logo-${colorMode}.svg`}
									alt="reax logo"
									height="30px"
								/>
								<Flex
									align="center"
									display={{ sm: "none", md: "flex" }}
								>
									<NavLocalLink
										path={"/"}
										title="Swap"
									></NavLocalLink>

									<NavLocalLink
										path={"/liquidity"}
										title={"Liquidity"}
									></NavLocalLink>
								</Flex>
							</Flex>

							<Flex
								display={{ sm: "flex", md: "none" }}
								my={4}
								gap={2}
							>
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
								<CustomConnectButton />

							</Flex>
						</Flex>

						<Flex
							display={{ sm: "none", md: "flex" }}
							justify="flex-end"
							align={"center"}
							gap={2}
							w="100%"
						>
							<Flex mr={2}>
								<Box
									// className={`${VARIANT}-${colorMode}-primaryButton`}
								>
									<Button
										color={"white"}
										bg={"transparent"}
										_hover={{bg: 'transparent'}}
										rounded={0}
										size={"sm"}
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
								</Box>
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
							<Box>
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
	const { colorMode } = useColorMode();
	return (
		<Flex flexDir={"row"} align={"center"} wrap={"wrap"} gap={0}>
			<NavLocalLink path={"/"} title={"Swap"}></NavLocalLink>
			<NavLocalLink
				path={"/liquidity"}
				title={"Liquidity"}
			></NavLocalLink>
			<Flex>
				<Box>
					<Button
						color={"white"}
						bg={"transparent"}
						rounded={0}
						size={"sm"}
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
				</Box>
			</Flex>
		</Flex>
	);
};

export default NavBar;

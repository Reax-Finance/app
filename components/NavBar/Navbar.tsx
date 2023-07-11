import {
	Flex,
	Box,
	Image,
	useDisclosure,
	Collapse,
	IconButton,
	Heading,
	Divider,
} from "@chakra-ui/react";
import AccountButton from '../ConnectButton'; 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "../../styles/Home.module.css";
import { useAccount, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { TokenContext } from "../context/TokenContext";
import { motion } from "framer-motion";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import NavLocalLink from "./NavLocalLink";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Status } from "../utils/status";
import { useLendingData } from "../context/LendingDataProvider";
import { CustomConnectButton } from "./ConnectButton";
import { useDexData } from "../context/DexDataProvider";

function NavBar() {
	const router = useRouter();
	const { status, account, fetchData } = useContext(AppDataContext);
	const { fetchData: fetchTokenData } = useContext(TokenContext);
	const { fetchData: fetchLendingData } = useLendingData()
	const { fetchData: fetchDexData } = useDexData();


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
		if (localStorage.getItem("chakra-ui-color-mode") === "light") {
			localStorage.setItem("chakra-ui-color-mode", "dark");
			// reload
			window.location.reload();
		}
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
	}, [activeConnector, address, chain?.unsupported, chains, fetchData, init, isConnected, isConnecting, isSubscribed, status]);


	const [isOpen, setIsOpen] = React.useState(false);

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("dao-nav-link")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}

	});

	return (
		<>
		<Flex justify={'center'} zIndex={0} mt={2} align='center' >
			<Box minW='0' w={'100%'} maxW='1250px'>
			<Flex align={"center"} justify="space-between" >
				<Flex justify="space-between" align={"center"} w='100%'>
					<Flex gap={10} align='center'>
						<Image
							// src={"/logo.svg"}
							src={"/logo-square.svg"}
							alt=""
							width="26px"
							// width={'76px'}
							mb={0.5}
						/>
						<Flex
							align="center"
							display={{ sm: "none", md: "flex" }}
							gap={2}
						>
							<NavLocalLink
								path={"/"}
								title="Trade"
							></NavLocalLink>

							<NavLocalLink
								path={"/lend"}
								title="Lend"
							></NavLocalLink>
							
							<NavLocalLink
								path={"/synthetics"}
								title={"Synthetics"}
							></NavLocalLink>
							
							<NavLocalLink
								path={"/pools"}
								title="Pools"
							></NavLocalLink>

							{/* <NavLocalLink
								path={"/perps"}
								title="Perpetuals"
							></NavLocalLink> */}
							{/* <NavLocalLink
								path={"/pools"}
								title="Pools"
							></NavLocalLink> */}
							{/* <NavLocalLink
								path={"/claim"}
								title="Claim"
							></NavLocalLink> */}
							{/* <NavLocalLink
								path={"/earn"}
								title="Earn"
							></NavLocalLink> */}
						</Flex>
					</Flex>
					
					<Flex display={{sm: 'flex', md: 'none'}}>
						<IconButton
							onClick={onToggle}
							icon={
								isOpen ? (
									<CloseIcon w={3} h={3} />
								) : (
									<HamburgerIcon w={5} h={5} />
								)
							}
							variant={"ghost"}
							aria-label={"Toggle Navigation"}
						/>
					</Flex>
				</Flex>

				<Flex	
					display={{ sm: "none", md: "flex" }}
					justify="flex-end"
					align={"center"}
					gap={2}
					w='100%'
				>
				{/* <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
					<Link href={{ pathname: "/leaderboard", query: router.query }} >
						<Flex
							align={"center"}
							h={"38px"}
							w='100%'
							px={1}
							cursor="pointer"
							rounded={100}
						>
							<Box
								color={"gray.100"}
								fontSize="sm"
							>
								<Flex align={"center"} gap={1}>
									
									<Heading size={"sm"} color={'primary.400'}>{(Number(account?.totalPoint ?? '0')).toFixed(0)}</Heading>
									<Heading size={"xs"} color={router.pathname == '/leaderboard' ? 'primary.400' : 'white'}>Points</Heading>

								</Flex>
							</Box>
						</Flex>
					</Link>
				</motion.div> */}

				{/* <NavExternalLink path={'https://synthex.finance/intro/quick-start'} title={'Docs'}></NavExternalLink> */}

				{/* <DAOMenu /> */}
					{isConnected && <NavLocalLink
								path={"/faucet"}
								title="Faucet"></NavLocalLink>}
					<Box>
						<AccountButton />
					</Box>
					{<Box>
						{/* <CustomConnectButton accountStatus="address" chainStatus="icon" showBalance={false} /> */}
						<CustomConnectButton />

					</Box>}
				</Flex>
			</Flex>
			<Divider/>
			</Box>
			<Collapse in={isToggleOpen} animateOpacity>
				<MobileNav />
			</Collapse>

		</Flex>
		</>
	);
}

const MobileNav = ({}: any) => {
	const router = useRouter();
	const { account } = useContext(AppDataContext);

	return (
		<Flex flexDir={"column"} p={4} gap={4}>
			<NavLocalLink
				path={"/"}
				title={"Dashboard"}
			></NavLocalLink>
			<NavLocalLink
				path={"/swap"}
				title="Swap"
			></NavLocalLink>
			<NavLocalLink
				path={"/claim"}
				title="Claim"
			></NavLocalLink>
			<NavLocalLink
				path={"/dao/syx"}
				title="Token"
			></NavLocalLink>

			<NavLocalLink
				path={"/dao/vest"}
				title="Vest"
			></NavLocalLink>

<motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
					<Link href={{ pathname: "/leaderboard", query: router.query }} >
						<Flex
							align={"center"}
							h={"38px"}
							w='100%'
							px={3}
							cursor="pointer"
							rounded={100}
						>
							<Box
								color={"gray.100"}
								fontSize="sm"
							>
								<Flex align={"center"} gap={2}>
									
									<Heading size={"sm"} color={router.pathname == '/leaderboard' ? 'primary.400' : 'white'}>{(Number(account?.totalPoint ?? '0')).toFixed(0)} Points</Heading>
								</Flex>
							</Box>
						</Flex>
					</Link>
				</motion.div>
			<Box>
				<ConnectButton />
			</Box>
		</Flex>
	);
};

export default NavBar;

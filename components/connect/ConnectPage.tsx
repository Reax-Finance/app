import {
	Flex,
	Text,
	Heading,
	Image,
	Box,
	Divider,
	Button,
	useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { CustomConnectButton } from "../core/ConnectButton";
import { useUserData } from "../context/UserDataProvider";
import { useSession } from "next-auth/react";
import { Status } from "../utils/status";
import { useAccount } from "wagmi";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";

export default function ConnectPage() {
	const { user, status: userStatus } = useUserData();
	const { status: sessionStatus } = useSession();
	const { address, status } = useAccount();

	const { colorMode } = useColorMode();

	return (
		<Flex
			h={"100vh"}
			py={10}
			flexDir={"column"}
			align={"center"}
			justify={"space-between"}
		>
			<Image src="/logo.svg" w={100} h={100} alt="" />
			<Flex
				flexDir={"column"}
				align={"center"}
				bg={"blackAlpha.800"}
				w={"100%"}
				py={20}
			>
				{status == "disconnected" ||
				sessionStatus == "unauthenticated" ? (
					<ConnectInterface />
				) : null}
				{status == "connected" && sessionStatus == "authenticated" ? (
					userStatus == Status.SUCCESS &&
					user?.isAllowlisted &&
					user?.id == address?.toLowerCase() ? (
						<Join />
					) : (
						<NotWhitelisted />
					)
				) : null}
				{(userStatus == Status.FETCHING ||
					status == "connecting" ||
					status == "reconnecting") && (
					<>
						<Text>Loading ;;</Text>
					</>
				)}
			</Flex>
			<Text w={"100%"} textAlign={"center"}>
				RWAs on steriods 🚀
			</Text>
		</Flex>
	);
}

function ConnectInterface() {
	return (
		<Box px={20} py={10}>
			<Heading>Welcome to REAX!</Heading>
			<Text mt={2}>Please connect your wallet to continue.</Text>

			<Box mt={6}>
				<CustomConnectButton />
			</Box>
		</Box>
	);
}

function Join() {
	const signIn = () => {
		console.log("Sign in");
	};

	const { colorMode } = useColorMode();

	return (
		<Box px={20} py={10}>
			<Heading>Welcome to REAX!</Heading>
			<Text mt={2}>Sign up to get started</Text>
			<Box className={`${VARIANT}-${colorMode}-primaryButton`} mt={8}>
				<Button
					size={"md"}
					onClick={signIn}
					type="button"
					bg={"transparent"}
					_hover={{ opacity: 0.6 }}
					w={"100%"}
				>
					Sign up
					<ChevronRightIcon />
				</Button>
			</Box>
		</Box>
	);
}

function NotWhitelisted() {
	return (
		<Box>
			<Text mt={2}>
				Sorry, You are not on the allowed list. Please try a different
				account.
			</Text>
			<Flex
				flexDir={"column"}
				p={4}
				border={"1px"}
				borderColor={"whiteAlpha.600"}
				maxW={"500px"}
				my={4}
			>
				<Heading size={"sm"} color={"primary.400"}>
					Allowlists
				</Heading>
				<Divider my={4} />
				<Box>
					<Text>
						Reax Mainnet Users (Snapshot 24 July 2024 00:00 GMT)
					</Text>
					<Text fontSize={"xs"} color={"whiteAlpha.600"}>
						You must have used Reax Protocol on Mainnet, either by
						providing liquidity or swapping tokens.
					</Text>
				</Box>
			</Flex>
		</Box>
	);
}

import {
	Flex,
	Text,
	Heading,
	Image,
	Box,
	Button,
	useColorMode,
	useToast,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";

export default function GetStarted({ setJoin }: any) {
	const signIn = () => {
		setJoin(true);
	};

	const { colorMode } = useColorMode();

	return (
		<Box px={20} py={10} zIndex={2}>
			<Heading>You are on the Allowlist!</Heading>
			<Text mt={2}>
				You are now ready to start using Reax. Click the button below to
				get started.
			</Text>
			<Box className={`${VARIANT}-${colorMode}-primaryButton`} mt={8}>
				<Button
					size={"md"}
					onClick={signIn}
					type="button"
					bg={"transparent"}
					_hover={{ opacity: 0.6 }}
					w={"100%"}
				>
					Get Started
					<ChevronRightIcon />
				</Button>
			</Box>
		</Box>
	);
}

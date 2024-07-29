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
import { useAccount } from "wagmi";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useUserData } from "../context/UserDataProvider";
import Dark600Box2C from "../ui/boxes/Dark600Box2C";
import Dark400Box2C from "../ui/boxes/Dark400Box2C";
import XConnect from "./XConnect";

export default function SignupInterface({ accessCode }: any) {
  const { address } = useAccount();
  const { colorMode } = useColorMode();
  const { updateUser } = useUserData();

  const [loading, setLoading] = React.useState(false);

	const toast = useToast();
	const signUp = () => {
		setLoading(true);
		axios
			.post("/api/user/join", { address, accessCode })
			.then((res) => {
				updateUser();
				setLoading(false);
				toast({
					title: "Success",
					description: "Successfully signed up",
					status: "success",
					duration: 9000,
					isClosable: true,
				});
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
				toast({
					title: "Error",
					description: "Failed to sign up. Please try again later",
					status: "error",
					duration: 9000,
					isClosable: true,
				});
			});
	};
	return (
		<Dark600Box2C zIndex={2}>
			<Box maxW={"600px"}>
				<Dark400Box2C p={4}>
					<Heading>
						Get started! 
					</Heading>
				</Dark400Box2C>
				<Box p={4}>
					<Text>
						You will now have exclusive access to the Reax Testnet,
						where you can earn XP and get to experience the future
						of DeFi built on top of RWAs.
					</Text>

          <Text mt={6}>
            This is a testnet, so you will not be using real money. You
            will be using test tokens to interact with the platform.
          </Text>

					{accessCode && (
						<Text mt={6}>
							You have been invited to join the Reax Testnet with
							the access code <b>{accessCode}</b>
						</Text>
					)}
		<Box mt={6}>
          <XConnect />
		</Box>

					<Box
						className={`${VARIANT}-${colorMode}-primaryButton`}
						mt={6}
					>
						<Button
							onClick={signUp}
							bg={"transparent"}
							_hover={{ opacity: 0.6 }}
							isLoading={loading}
							w={"100%"}
						>
							Sign Up
							<ChevronRightIcon />
						</Button>
					</Box>
				</Box>
			</Box>
		</Dark600Box2C>
	);
}

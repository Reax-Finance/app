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
import PrimaryButton from "../ui/buttons/PrimaryButton";
import FAQ from "./FAQ";
import TestnetFAQ from "./TestnetFAQ";

export default function SignupInterface({ accessCode }: any) {
  const { address } = useAccount();
  const { colorMode } = useColorMode();
  const { updateUser, user } = useUserData();

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
    <Flex justifyContent={"center"} gap={4}>
      <Dark600Box2C zIndex={2}>
        <Box maxW={"600px"}>
          <Dark400Box2C p={4}>
            <Heading>Get started!</Heading>
          </Dark400Box2C>
          <Box p={4}>
            <Text>
              This is your front-row seat to the future of finance! Get ready
              for an immersive experience where the worlds of TradFi and DeFi
              collide.
            </Text>

            <Text mt={6}>
              You're invited to test-drive our cutting-edge testnet, experiment
              with synthetic assets, and help us shape the next phases of Reax!
              Take a peek behind the curtain to check out how we’re redefining
              investments and trading.
            </Text>

            {accessCode && (
              <Text mt={6}>
                You have been invited to join the Reax Testnet with the access
                code <b>{accessCode}</b>
              </Text>
            )}
            <Box mt={6}>
              <XConnect />
            </Box>

            <Box mt={6}>
              <PrimaryButton
                onClick={signUp}
                isLoading={loading}
                w={"100%"}
                isDisabled={!user?.twitter}
              >
                Sign Up
                <ChevronRightIcon />
              </PrimaryButton>
            </Box>
          </Box>
        </Box>
      </Dark600Box2C>
      <TestnetFAQ />
    </Flex>
  );
}

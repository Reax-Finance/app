"use client";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect } from "react";
import { useUserData } from "../../../components/context/UserDataProvider";
import Dark400Box2C from "../../../components/ui/boxes/Dark400Box2C";
import Dark600Box2C from "../../../components/ui/boxes/Dark600Box2C";
import PrimaryButton from "../../../components/ui/buttons/PrimaryButton";
import UserAccount from "../../../components/utils/useUserAccount";
import TestnetFAQ from "../components/TestnetFAQ";
import XConnect from "../components/XConnect";
import {
  useActiveWallet,
  useActiveWalletConnectionStatus,
} from "thirdweb/react";
import { redirect, useRouter } from "next/navigation";
import { connect } from "http2";

export default function RegisterPage() {
  const { updateUser, user } = useUserData();
  const { address } = UserAccount();
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const status = useActiveWalletConnectionStatus();
  useEffect(() => {
    console.log("updateUser");
    console.log("status", status);
    updateUser();
    console.log("updated User", user);

    if (!user?.isAllowlisted) {
      router.push("/connect/whitelist");
    }
  }, [user, router]);

  const toast = useToast();
  const signUp = () => {
    setLoading(true);
    axios
      .post("/api/user/join", { address })
      .then(async (res) => {
        await updateUser();
        toast({
          title: "Success",
          description: "Successfully signed up",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "Failed to sign up. Please try again later",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        setLoading(false);
      });
  };
  return (
    <Flex
      gap={4}
      flexDir={{ base: "column", md: "row", lg: "row" }}
      justifyContent={"center"}
      alignItems={{ base: "center", md: "normal", lg: "normal" }}
      w={{ base: "95vw", md: "100%", lg: "100%" }}
    >
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

            <Text mt={{ base: 2, md: 4, lg: 6 }}>
              You{"'"}re invited to test-drive our cutting-edge testnet,
              experiment with synthetic assets, and help us shape the next
              phases of Reax! Take a peek behind the curtain to check out how we
              {"'"}re redefining investments and trading.
            </Text>

            <Box mt={{ base: 3, md: 3, lg: 6 }}>
              <XConnect />
            </Box>

            <Box mt={{ base: 3, md: 3, lg: 6 }}>
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

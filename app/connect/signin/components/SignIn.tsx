"use client";

import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { VARIANT } from "../../../../styles/theme";
import { CustomConnectButton } from "../../../../components/core/ConnectButton";
import FAQ from "./FAQ";

export default function SignInBox() {
  const { colorMode } = useColorMode();

  return (
    <Flex
      gap={4}
      flexDir={{ base: "column", md: "row", lg: "row" }}
      justifyContent={"center"}
      alignItems={{ base: "center", md: "normal", lg: "normal" }}
      w={{ base: "95vw", md: "100%", lg: "100%" }}
    >
      <Flex
        flexDir={"column"}
        className={`${VARIANT}-${colorMode}-containerBody`}
        rounded={0}
        w={{ base: "100%", md: "60%", lg: "60%" }}
      >
        <Box className={`${VARIANT}-${colorMode}-containerBody2`} px={6} py={4}>
          <Heading
            fontSize={{ base: "x-large", md: "x-large", lg: "xx-large" }}
          >
            Welcome to Reax Testnet!
          </Heading>
        </Box>
        <Flex
          flexDir={"column"}
          justify={"space-between"}
          p={6}
          pt={3}
          h={"100%"}
        >
          <Text mt={2}>
            To begin your journey, please connect your crypto wallet to access
            the Reax Testnet.
          </Text>

          <Image src={"/bg-tokens.svg"} width={"100%"} alt="" />

          <Box mt={6}>
            <CustomConnectButton />
          </Box>
        </Flex>
      </Flex>
      <FAQ />
    </Flex>
  );
}

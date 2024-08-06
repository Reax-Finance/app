import {
  Flex,
  Text,
  Heading,
  Box,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import { CustomConnectButton } from "../core/ConnectButton";
import { VARIANT } from "../../styles/theme";
import FAQ from "./FAQ";

export default function ConnectInterface() {
  const { colorMode } = useColorMode();

  return (
    <Flex gap={4}>
      <Flex
        flexDir={"column"}
        className={`${VARIANT}-${colorMode}-containerBody`}
        rounded={0}
        w={"60%"}
        // justify={'space-between'}
      >
        <Box className={`${VARIANT}-${colorMode}-containerBody2`} px={6} py={4}>
          <Heading>Testnet Alpha</Heading>
        </Box>
        <Flex
          flexDir={"column"}
          justify={"space-between"}
          p={6}
          pt={3}
          h={"100%"}
        >
          <Text mt={2}>
            Welcome to Reax! To begin your journey, please connect your crypto
            wallet
          </Text>

          <Box mt={6}>
            <CustomConnectButton />
          </Box>
        </Flex>
      </Flex>
      <FAQ />
    </Flex>
  );
}

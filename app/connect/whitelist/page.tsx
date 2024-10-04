"use client";

import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUserData } from "../../../components/context/UserDataProvider";
import Dark600Box2C from "../../../components/ui/boxes/Dark600Box2C";
import { VARIANT } from "../../../styles/theme";
import { useDisconnect } from "thirdweb/react";
import { checkUser } from "../../../components/auth/checkUser";

export default function WhitelistPage({
  setJoin,
  accessCode,
  setAccessCode,
}: any) {
  const [error, setError] = useState<string | undefined>();
  const [checkingAC, setCheckingAC] = useState(false);
  const { updateUser } = useUserData();

  const { colorMode } = useColorMode();

  const disconnectWallet = useDisconnect();

  const handleClick = () => {
    disconnectWallet.disconnect;
  };

  const consumeAndJoin = () => {
    setCheckingAC(true);
    axios
      .get(`/api/user/consume-ac?accessCode=${accessCode}`)
      .then((res) => {
        setCheckingAC(false);
        updateUser();
        setJoin(true);
      })
      .catch((err) => {
        setCheckingAC(false);
        setError("Invalid access code");
      });
  };

  const onChange = (e: any) => {
    setError(undefined);
    setAccessCode(e.target.value);
  };

  const isValidInput =
    accessCode?.length == 6 && accessCode.match(/^[0-9a-zA-Z]+$/) && !error;

  return (
    <Dark600Box2C
      p={{ base: 4, md: 6, lg: 6 }}
      zIndex={2}
      display={"flex"}
      flexDirection={"column"}
      w={{ sm: "93vw", md: "100%", lg: "100%" }}
    >
      <Heading size={"lg"} mb={{ base: 1, md: 4, lg: 4 }}>
        Not Whitelisted
      </Heading>
      <Text mt={2}>
        Uh oh! It looks like your wallet isn{"'"}t on our allowlist. This might
        be because:
      </Text>

      <Flex
        direction={"column"}
        ml={{ base: 0, md: 2, lg: 2 }}
        pt={{ base: 1, md: 4, lg: 4 }}
      >
        <Text>
          → You didn{"'"}t participate in our previous mainnet iteration, or
        </Text>
        <Text>→ You{"'"}re using a new wallet address</Text>
      </Flex>
      <Flex
        flexDir={"column"}
        p={{ base: 3, md: 4, lg: 4 }}
        border={"1px"}
        borderColor={"whiteAlpha.600"}
        maxW={"500px"}
        my={{ base: 2, md: 4, lg: 4 }}
      >
        <Heading size={"sm"} color={"primary.400"}>
          Allowlists
        </Heading>
        <Divider my={{ base: 2, md: 3, lg: 4 }} />
        <Box>
          <Text>Reax Mainnet Users (Snapshot 24 July 2024 00:00 GMT)</Text>
          <Text fontSize={"xs"} color={"whiteAlpha.600"}>
            You must have used Reax Protocol on Mainnet, either by providing
            liquidity or swapping tokens.
          </Text>
        </Box>
      </Flex>

      <Box
        mt={{ base: 2, md: 4, lg: 6 }}
        className={`${VARIANT}-${colorMode}-primaryButton`}
      >
        <Button
          onClick={handleClick}
          w={"100%"}
          bg={"transparent"}
          _hover={{ opacity: 0.6 }}
        >
          Switch Wallet
        </Button>
      </Box>

      <Flex w={"100%"} align={"center"} gap={2} my={{ base: 2, md: 4, lg: 4 }}>
        <Divider borderColor={"whiteAlpha.600"} />
        <Text>Or</Text>
        <Divider borderColor={"whiteAlpha.600"} />
      </Flex>

      <Box>
        <Heading size="md">Join with an Access Code</Heading>

        <Flex align={"center"} mt={{ base: 4, md: 4, lg: 4 }}>
          <Box className={`${VARIANT}-${colorMode}-input`} w={"100%"}>
            <Input
              placeholder="Access Code"
              borderRadius={0}
              bg={"transparent"}
              onChange={onChange}
              isInvalid={!isValidInput}
              errorBorderColor={"transparent"}
              focusBorderColor={"transparent"}
              border={"transparent"}
            ></Input>
          </Box>
          <Box
            className={
              !isValidInput
                ? `${VARIANT}-${colorMode}-rightCutInactive`
                : `${VARIANT}-${colorMode}-rightCutActive`
            }
          >
            <IconButton
              aria-label="Join"
              icon={<ChevronRightIcon />}
              rounded={0}
              isDisabled={!isValidInput}
              bg={"transparent"}
              _hover={{ bg: "transparent" }}
              onClick={consumeAndJoin}
              isLoading={checkingAC}
            />
          </Box>
        </Flex>

        {error && (
          <Text color="red.400" fontSize={"sm"} mt={3} mb={-2}>
            {error}
          </Text>
        )}
      </Box>
    </Dark600Box2C>
  );
}

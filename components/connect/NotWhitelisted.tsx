import {
  Flex,
  Text,
  Heading,
  Image,
  Box,
  Divider,
  Button,
  useColorMode,
  Input,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import { CustomConnectButton } from "../core/ConnectButton";
import { useUserData } from "../context/UserDataProvider";
import { useSession } from "next-auth/react";
import { Status } from "../utils/status";
import { useAccount } from "wagmi";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { BsDiscord } from "react-icons/bs";
import AccessCode from "../ui/access-code/AccessCode";
import { table } from "console";
import { useRouter } from "next/router";

export default function NotWhitelisted({
  setJoin,
  accessCode,
  setAccessCode,
}: any) {
  const { openAccountModal } = useAccountModal();
  const { colorMode } = useColorMode();
  const [error, setError] = React.useState<String | undefined>();

  const validateAndJoin = () => {
    // validate
    axios
      .get(`/api/user/validate-ac?accessCode=${accessCode}`)
      .then((res) => {
        setJoin(true);
      })
      .catch((err) => {
        setError("Invalid access code");
      });
  };

  const onChange = (e: any) => {
    setError(undefined);
    setAccessCode(e.target.value);
  };

  const isValidInput =
    accessCode.length == 6 && accessCode.match(/^[0-9a-zA-Z]+$/) && !error;

  return (
    <Box zIndex={2} display={"flex"} flexDirection={"column"}>
      <Text mt={2}>
        Uh oh! It looks like your wallet isn{"'"}t on our allowlist. This might
        be because:
      </Text>

      <Flex direction={"column"} ml={2} pt={4}>
        <Text>
          → You didn{"'"}t participate in our previous mainnet iteration, or
        </Text>
        <Text>→ You{"'"}re using a new wallet address</Text>
      </Flex>
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
          <Text>Reax Mainnet Users (Snapshot 24 July 2024 00:00 GMT)</Text>
          <Text fontSize={"xs"} color={"whiteAlpha.600"}>
            You must have used Reax Protocol on Mainnet, either by providing
            liquidity or swapping tokens.
          </Text>
        </Box>
      </Flex>

      <Box mt={6} className={`${VARIANT}-${colorMode}-primaryButton`}>
        <Button
          onClick={openAccountModal}
          w={"100%"}
          bg={"transparent"}
          _hover={{ opacity: 0.6 }}
        >
          Switch Wallet
        </Button>
      </Box>

      <Flex w={"100%"} align={"center"} gap={2} my={4}>
        <Divider borderColor={"whiteAlpha.600"} />
        <Text>Or</Text>
        <Divider borderColor={"whiteAlpha.600"} />
      </Flex>

      <Box>
        <Heading size="md">Join with an Access Code</Heading>

        <Flex align={"center"} mt={4}>
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
              onClick={validateAndJoin}
            />
          </Box>
        </Flex>

        {error && (
          <Text color="red.400" fontSize={"sm"} mt={2}>
            {error}
          </Text>
        )}
      </Box>
    </Box>
  );
}

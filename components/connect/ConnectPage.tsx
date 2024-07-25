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
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

export default function ConnectPage() {
  const { user, status: userStatus } = useUserData();
  const { status: sessionStatus } = useSession();
  const { address, status } = useAccount();
  const { colorMode } = useColorMode();

  console.log("user", user);
  console.log("userStatus", userStatus);
  console.log("session Status", sessionStatus);
  console.log("Status", status);
  console.log("address", address);

  return (
    <Box h={"100vh"}>
      <Flex
        justify={"center"}
        zIndex={0}
        position={"absolute"}
        w={"100%"}
        h={"100%"}
      >
        <Box
          bgImage={"/background-1.svg"}
          bgRepeat={"no-repeat"}
          bgSize={"cover"}
          w={"100%"}
          h={"100%"}
          position={"absolute"}
          bgPos={"top"}
          top={0}
          zIndex={-10}
        />
        <Box
          bgImage={"/background-2.svg"}
          bgRepeat={"no-repeat"}
          bgSize={"cover"}
          w={"100%"}
          h={"100%"}
          opacity={0.5}
          position={"relative"}
          bgPos={"top"}
          zIndex={-8}
        />
        <Box
          bgGradient={`linear(to-t, ${
            colorMode == "dark" ? "black" : "white"
          }Alpha.600, ${colorMode == "dark" ? "black" : "white"}Alpha.900)`}
          bgSize={"cover"}
          w={"100%"}
          h={"100%"}
          position={"absolute"}
          top={0}
          zIndex={-9}
        />
      </Flex>
      <Flex
        py={10}
        flexDir={"column"}
        align={"center"}
        justify={"space-between"}
      >
        <Image src="/logo.svg" w={100} h={100} alt="" zIndex={2} />
        <Box display={"flex"} alignItems={"center"} w={"100%"} px={20}>
          <Flex flexDir={"column"} align={"center"} w={"100%"} py={20}>
            {status == "disconnected" || sessionStatus == "unauthenticated" ? (
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
                <Text zIndex={2}>Loading...</Text>
              </>
            )}
          </Flex>
          <FAQ />
        </Box>
        <Text w={"100%"} textAlign={"center"} zIndex={2}>
          RWAs on steriods 🚀
        </Text>
      </Flex>
    </Box>
  );
}

function ConnectInterface() {
  const { colorMode } = useColorMode();

  return (
    <Box
      px={20}
      py={10}
      className={`${VARIANT}-${colorMode}-containerBody`}
      rounded={0}
      zIndex={2}
    >
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
    <Box px={20} py={10} zIndex={2}>
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
    <Box zIndex={2}>
      <Text mt={2}>
        Sorry, You are not on the allowed list. Please try a different account.
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
          <Text>Reax Mainnet Users (Snapshot 24 July 2024 00:00 GMT)</Text>
          <Text fontSize={"xs"} color={"whiteAlpha.600"}>
            You must have used Reax Protocol on Mainnet, either by providing
            liquidity or swapping tokens.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

function FAQ() {
  const { colorMode } = useColorMode();
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      gap={10}
      px={20}
      py={10}
      className={`${VARIANT}-${colorMode}-containerBody`}
      rounded={0}
      w={"100%"}
      zIndex={2}
    >
      <Accordion allowToggle w={"100%"}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                What{"'"}s a wallet?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Think of it like a digital bank account for your crypto assets. It
            {"'"}s where you{"'"}ll securely store your digital keys and assets
            to interact with our platform. Your wallet will be essential for
            managing your investments.
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Don{"'"}t have a wallet?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            No worries! Creating a wallet is quick and easy. We recommend
            popular options listed to the left, for their security and ease of
            use.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                How to connect:
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction={"column"}>
              Now that you{"'"}ve created a wallet, follow these steps to get
              started on Reax!
              <Flex direction={"column"} ml={6} w={"100%"}>
                <Text>
                  {" "}
                  1. Choose your wallet: Select your preferred wallet from the
                  options provided.
                </Text>

                <Text>
                  2. Follow the prompts: Your wallet will guide you through a
                  few simple steps to connect with Reax.
                </Text>
                <Text>
                  3. Dive in: Once connected, you{"'"}ll be ready to explore all
                  the exciting functionalities on our platform.
                </Text>
              </Flex>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

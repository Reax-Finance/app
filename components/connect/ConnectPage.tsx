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
import { useAccountModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { BsDiscord } from "react-icons/bs";

export default function ConnectPage() {
  const { user, status: userStatus } = useUserData();
  const { status: sessionStatus } = useSession();
  const { address, status } = useAccount();
  const { colorMode } = useColorMode();

  const [join, setJoin] = React.useState(false);
  const [accessCode, setAccessCode] = React.useState("");

  //   console.log("user", user);
  //   console.log("userStatus", userStatus);
  //   console.log("session Status", sessionStatus);
  //   console.log("Status", status);
  //   console.log("address", address);

  console.log("join", join);

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
            {join ? (
              <SignupInterface accessCode={accessCode} />
            ) : (
              <>
                {status == "disconnected" ||
                sessionStatus == "unauthenticated" ? (
                  <ConnectInterface />
                ) : null}
                {status == "connected" && sessionStatus == "authenticated" ? (
                  userStatus == Status.SUCCESS &&
                  user?.isAllowlisted &&
                  user?.id == address?.toLowerCase() ? (
                    <GetStarted setJoin={setJoin} />
                  ) : (
                    <NotWhitelisted
                      setJoin={setJoin}
                      accessCode={accessCode}
                      setAccessCode={setAccessCode}
                    />
                  )
                ) : null}
                {(userStatus == Status.FETCHING ||
                  status == "connecting" ||
                  status == "reconnecting") && (
                  <>
                    <Text zIndex={2}>Loading...</Text>
                  </>
                )}
              </>
            )}
          </Flex>
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
    <Flex gap={4}>
      <Box
        className={`${VARIANT}-${colorMode}-containerBody`}
        rounded={0}
        zIndex={2}
        w={"60%"}
      >
        <Box className={`${VARIANT}-${colorMode}-containerBody2`} p={6} pb={3}>
          <Heading>Welcome to REAX!</Heading>
        </Box>
        <Box p={6} pt={3}>
          <Text mt={2}>
            To begin your journey, please connect your crypto wallet
          </Text>

          <Box mt={6}>
            <CustomConnectButton />
          </Box>
        </Box>
      </Box>
      <FAQ />
    </Flex>
  );
}

function SignupInterface({ accessCode }: any) {
  const { address } = useAccount();
  const { colorMode } = useColorMode();

  const [loading, setLoading] = React.useState(false);

  const toast = useToast();

  const signUp = () => {
    setLoading(true);
    axios
      .post("/api/user/join", { address, accessCode })
      .then((res) => {
        setLoading(false);
        console.log(res);
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
    <Box zIndex={2}>
      <Heading>Sign up</Heading>
      <Box className={`${VARIANT}-${colorMode}-primaryButton`} mt={8}>
        <Button
          onClick={signUp}
          bg={"transparent"}
          _hover={{ opacity: 0.6 }}
          isLoading={loading}
          w={"100%"}
        >
          Sign Up
        </Button>
      </Box>
    </Box>
  );
}

function GetStarted({ setJoin }: any) {
  const signIn = () => {
    setJoin(true);
  };

  const { colorMode } = useColorMode();

  return (
    <Box px={20} py={10} zIndex={2}>
      <Heading>You are on the Allowlist!</Heading>
      <Text mt={2}>
        You are now ready to start using Reax. Click the button below to get
        started.
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
          Get started
          <ChevronRightIcon />
        </Button>
      </Box>
    </Box>
  );
}

function NotWhitelisted({ setJoin, accessCode, setAccessCode }: any) {
  const { openAccountModal } = useAccountModal();
  const { colorMode } = useColorMode();
  const [error, setError] = React.useState<String | undefined>();

  const validateAndJoin = () => {
    // validate
    axios
      .get("/api/user/validate-ac")
      .then((res) => {
        // set join as true
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
    accessCode.length == 7 && accessCode.match(/^[0-9a-zA-Z]+$/) && !error;

  return (
    <Box zIndex={2} display={"flex"} flexDirection={"column"}>
      <Text mt={2}>
        Uh oh! It looks like your wallet isn't on our allowlist. This might be
        because:
      </Text>

      <Flex direction={"column"} ml={2} pt={4}>
        <Text>
          → You didn't participate in our previous mainnet iteration, or
        </Text>
        <Text>→ You're using a new wallet address</Text>
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
          <Input
            placeholder="Access Code"
            borderRadius={0}
            w={"100%"}
            bg={"whiteAlpha.200"}
            onChange={onChange}
            isInvalid={!isValidInput}
          ></Input>
          <IconButton
            aria-label="Join"
            icon={<ChevronRightIcon />}
            rounded={0}
            isDisabled={!isValidInput}
            bg={"secondary.400"}
            _hover={{ opacity: 0.6 }}
            onClick={validateAndJoin}
          />
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

function FAQ() {
  const { colorMode } = useColorMode();
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      gap={10}
      px={6}
      py={6}
      className={`${VARIANT}-${colorMode}-containerBody`}
      rounded={0}
      //   w={"100%"}
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
      <Box>
        <Text>
          Need Help? If you're having any issues, our support team is ready to
          assist you.
        </Text>
        <Button
          mt={4}
          display={"flex"}
          gap={2}
          bg={"#515BE7"}
          _hover={{ opacity: 0.8 }}
        >
          <BsDiscord fill="white" /> Discord
        </Button>
      </Box>
    </Box>
  );
}

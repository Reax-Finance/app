import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Image,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import React from "react";
import { useAccount } from "wagmi";
import { VARIANT } from "../../styles/theme";
import { useUserData } from "../context/UserDataProvider";
import { CustomConnectButton } from "../core/ConnectButton";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

export default function Connect2() {
  const { user, status: userStatus } = useUserData();
  const { status: sessionStatus } = useSession();
  const { address, status } = useAccount();

  const { colorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef(null);

  const signIn = () => {
    console.log("Sign in");
  };

  return (
    <>
      <Flex
        h={"100vh"}
        py={10}
        flexDir={"column"}
        align={"center"}
        justify={"space-between"}
        bg={"blackAlpha.900"}
        w={"100%"}
      >
        <Image src="/logo.svg" w={100} h={100} alt="" />
        <Flex h={"100%"} alignItems={"center"} w={"75%"} gap={4}>
          <Flex
            flexDir={"column"}
            align={"center"}
            bg={"blackAlpha.800"}
            w={"100%"}
            py={20}
          >
            {
              <>
                <Box
                  px={20}
                  py={10}
                  className={`${VARIANT}-${colorMode}-containerBody`}
                  rounded={0}
                >
                  <Heading>Welcome to REAX!</Heading>

                  {status != "connected" || sessionStatus != "authenticated" ? (
                    <Flex direction={"column"} gap={4}>
                      <Text mt={2}>The future of finance starts here.</Text>

                      <Button>Let{"'"}s Go</Button>
                    </Flex>
                  ) : user ? (
                    <Box>
                      <Text mt={2}>Sign up to get started</Text>
                      <Box
                        className={`${VARIANT}-${colorMode}-primaryButton`}
                        mt={8}
                      >
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
                  ) : (
                    <Box>
                      {" "}
                      <Flex direction={"column"}>
                        <Text mt={2} fontWeight={"500"}>
                          Uh oh! It looks like your wallet isn't on our
                          allowlist. This might be because:
                        </Text>
                        <Flex direction={"column"}>
                          <Text fontWeight={300}>
                            → You didn't participate in our previous mainnet
                            iteration, or
                          </Text>
                          <Text>→ You're using a new wallet address</Text>
                        </Flex>
                        <Text mt={2} fontWeight={"500"}>
                          Don't worry! You can:
                        </Text>
                        <Flex direction={"column"}>
                          <Text>
                            → Try another wallet with an address that qualifies,
                            or
                          </Text>
                          <Text>
                            → Apply for our public allowlist and we'll notify
                            you when you're in
                          </Text>
                        </Flex>
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
                          <Text>
                            Reax Mainnet Users (Snapshot 24 July 2024 00:00 GMT)
                          </Text>
                          <Text fontSize={"xs"} color={"whiteAlpha.600"}>
                            You must have used Reax Protocol on Mainnet, either
                            by providing liquidity or swapping tokens.
                          </Text>
                        </Box>
                      </Flex>
                      <Flex justifyContent={"space-between"}>
                        <Button>Try another Wallet</Button>
                        <Button>Join the waitlist</Button>
                      </Flex>
                    </Box>
                  )}
                  <Box mt={6} display={"flex"} gap={"5"}>
                    <CustomConnectButton />
                  </Box>
                </Box>
              </>
            }
          </Flex>
          <Flex
            direction="column"
            gap={10}
            px={20}
            py={10}
            className={`${VARIANT}-${colorMode}-containerBody`}
            rounded={0}
            w={"100%"}
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
                  Think of it like a digital bank account for your crypto
                  assets. It
                  {"'"}s where you{"'"}ll securely store your digital keys and
                  assets to interact with our platform. Your wallet will be
                  essential for managing your investments.
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
                  popular options listed to the left, for their security and
                  ease of use.
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
                    Now that you{"'"}ve created a wallet, follow these steps to
                    get started on Reax!
                    <Flex direction={"column"} ml={6} w={"100%"}>
                      <Text>
                        {" "}
                        1. Choose your wallet: Select your preferred wallet from
                        the options provided.
                      </Text>

                      <Text>
                        2. Follow the prompts: Your wallet will guide you
                        through a few simple steps to connect with Reax.
                      </Text>
                      <Text>
                        3. Dive in: Once connected, you{"'"}ll be ready to
                        explore all the exciting functionalities on our
                        platform.
                      </Text>
                    </Flex>
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Flex>
        </Flex>

        <Text w={"100%"} textAlign={"center"}>
          RWAs on steriods 🚀
        </Text>
      </Flex>
    </>
  );
}

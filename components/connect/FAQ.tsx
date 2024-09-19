import React from "react";
import {
  Flex,
  Text,
  Heading,
  Box,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import { CustomConnectButton } from "../core/ConnectButton";
import { VARIANT } from "../../styles/theme";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { BsDiscord } from "react-icons/bs";
import { useRouter } from "next/router";

export default function FAQ() {
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      gap={10}
      px={6}
      py={{ base: 4, md: 8, lg: 10 }}
      className={`${VARIANT}-${colorMode}-containerBody`}
      rounded={0}
      //   w={"100%"}
      // zIndex={-2}
    >
      <Accordion allowToggle w={"100%"} maxW={"600px"} defaultIndex={[2]}>
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
                How to connect?
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
      <Box mt={-4}>
        <Text>
          Need Help? If you{"'"}re having any issues, our support team is ready
          to assist you.
        </Text>
        <Box className={`${VARIANT}-${colorMode}-discordButton`} mt={4}>
          <Button
            size={"md"}
            type="button"
            bg={"transparent"}
            _hover={{ opacity: 0.6 }}
            w={"100%"}
            leftIcon={<BsDiscord fill="white" />}
            onClick={() => window.open("https://discord.gg/4b4SKTsh", "_blank")}
          >
            Join Discord
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

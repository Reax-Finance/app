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

export default function TestnetFAQ() {
  const { colorMode } = useColorMode();
  const router = useRouter();

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
      <Accordion allowToggle w={"100%"} maxW={"600px"} defaultIndex={[2]}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                What is a testnet?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Think of it like a final rehearsal for a big show. It&apos;s a safe
            space where we can fine-tune our platform, try out new ideas, and
            gather valuable feedback from users like you – all before the
            official launch.
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Testnet Token System:
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction={"column"} ml={6} w={"100%"}>
              <li>
                As you experiment and provide feedback, you&apos;ll earn
                experience points in the form of exclusive testnet tokens. Think
                of it as leveling up in a game!
              </li>

              <li>
                Psst… These points not only track your progress but also open up
                new features and opportunities within the testnet. Keep
                tinkering with our platform and try to stay on top of the
                leaderboard! May the odds be ever in your favor, tradoor.
              </li>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Sybil Verification:
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction={"column"}>
              To ensure a fair and secure experience for everyone, we&apos;re
              asking you to quickly verify your identity via X (formerly
              Twitter).
              <Flex direction={"column"} ml={6} w={"100%"} mt={2}>
                <li>
                  {" "}
                  Your account must have at least 10 followers and 3 months of
                  activity.
                </li>

                <li>
                  This helps us prevent bots and make sure real people are
                  testing our platform. We appreciate your understanding!
                </li>
              </Flex>
              <Text
                fontSize={"lg"}
                mt={2}
                fontStyle={"italic"}
                fontWeight={"bold"}
              >
                See you on the inside!
              </Text>
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
          >
            Join Discord
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

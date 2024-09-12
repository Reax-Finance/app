"use client";

import { Box, Button, Flex, Text, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";
import { useContext } from "react";
import {
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
} from "thirdweb/react";
import { AppDataContext } from "../components/context/AppDataProvider";
import Footer from "../components/core/Footer";
import Navbar from "../components/core/Navbar";
import SwapPage from "../components/page/SwapPage";
import { Status } from "../components/utils/status";
import { isSupportedChain } from "../src/const";

export default function ComponentLayout({ children }: any) {
  const { status, message } = useContext(AppDataContext);

  const connectionStatus = useActiveWalletConnectionStatus();
  const isConnected = connectionStatus == "connected" ? true : false;

  const chain = useActiveWalletChain();
  // const [hydrated, setHydrated] = useState(false);
  // useEffect(() => {
  //   if (!hydrated) {
  //     setHydrated(true);
  //   }
  // }, [hydrated]);

  // if (!hydrated) {
  //   return <></>;
  // }
  const { colorMode } = useColorMode();
  return (
    <Box h={"100vh"}>
      {/* Wrong Chain */}
      {isConnected && !isSupportedChain(chain?.id || 0) && (
        <Flex
          align={"center"}
          justify={"center"}
          bgColor="primary.400"
          color={"white"}
          h={8}
        >
          <Text
            textAlign={"center"}
            fontSize={"sm"}
            fontWeight="medium"
            color={"black"}
          >
            Network not supported
          </Text>
          <Button
            ml={2}
            size="xs"
            bg={"white"}
            _hover={{ bg: "whiteAlpha.800" }}
            color={"black"}
            rounded={"full"}
            // onClick={openChainModal}
          >
            Switch Chain
          </Button>
        </Flex>
      )}
      {/* {status == Status.FETCHING && (
        <Progress
          bg={"blackAlpha.200"}
          colorScheme="primary"
          size="xs"
          isIndeterminate
        />
      )} */}
      {/* Error */}
      <Box bgColor="gray.800" color={"gray.400"}>
        {status == Status.ERROR && (
          <Text
            textAlign={"center"}
            width="100%"
            fontSize={"sm"}
            fontWeight="bold"
            p={2}
          >
            {message}
          </Text>
        )}
      </Box>

      {/* BG */}
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
        flexDir={"column"}
        justify={"space-between"}
        h={"100%"}
        px={{ sm: "4", md: "6" }}
      >
        <Flex flexDir={"column"} zIndex={2}>
          <Navbar />
        </Flex>
        <Box zIndex={2} w={"100%"}>
          <Flex justify={"center"}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
            >
              <SwapPage />
            </motion.div>
          </Flex>
        </Box>
        <Box>
          <Footer />
        </Box>
      </Flex>
    </Box>
  );
}

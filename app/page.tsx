"use client";

import {
  Box,
  Button,
  Flex,
  Progress,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useContext } from "react";
import {
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { AppDataContext } from "../components/context/AppDataProvider";
import Footer from "../components/core/Footer";
import Navbar from "../components/core/Navbar";
import { Status } from "../components/utils/status";
import { isSupportedChain } from "../src/const";
import { redirect, useRouter } from "next/navigation";

export default function Index({ children }: any) {
  // useEffect(() => {
  // 	const handleStart = (url: any) => {
  // 		setLoading(true);
  // 		setRefresh(Math.random());
  // 	};
  // 	const handleComplete = (url: any) => {
  // 		setLoading(false);
  // 		setRefresh(Math.random());
  // 	};

  // 	router.events.on("routeChangeStart", handleStart);
  // 	router.events.on("routeChangeComplete", handleComplete);
  // 	router.events.on("routeChangeError", handleComplete);

  // 	return () => {
  // 		router.events.off("routeChangeStart", handleStart);
  // 		router.events.off("routeChangeComplete", handleComplete);
  // 		router.events.off("routeChangeError", handleComplete);yarn
  // 	};
  // }, [loading, refresh]);

  const { status, message } = useContext(AppDataContext);

  const connectionStatus = useActiveWalletConnectionStatus();
  const isConnected = connectionStatus == "connected" ? true : false;

  const chain = useActiveWalletChain();

  // const { switchChain } = useSwitchChain();

  // const switchChain = useSwitchActiveWalletChain();

  // const switchNetwork = async (chainId: number) => {
  //   switchChain!({ chainId: chainId });
  // };

  // const switchNetwork = (chainId: number, chain: string) => {
  //   switchChain({
  //     id: chainId,
  //     rpc: chain,
  //   });
  // };

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
  const router = useRouter();
  if (!isConnected) {
    redirect("/connect");
  }
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
              <>{children}</>
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

import {
  Flex,
  Text,
  Image,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import { useUserData } from "../context/UserDataProvider";
import { useSession } from "next-auth/react";
import { Status } from "../utils/status";
import { useAccount } from "wagmi";
import NotWhitelisted from "./NotWhitelisted";
import ConnectInterface from "./ConnectInterface";
import SignupInterface from "./SignupInterface";
import GetStarted from "./GetStarted";

export default function ConnectPage() {
  const { user, status: userStatus } = useUserData();
  const { status: sessionStatus } = useSession();
  const { address, status } = useAccount();
  const { colorMode } = useColorMode();

  const [join, setJoin] = React.useState(false);
  const [accessCode, setAccessCode] = React.useState("");

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
        <Box display={"flex"} alignItems={"center"} w={"100%"} px={20} maxW={'1350px'}>
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
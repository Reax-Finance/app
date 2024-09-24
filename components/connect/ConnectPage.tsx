"use client";

import { Box, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import React from "react";
import { useUserData } from "../context/UserDataProvider";
// import { useSession } from "next-auth/react";
import { Status } from "../utils/status";
import UserAccount from "../utils/useUserAccount";
import ConnectInterface from "./ConnectInterface";
import GetStarted from "./GetStarted";
import NotWhitelisted from "./NotWhitelisted";
import SignupInterface from "./SignupInterface";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
export default function ConnectPage() {
  const { user, status: userStatus } = useUserData();
  const status = useActiveWalletConnectionStatus();
  const { address } = UserAccount();
  const [join, setJoin] = React.useState(false);
  const [accessCode, setAccessCode] = React.useState("");
  return (
    <Box h={"100vh"}>
      <Flex
        py={10}
        flexDir={"column"}
        align={"center"}
        justify={"space-between"}
      >
        <Image src="/logo.svg" w={100} h={100} alt="" zIndex={2} />
        <Box
          display={"flex"}
          alignItems={"center"}
          w={"100%"}
          px={20}
          maxW={"1350px"}
        >
          <Flex flexDir={"column"} align={"center"} w={"100%"} py={20}>
            {join ? (
              <SignupInterface accessCode={accessCode} />
            ) : (
              <>
                {status == "disconnected" ? <ConnectInterface /> : null}
                {status == "connected" ? (
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
                {/* {(userStatus == Status.FETCHING || status == "connecting") && (
                  <>
                    <Spinner />
                    <Text zIndex={2} ml={2}>
                      Loading...
                    </Text>
                  </>
                )} */}
              </>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

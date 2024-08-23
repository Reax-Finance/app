import {
  Flex,
  Text,
  Image,
  Box,
  useColorMode,
  Spinner,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Status } from "../components/utils/status";
import { useAccount } from "wagmi";
import NotWhitelisted from "../components/connect/NotWhitelisted";
import ConnectInterface from "../components/connect/ConnectInterface";
import SignupInterface from "../components/connect/SignupInterface";
import GetStarted from "../components/connect/GetStarted";
import { useUserData } from "../components/context/UserDataProvider";
import { useRouter } from "next/router";

export default function ConnectPage() {
  const { user, status: userStatus } = useUserData();
  const { status: sessionStatus } = useSession();
  const { address, status } = useAccount();
  const { colorMode } = useColorMode();

  const [join, setJoin] = React.useState(false);
  const [accessCode, setAccessCode] = React.useState("");

  const router = useRouter();

  useEffect(() => {
    if (userStatus === Status.SUCCESS && user?.user && user.twitter) {
      router.push("/");
    }
  }, [router, userStatus, user]);

  console.log("user", userStatus);
  console.log("status", status);

  return (
    <Box h={"100vh"}>
      <Flex
        py={{ base: 0, md: 8, lg: 10 }}
        flexDir={"column"}
        align={"center"}
        justify={"space-between"}
      >
        <Image src="/logo.svg" w={100} h={100} alt="" zIndex={2} />
        <Box
          display={"flex"}
          alignItems={"center"}
          w={"100%"}
          px={{ base: 4, md: 8, lg: 10 }}
          maxW={"1350px"}
        >
          <Flex
            flexDir={"column"}
            align={"center"}
            w={"100%"}
            py={{ base: 0, md: 12, lg: 20 }}
          >
            {join ? (
              <SignupInterface accessCode={accessCode} />
            ) : (
              <>
                {status === "disconnected" ||
                sessionStatus === "unauthenticated" ? (
                  <ConnectInterface />
                ) : (
                  <>
                    {status === "connected" &&
                    sessionStatus === "authenticated" &&
                    userStatus === Status.SUCCESS ? (
                      user?.isAllowlisted &&
                      user?.id === address?.toLowerCase() ? (
                        <GetStarted setJoin={setJoin} />
                      ) : (
                        <NotWhitelisted
                          setJoin={setJoin}
                          accessCode={accessCode}
                          setAccessCode={setAccessCode}
                        />
                      )
                    ) : (
                      <Spinner />
                    )}
                  </>
                )}

                {/* {(status === "connecting" || status === "reconnecting") &&
                  userStatus === Status.FETCHING && <Spinner />} */}
              </>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

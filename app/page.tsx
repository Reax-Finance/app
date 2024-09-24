"use client";

import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import OnlyAuthenticated from "../components/auth/OnlyAuthenticated";
import Swap from "../components/swap/index";

import { useEffect } from "react";
import { useUserData } from "../components/context/UserDataProvider";
import ConnectPage from "../components/connect/ConnectPage";

export default function SwapPage() {
  const { user } = useUserData();
  // const { status: sessionStatus } = useSession();
  useEffect(() => {
    if (
      !user ||
      !user.user ||
      !user.twitter
      // sessionStatus !== "authenticated"
    ) {
      window.location.href = "/connect";
    }
  }, []);

  if (
    !user ||
    !user.user ||
    !user.twitter
    // sessionStatus !== "authenticated"
  ) {
    return <ConnectPage />;
  } else {
    return (
      <Box>
        <OnlyAuthenticated />
        <Flex justify={"center"} align="center">
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.45 }}
            >
              <Box
                animation={"fadeIn 0.5s ease-in-out"}
                boxShadow={"xl"}
                minW={{ base: "100%", md: "500px" }}
              >
                <Swap />
              </Box>
            </motion.div>
          </Box>
        </Flex>
      </Box>
    );
  }
}

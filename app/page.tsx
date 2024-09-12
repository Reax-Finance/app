"use client";

import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import OnlyAuthenticated from "../components/auth/OnlyAuthenticated";
import Swap from "../components/swap/index";
import { checkUser } from "../components/auth/checkUser";
import { useEffect } from "react";

export default function SwapPage() {
  useEffect(() => {
    checkUser();
  }, []);

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

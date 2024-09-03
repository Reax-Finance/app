import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import Swap from "../swap/index";
import OnlyAuthenticated from "../auth/OnlyAuthenticated";

export default function SwapPage() {
  return (
    <Box>
      <OnlyAuthenticated>
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
      </OnlyAuthenticated>
    </Box>
  );
}

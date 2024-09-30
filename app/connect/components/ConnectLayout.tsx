"use client";
import { Box, Flex, Image } from "@chakra-ui/react";

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
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
            {children}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

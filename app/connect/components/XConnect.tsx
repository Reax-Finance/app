import React from "react";
import XConnectButton from "./XConnectButton";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Dark400Box2C from "../../../components/ui/boxes/Dark400Box2C";
import { useUserData } from "../../../components/context/UserDataProvider";

export default function XConnect() {
  const { user } = useUserData();
  return (
    <Dark400Box2C
      flexDir={{ base: "column", md: "row", lg: "row" }}
      align={{ base: "start", md: "center", lg: "center" }}
      w={"100%"}
      p={4}
      px={4}
      justify={"space-between"}
      gap={4}
    >
      {!user?.twitter && (
        <Box>
          <Heading size={"md"}>Sybil Verification</Heading>
          <Text fontSize={"sm"} color={"whiteAlpha.600"} mt={1}>
            Must have 10 followers and 3 months of activity on X
          </Text>
        </Box>
      )}
      <XConnectButton />
    </Dark400Box2C>
  );
}

import React from "react";
import DiscordConnect from "../../connect/DiscordConnect";
import Dark600Box2C from "../../ui/boxes/Dark600Box2C";
import Dark400Box2C from "../../ui/boxes/Dark400Box2C";
import { Box, Flex, Heading, Text, useColorMode } from "@chakra-ui/react";
import { BsCheck } from "react-icons/bs";
import { VARIANT } from "../../../styles/theme";

const DiscordConnectQuest = () => {
  const [isCompleted, setCompleted] = React.useState(false);
  const { colorMode } = useColorMode();
  return (
    <Dark600Box2C flexDir={"column"} justify={"space-between"} flex={1}>
      <>
        <Dark400Box2C justify={"space-between"} p={4} flexDir={"row"} gap={10}>
          <Box>
            <Heading size={"md"}>Discord Drop</Heading>
            <Text color={"whiteAlpha.600"} mt={1}>
              Join our community on Discord and instantly unlock 100XP!
            </Text>
          </Box>
          {isCompleted ? (
            <Flex color={"green.400"} align={"center"}>
              <BsCheck size={"24px"} />
              <Text>Completed</Text>
            </Flex>
          ) : (
            <Flex gap={2} align={"center"}>
              <Heading fontSize={"lg"} color={"secondary.400"}>
                +100
              </Heading>
              <Text color={"secondary.400"} mt={0.5}>
                XP
              </Text>
            </Flex>
          )}
        </Dark400Box2C>
        {isCompleted ? (
          <Flex mt={4} p={4} pt={2} gap={2} align={"center"}>
            <Text>Quest Completed:</Text>
            <Heading color={"primary.400"} size={"md"}>
              JOINED!
            </Heading>
          </Flex>
        ) : (
          <Flex align={"center"} mt={4} p={4} pt={2}>
            <Box className={`${VARIANT}-${colorMode}-input`} w={"100%"}>
              <DiscordConnect />
            </Box>
          </Flex>
        )}
      </>
    </Dark600Box2C>
  );
};

export default DiscordConnectQuest;

import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import AccessCode from "../ui/access-code/AccessCode";
import "swiper/swiper.min.css";
import Dark600Box2C from "../ui/boxes/Dark600Box2C";
import { tokenFormatter } from "../../src/const";
import { useUserData } from "../context/UserDataProvider";
import { FaXTwitter } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";
import { VARIANT } from "../../styles/theme";
import ShareTweetPill from "../ui/boxes/pills/ShareTweetPill";

export default function AccessCodes() {
  const { colorMode } = useColorMode();
  const { user } = useUserData();
  return (
    <div>
      <Dark600Box2C p={4} mt={4}>
        <Flex align={"start"} justify={"space-between"}>
          <Box maxW={"80%"}>
            <Heading size={"md"}>Access Codes</Heading>
            <Text
              color={"whiteAlpha.600"}
              mt={2}
              fontSize={"sm"}
              pr={{ sm: 2 }}
            >
              Use these access codes to invite your frens to try out the app.
              You earn 50 XP for each user that signs up using your access code
              and they earn 50 XP too.
            </Text>
          </Box>
          <Flex flexDir={{ base: "column-reverse", md: "row", lg: "row" }}>
            <Box
              p={2}
              minW={"80px"}
              className={`${VARIANT}-${colorMode}-PrimaryLeftCut`}
            >
              <Text fontSize={"xs"}>They Earn</Text>
              <Heading size={"sm"} fontWeight={"bold"}>
                50 XP
              </Heading>
            </Box>
            <Box
              className={`${VARIANT}-${colorMode}-SecondryRightCut`}
              p={2}
              minW={"80px"}
            >
              <Text fontSize={"xs"}>You Earn</Text>
              <Heading size={"sm"} fontWeight={"bold"}>
                50 XP
              </Heading>
            </Box>
          </Flex>
        </Flex>
        <Flex
          justify={"space-between"}
          mt={6}
          flexDir={{ base: "column", md: "row", lg: "row" }}
        >
          <Flex
            gap={{ base: 2, md: 4, lg: 4 }}
            mt={{ base: 0, md: 6, lg: 6 }}
            align={"center"}
            wrap={"wrap"}
          >
            {user?.user?.accessCodes?.map((code, i) => (
              <Box key={i}>
                {code && (
                  <AccessCode
                    code={code}
                    isUsedAccessCode={code.joinedUserId}
                  />
                )}
              </Box>
            ))}
          </Flex>

          <ShareTweetPill
            args={{ alignItems: "center", justifyContent: "center" }}
          />
        </Flex>
      </Dark600Box2C>
    </div>
  );
}

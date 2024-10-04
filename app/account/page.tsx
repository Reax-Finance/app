"use client";

import { Box, Flex, Heading, Text, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { BsClock } from "react-icons/bs";
import Swiper, { Autoplay, Navigation } from "swiper";
import "swiper/swiper.min.css";
import AccessCodes from "../../components/accounts/AccessCodes";
import DiscordConnectQuest from "../../components/accounts/quests/DiscordConnectQuest";
import FollowTwitter from "../../components/accounts/quests/FollowTwitter";
import UsernameSelection from "../../components/accounts/UsernameSelection";
import { useUserData } from "../../components/context/UserDataProvider";
import Dark600Box2C from "../../components/ui/boxes/Dark600Box2C";
import UserAccount from "../../components/utils/useUserAccount";
import { tokenFormatter } from "../../src/const";
import { VARIANT } from "../../styles/theme";

Swiper.use([Autoplay, Navigation]);

const Page = () => {
  const { user } = useUserData();
  const { colorMode } = useColorMode();
  const { address } = UserAccount();
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25 }}
    >
      <Box maxW={{ base: "95vw", md: "1350px", lg: "1350px" }}>
        <Flex gap={10} justify={"space-between"}>
          <Box>
            <Heading>
              {user?.user?.username
                ? user?.user.username
                : address?.slice(0, 6) + "..." + address?.slice(-4)}
            </Heading>
            <Text mt={2} color={"whiteAlpha.600"}>
              Joined on:{" "}
              {new Date(
                user?.user?.createdAt?.toString() as any
              ).toDateString()}
            </Text>
          </Box>
          <Box textAlign={"center"}>
            <Box
              className={`${VARIANT}-${colorMode}-SecondryRightCut`}
              px={6}
              py={2}
            >
              <Heading>
                {tokenFormatter.format(Number(user?.user?.balance))}
              </Heading>
            </Box>
            <Box
              className={`${VARIANT}-${colorMode}-PrimaryLeftCut`}
              px={6}
              py={1}
            >
              <Text>XP</Text>
            </Box>
          </Box>
        </Flex>

        {/* <Divider my={4} /> */}
        <Box mt={8}>
          <AccessCodes />
        </Box>

        {/* <Divider my={4} /> */}
        <Heading size={"lg"} my={8}>
          Quests
        </Heading>

        <Flex
          gap={4}
          flexDirection={{ sm: "column", md: "row", lg: "row" }}
          maxW={{ sm: "100vw" }}
        >
          <Flex w={"100%"}>
            <UsernameSelection />
          </Flex>
          <Flex w={"100%"}>
            <FollowTwitter />
          </Flex>
          <Flex w={"100%"}>
            <DiscordConnectQuest />
          </Flex>
          <Dark600Box2C
            align={"center"}
            justify={"center"}
            p={6}
            w={"100%"}
            textAlign={"center"}
          >
            <BsClock size={"30px"} />
            <Heading mt={4} mb={4} size={"md"}>
              Coming Soon
            </Heading>
            <Text>
              More quests coming soon! Stay tuned on our{" "}
              <a href="https://twitter.com/reaxfinance" target="_blank">
                Twitter
              </a>{" "}
            </Text>
          </Dark600Box2C>
        </Flex>
      </Box>
    </motion.div>
  );
};

export default Page;

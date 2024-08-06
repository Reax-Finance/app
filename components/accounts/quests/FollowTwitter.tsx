import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { BsCheck } from "react-icons/bs";
import "swiper/swiper.min.css";
import { VARIANT } from "../../../styles/theme";
import Dark400Box2C from "../../ui/boxes/Dark400Box2C";
import Dark600Box2C from "../../ui/boxes/Dark600Box2C";
import axios from "axios";
import { useUserData } from "../../context/UserDataProvider";

export default function FollowTwitter() {
  const toast = useToast();

  const { colorMode } = useColorMode();
  const { updateUser, user } = useUserData();

  const handleTwitterFollow = async () => {
    window.open(
      "https://x.com/intent/follow?screen_name=ReaxFinance",
      "_blank"
    );

    await axios
      .post("/api/user/follow-twitter")
      .then((res) => {
        updateUser();
        toast({
          title: "Followed!",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "bottom",
        });
      })
      .catch((err) => {
        toast({
          title: "Error occurred",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "bottom",
        });
      });
  };

  return (
    <>
      <Dark600Box2C flexDir={"column"} justify={"space-between"} flex={1}>
        <>
          <Dark400Box2C
            justify={"space-between"}
            p={4}
            flexDir={"row"}
            gap={10}
          >
            <Box>
              <Heading size={"md"}>Follow Fast, Earn Faster</Heading>
              <Text color={"whiteAlpha.600"} mt={1}>
                Simple steps, big rewards. Follow us on Twitter.
              </Text>
            </Box>
            {user?.user?.isFollowing ? (
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
          {user?.user?.isFollowing ? (
            <Flex
              mt={0}
              p={4}
              pt={2}
              gap={2}
              alignItems={"start"}
              justifyContent={"start"}
            >
              <Text>Quest Completed:</Text>
              <Heading color={"primary.400"} size={"md"}>
                FOLLOWED!
              </Heading>
            </Flex>
          ) : (
            <Flex align={"center"} mt={4} p={4} pt={2}>
              <Box className={`${VARIANT}-${colorMode}-input`} w={"100%"}>
                <Box
                  className={`${VARIANT}-${colorMode}-twitterFollowEnabled`}
                  _hover={{ opacity: 0.8 }}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Button
                    rounded={0}
                    _hover={"none"}
                    bg={"transparent"}
                    textColor={"black"}
                    onClick={handleTwitterFollow}
                  >
                    Join the Fun @ReaxFinance
                  </Button>
                </Box>
              </Box>
            </Flex>
          )}
        </>
      </Dark600Box2C>
    </>
  );
}

import {
  Flex,
  Text,
  Heading,
  Image,
  Box,
  Button,
  useColorMode,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Dark600Box2C from "../ui/boxes/Dark600Box2C";
import Dark400Box2C from "../ui/boxes/Dark400Box2C";
import Allowlist from "./Allowlist";
import ImageSlider from "./ImageSlider";
import { SlideData } from "./SlideData";
import { useUserData } from "../context/UserDataProvider";

export default function GetStarted({
  setJoin,
  loading,
}: {
  setJoin: any;
  loading: boolean;
}) {
  const signIn = () => {
    setJoin(true);
  };

  const { colorMode } = useColorMode();

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Dark600Box2C zIndex={2} w={"50%"}>
          <Dark400Box2C py={2} px={8}>
            <Heading>Welcome to REAX!</Heading>
            <Text mt={1}>The future of finance starts here.</Text>
          </Dark400Box2C>

          <Box p={4} h={"50%"}>
            <Dark400Box2C>
              <Text p={4}>
                Your gateway to a universe of real-world assets awaits! Get
                ready to:
              </Text>
            </Dark400Box2C>
            <Dark400Box2C mt={2} w="100%" h={"30%"} p={4} pb={2}>
              <ImageSlider slides={SlideData} />
            </Dark400Box2C>

            <Box className={`${VARIANT}-${colorMode}-primaryButton`} mt={2}>
              <Button
                size={"md"}
                onClick={signIn}
                type="button"
                bg={"transparent"}
                _hover={{ opacity: 0.6 }}
                w={"100%"}
              >
                Get Started
                <ChevronRightIcon />
              </Button>
            </Box>
          </Box>
        </Dark600Box2C>
      )}
    </>
  );
}

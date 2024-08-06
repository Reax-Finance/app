import {
  Flex,
  Text,
  Heading,
  Image,
  Box,
  Button,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React, { use, useEffect } from "react";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Dark600Box2C from "../ui/boxes/Dark600Box2C";
import Dark400Box2C from "../ui/boxes/Dark400Box2C";
import Allowlist from "./Allowlist";
import ImageSlider from "./ImageSlider";
import { SlideData } from "./SlideData";

export default function GetStarted({ setJoin }: any) {
  const signIn = () => {
    setJoin(true);
  };

  const { colorMode } = useColorMode();

  return (
    <Dark600Box2C zIndex={2} w={"50%"}>
      <Dark400Box2C p={4}>
        <Heading>Welcome to REAX!</Heading>
      </Dark400Box2C>

      <Box p={4}>
        <Text mt={2}>The future of finance starts here.</Text>
        <Dark400Box2C mt={8}>
          <Text p={4}>
            Your gateway to a universe of real-world assets awaits! Get ready
            to:
          </Text>
        </Dark400Box2C>
        <Dark400Box2C mt={2} w="100%" p={4} pb={2}>
          <ImageSlider slides={SlideData} />
        </Dark400Box2C>

        <Box className={`${VARIANT}-${colorMode}-primaryButton`} mt={8}>
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
  );
}

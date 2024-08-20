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

export default function GetStarted({ setJoin, accessCode }: { setJoin: any, accessCode: string }) {
  const signIn = () => {
    setJoin(true);
  };

  const [showLoader, setShowLoader] = React.useState(false);
  useEffect(() => {
    setShowLoader(true);
    setTimeout(() => {
      setShowLoader(false);
    }, 1000);
  }, []);

  const { colorMode } = useColorMode();

  return (
    <>
      {showLoader ? (
        <Spinner />
      ) : (
        <Dark600Box2C zIndex={2} w={"50%"}>
          <Dark400Box2C p={4}>
            <Heading>{accessCode ? 'Get started' : `You're On The Allowlist! 🎉`}</Heading>
            {/* <Text mt={1}>The future of finance starts here.</Text> */}
          </Dark400Box2C>

          <Box p={4}>
            <Text py={4}>
              Welcome to Reax Testnet! 
            </Text>
            <Text pb={4}>
              Your gateway to a universe of real-world assets awaits! Get
              ready to trade, lend, and borrow with the power of DeFi:
            </Text>
            <Box mt={2} w="100%" h={"30%"} pb={2}>
              <ImageSlider slides={SlideData} />
            </Box>

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

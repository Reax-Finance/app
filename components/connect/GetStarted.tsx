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
import ImageSlider from "./ImageSlider";
import { SlideData } from "./SlideData";
import BlockLoading from "../ui/skeletons/BlockLoading";

export default function GetStarted({ setJoin }: { setJoin: any }) {
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
        <BlockLoading />
      ) : (
        <Dark600Box2C
          zIndex={2}
          w={{ base: "95vw", md: "70%", lg: "50%" }}
          mx={{ base: "auto", md: 4, lg: 4 }}
          my={{ base: 20, md: 4, lg: 4 }}
        >
          <Dark400Box2C p={4}>
            <Heading
              fontSize={{ base: "x-large", md: "x-large", lg: "xx-large" }}
            >
              Welcome to Reax Testnet!
            </Heading>
          </Dark400Box2C>

          <Box
            px={{ base: 2, md: 4, lg: 4 }}
            py={{ base: 2, md: 4, lg: 4 }}
            h={"50%"}
          >
            <Text p={4} px={2}>
              Your gateway to a universe of real-world assets awaits! Get ready
              to trade 100s of stocks, commodities, and more all on-chain.
            </Text>
            <Box mt={4} w="100%" h={"30%"} p={0} pb={2}>
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

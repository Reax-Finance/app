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
import { useAccount } from "wagmi";
import { VARIANT } from "../../styles/theme";
import { ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useUserData } from "../context/UserDataProvider";

export default function SignupInterface({ accessCode }: any) {
  const { address } = useAccount();
  const { colorMode } = useColorMode();
  const { updateUser } = useUserData();

  const [loading, setLoading] = React.useState(false);

  const toast = useToast();
  const signUp = () => {
    setLoading(true);
    axios
      .post("/api/user/join", { address, accessCode })
      .then((res) => {
        updateUser();
        setLoading(false);
        console.log(res);
        toast({
          title: "Success",
          description: "Successfully signed up",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        toast({
          title: "Error",
          description: "Failed to sign up. Please try again later",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  };
  return (
    <Flex
      zIndex={2}
      justifyContent={"center"}
      alignItems={"center"}
      minH={"50vh"}
      direction={"column"}
      gap={4}
    >
      <Heading>Sign up</Heading>
      <Box className={`${VARIANT}-${colorMode}-primaryButton`} mt={8}>
        <Button
          onClick={signUp}
          bg={"transparent"}
          _hover={{ opacity: 0.6 }}
          isLoading={loading}
          w={"100%"}
        >
          Sign Up
        </Button>
      </Box>
    </Flex>
  );
}

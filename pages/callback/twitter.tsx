import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Box, Flex, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import { useUserData } from "../../components/context/UserDataProvider";

export default function TwitterCallback() {
  const { updateUser } = useUserData();
  const router = useRouter();

  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true); //trying to stop refreshing

  useEffect(() => {
    if (router.query.error) {
      toast({
        title: "An error occurred.",
        description: router.query.error,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      router.push("/");
    }
    if (!router.query.code) return;

    // Post with the code and state and error to the server
    axios
      .post("/api/auth/twitter/callback", {
        state: router.query.state,
        code: router.query.code,
        error: router.query.error,
      })
      .then(async (response) => {
        setIsLoading(false);
        if (response.status === 200) {
          toast({
            title: "Success",
            description: "You have successfully connected your X account.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          // Update userData
          router.push("/"); //still have to confirm
          await updateUser();
        }
      })
      .catch((error: any) => {
        setIsLoading(false);
        console.log("Error", error);
        toast({
          title: "Try Again",
          description:
            error?.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });

        router.push("/connect");
      })
      .finally(() => setIsLoading(false));
    console.log("pushing to /connect after fail");
    router.push("/connect");
  }, [router.query]);
  return (
    <Flex
      bgImage={"/images/whitelist-page-bg.svg"}
      bgSize={"cover"}
      bgRepeat={"no-repeat"}
      h={"100vh"}
      w={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Flex flexDir={"column"} align={"center"} justify={"space-between"}>
        <Image src="/logo.svg" w={100} h={100} alt="" zIndex={2} />
        <Box
          display={"flex"}
          alignItems={"center"}
          w={"100%"}
          px={20}
          maxW={"1350px"}
          h={"90vh"}
        >
          {isLoading && (
            <Flex alignItems={"center"} gap={4}>
              <Spinner />
              <Text color={"white"} fontSize={"2xl"}>
                Connecting your account...
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}

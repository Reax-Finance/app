import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Box, Flex, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import { useUserData } from "../../components/context/UserDataProvider";

export default function TwitterCallback() {
  const { updateUser } = useUserData();
  const router = useRouter();

  const toast = useToast();

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
    console.log("Query", router.query);
    if (!router.query.code) return;
    // Post with the code and state and error to the server
    axios
      .post("/api/auth/twitter/callback", {
        state: router.query.state,
        code: router.query.code,
        error: router.query.error,
      })
      .then(async (response) => {
        // Redirect to the dashboard
        if (response.status === 200) {
          await updateUser();
          toast({
            title: "Success",
            description: "You have successfully connected your X account.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          // Update userData
          // await updateUser();
          // navRoute.refresh();
          router.push("/connect"); //still have to confirm
        }
      })
      .catch((error: any) => {
        console.log("Error", error);
        toast({
          title: "An error occurred.",
          description:
            error?.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        router.push("/connect");
      });
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
          <Flex alignItems={"center"} gap={4}>
            <Spinner />
            <Text color={"white"} fontSize={"2xl"}>
              Connecting your account...
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}

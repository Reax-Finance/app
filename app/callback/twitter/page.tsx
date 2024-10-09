"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Flex, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import { useUserData } from "../../../components/context/UserDataProvider";

export default function Page() {
  const { updateUser } = useUserData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (error) {
      toast({
        title: "An error occurred.",
        description: error,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      router.push("/connect");
    }

    if (!code) return;

    console.log("state", state);
    console.log("code", code);
    console.log("error", error);

    axios
      .post("/api/auth/twitter/callback", {
        state: state,
        code: code,
        error: error,
      })
      .then(async (response) => {
        setIsLoading(false);
        console.log("response on twitter", response);
        if (response.status === 200) {
          toast({
            title: "Success",
            description: "You have successfully connected your X account.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });

          console.log("updating user");
          await updateUser();
          console.log("user updated");
          router.push("/");
        }
      })
      .catch((error: any) => {
        console.log("error on twitter", error);
        setIsLoading(false);
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
  }, [router, searchParams]);

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

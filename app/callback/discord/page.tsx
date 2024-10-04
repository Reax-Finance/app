"use client";

import { Flex, Spinner, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useUserData } from "../../../components/context/UserDataProvider";

export default function Page() {
  const { updateUser } = useUserData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

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
      router.push("/account");
    }

    if (!code) return;

    axios
      .post("/api/auth/discord/callback", {
        state: state,
        code: code,
        error: error,
      })
      .then((response) => {
        if (response.status === 200) {
          updateUser();
          toast({
            title: "Success",
            description:
              "You have successfully connected your Discord account.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          router.push("/account");
        }
      })
      .catch((error: any) => {
        toast({
          title: "An error occurred.",
          description:
            error?.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        router.push("/account");
      });
  }, [router, searchParams, toast, updateUser]);

  return (
    <Flex
      bgImage={"/images/whitelist-page-bg.svg"}
      bgSize={"cover"}
      bgRepeat={"no-repeat"}
      minH={"100vh"}
      w={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Flex w={"100%"} justifyContent={"center"} alignItems={"center"} gap={2}>
        <Spinner />
        <Text color={"white"} fontSize={"2xl"}>
          Connecting your account...
        </Text>
      </Flex>
    </Flex>
  );
}

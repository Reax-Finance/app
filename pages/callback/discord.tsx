import { Flex, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUserData } from "../../components/context/UserDataProvider";

export default function DiscordCallback() {
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
      router.push("/account");
    }
    console.log("Query", router.query);
    if (!router.query.code) return;

    axios
      .post("/api/auth/discord/callback", {
        state: router.query.state,
        code: router.query.code,
        error: router.query.error,
      })
      .then(async (response) => {
        // Redirect to the dashboard
        if (response.status === 200) {
          await updateUser();
          console.log("DiscordCallback Response", response);
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
        console.log("Error in DiscordCallback", error);
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
  }, [router.query]);
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
      <Flex w={"100%"} justifyContent={"center"} alignItems={"center"}>
        <Text color={"white"} fontSize={"2xl"}>
          Connecting your account...
        </Text>
      </Flex>
    </Flex>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../actions/auth";
import SignInBox from "./components/SignIn";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { Flex, Spinner } from "@chakra-ui/react";
import { useUserData } from "../../../components/context/UserDataProvider";

export default function ConnectPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const connection = useActiveWalletConnectionStatus();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useUserData();

  useEffect(() => {
    async function checkLoginStatus() {
      const { isAuthenticated } = await isLoggedIn();
      setIsAuthenticated(isAuthenticated);
      setLoading(false);
    }

    checkLoginStatus();

    if (
      !loading &&
      isAuthenticated &&
      connection === "connected" &&
      user?.isAllowlisted &&
      !user?.twitter
    ) {
      router.push("/connect/get-started");
    } else if (
      !loading &&
      isAuthenticated &&
      connection === "connected" &&
      !user?.isAllowlisted
    ) {
      router.push("/connect/whitelist");
    } else if (
      !loading &&
      isAuthenticated &&
      connection === "connected" &&
      user?.isAllowlisted &&
      user.twitter &&
      user.user
    ) {
      router.push("/");
    }

    [loading, isAuthenticated, connection, router, user];
  });

  if (loading) {
    return (
      <Flex
        bgSize={"cover"}
        bgRepeat={"no-repeat"}
        minH={"100vh"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Flex
          w={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={2}
        >
          <Spinner />
        </Flex>
      </Flex>
    );
  }

  return <SignInBox />;
}

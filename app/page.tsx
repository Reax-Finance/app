"use client";

import { useRouter } from "next/navigation";
import { isLoggedIn } from "./connect/actions/auth";
import Swap from "./swap/components/Swap";
import { useUserData } from "../components/context/UserDataProvider";
import { useEffect, useState } from "react";

export default function SwapPage() {
  const { user } = useUserData();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkLoginStatus() {
      const { payload } = await isLoggedIn();
      if (!payload?.parsedJWT.sub) {
        router.push("/connect");
      } else {
        setIsAuthenticated(true);
      }
    }

    checkLoginStatus();
    console.log("user from home", user);
    if (!isAuthenticated) {
      router.push("/connect");
    } else if (isAuthenticated && !user?.isAllowlisted) {
      router.push("/connect/whitelist");
    } else if (isAuthenticated && user?.isAllowlisted && !user?.twitter) {
      router.push("/connect/get-started");
    }
  }, [router, user, isAuthenticated]);

  return <Swap />;
}

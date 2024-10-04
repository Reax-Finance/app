"use client";

import { redirect, useRouter } from "next/navigation";
import { isLoggedIn } from "./connect/actions/auth";
import Swap from "./swap/components/Swap";
import { useUserData } from "../components/context/UserDataProvider";

export default async function SwapPage() {
  const { user } = useUserData();
  const router = useRouter();
  const { isAuthenticated, payload } = await isLoggedIn();

  console.log("user from home", user);
  if (!isAuthenticated) {
    // redirect("/connect");
    router.push("/connect");
  } else if (
    isAuthenticated &&
    payload?.parsedJWT.sub &&
    !user?.isAllowlisted
  ) {
    // redirect("/connect/whitelist");
    router.push("/connect/whitelist");
  } else if (
    isAuthenticated &&
    payload?.parsedJWT.sub &&
    user?.isAllowlisted &&
    !user?.twitter
  ) {
    // redirect("/connect/get-started");
    router.push("/connect/get-started");
  }
  return <Swap />;
}

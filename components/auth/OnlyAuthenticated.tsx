"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isLoggedIn } from "../../actions/login";
import { useUserData } from "../context/UserDataProvider";
import UserAccount from "../utils/useUserAccount";

export default async function OnlyAuthenticated() {
  const { address } = UserAccount();
  const { user } = useUserData();
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  const checkUser = async () => {
    if (!(await isLoggedIn())) {
      redirect("/connect");
    }
  };
  useEffect(() => {
    checkUser();
    if (
      !(user?.user && user?.id == address?.toLowerCase()) ||
      sessionStatus !== "authenticated"
    ) {
      router.push("/connect");
    }
  }, [user, address, sessionStatus, router]);

  return <></>;
}

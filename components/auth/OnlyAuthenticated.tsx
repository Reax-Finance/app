"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserData } from "../context/UserDataProvider";
import UserAccount from "../utils/useUserAccount";

export default function OnlyAuthenticated({}: {}) {
  const { address } = UserAccount();
  const { user } = useUserData();
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      !(user?.user && user?.id == address?.toLowerCase()) ||
      sessionStatus !== "authenticated"
    ) {
      router.push("/connect");
    }
  }, [user, address, router]);

  return <></>;
}

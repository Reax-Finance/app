import React, { useEffect } from "react";
import { useUserData } from "../context/UserDataProvider";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Status } from "../utils/status";
import { Spinner } from "@chakra-ui/react";

export default function OnlyAuthenticated({children}: any) {
  const { address } = useAccount();
  const { status: sessionStatus } = useSession();
  const { user, status: userStatus } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (
      !(user?.user && user?.id == address?.toLowerCase()) ||
      sessionStatus !== "authenticated"
    ) {
      router.push("/connect");
    }
  }, [user, address, sessionStatus, router]);

  if(userStatus !== Status.SUCCESS) return null;

  return <>{children}</>;
}

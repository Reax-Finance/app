import React, { useEffect } from "react";
import { useUserData } from "../context/UserDataProvider";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Status } from "../utils/status";
import { Spinner } from "@chakra-ui/react";

export default function OnlyAuthenticated() {
  const { user } = useUserData();
  const { address } = useAccount();
  const { status: sessionStatus } = useSession();
  const { status: userStatus } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (
      !(user?.user && user?.id == address?.toLowerCase()) ||
      sessionStatus !== "authenticated"
    ) {
      router.push("/connect");
    }
  }, [user, address, sessionStatus, router]);

  return <></>;
}

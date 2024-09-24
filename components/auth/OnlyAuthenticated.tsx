"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserAccount from "../utils/useUserAccount";
import { useUser } from "@clerk/nextjs";

export default function OnlyAuthenticated({}: {}) {
  // const { address } = UserAccount();
  // const { user } = useUserData();
  // const { status: sessionStatus } = useSession();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const address = user?.web3Wallets[0].web3Wallet;
  useEffect(() => {
    if (!isSignedIn && !address) {
      router.push("/connect");
      return;
    }
    router.push("/");
    return;
  }, [user, address, router]);

  return <></>;
}

import React, { useEffect } from 'react'
import { useUserData } from "../context/UserDataProvider";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function OnlyAuthenticated() {
    const { user } = useUserData();
	const { address } = useAccount();
	const { status: sessionStatus } = useSession();
    const router = useRouter();

	useEffect(() => {
		if (!(user?.user && user?.id == address?.toLowerCase()) || sessionStatus !== "authenticated") {
			router.push("/connect");
		}
	}, [user, address, sessionStatus, router]);
    return (
    <></>
  )
}

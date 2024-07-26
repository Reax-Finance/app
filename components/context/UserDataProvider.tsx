import * as React from "react";
import { ADDRESS_ZERO, isSupportedChain } from '../../src/const';
import { useEffect } from 'react';
import { useAccount } from "wagmi";
import { Status } from "../utils/status";
import { Account, ReserveData, LiquidityData } from "../utils/types";
import { AllowlistedUser, User as _User } from "@prisma/client";
import { useSession } from "next-auth/react";
import axios from 'axios';

interface UserData extends _User {
	user?: _User;
	isAllowlisted: boolean;
}

export interface UserDataValue {
	status: Status;
	message: string;
	user: UserData|undefined,
}

const UserDataContext = React.createContext<UserDataValue>({} as UserDataValue);

function UserDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<UserDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<UserDataValue['message']>("");
	const [user, setUser] = React.useState<UserData>();

	const { address } = useAccount();
	const { status: sessionStatus } = useSession();
	
	useEffect(() => {
		if(typeof window === "undefined") return;
		if(!address || address == ADDRESS_ZERO) return;
		if(sessionStatus !== "authenticated") return;

		const start = Date.now();
		console.log("Getting user data for", address);
		// if(first) setStatus(Status.FETCHING);
		axios.get("/api/user/get-user", {
			params: {address}
		})
			.then(async (res: any) => {
				console.log("Data latency", Date.now() - start, "ms");
				console.log("User data", res.data);

				setUser({...res.data.user, isAllowlisted: Boolean(res.data.user), id: address.toLowerCase()});
				setStatus(Status.SUCCESS);
			})
			.catch(async (err: any) => {
				console.log("Error", err);
				setStatus(Status.ERROR);
			});
	}, [address, sessionStatus])

	const value: UserDataValue = {
		user,
		status,
		message
	};

	return (
		<UserDataContext.Provider value={value}>
			{children}
		</UserDataContext.Provider>
	);
}

export const useUserData = () => {
	return React.useContext(UserDataContext);
}

export { UserDataProvider, UserDataContext };
import * as React from "react";
import { ADDRESS_ZERO, isSupportedChain } from "../../src/const";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Status } from "../utils/status";
import { Account, ReserveData, LiquidityData } from "../utils/types";
import { AccessCode, AllowlistedUser, TwitterAccount, User as _User } from "@prisma/client";
import { useSession } from "next-auth/react";
import axios from "axios";

interface UserObject extends _User {
  accessCodes: AccessCode[];
}

interface UserData extends AllowlistedUser {
  user?: UserObject;
  isAllowlisted: boolean;
  twitter: TwitterAccount | null;
}

export interface UserDataValue {
  status: Status;
  message: string;
  user: UserData | undefined;
  setUser: React.Dispatch<React.SetStateAction<UserData | undefined>>;
  updateUser: () => Promise<void>;
}

const UserDataContext = React.createContext<UserDataValue>({} as UserDataValue);

function UserDataProvider({ children }: any) {
  const [status, setStatus] = React.useState<UserDataValue["status"]>(
    Status.NOT_FETCHING
  );
  const [message, setMessage] = React.useState<UserDataValue["message"]>("");
  const [user, setUser] = React.useState<UserData>();

  const { address } = useAccount();
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    updateUser();
  }, [address, sessionStatus]);

  async function updateUser (): Promise<void> {
    return new Promise((resolve, reject) => {
    setStatus(Status.FETCHING);
    if (typeof window === "undefined") return;

    if (!address || address == ADDRESS_ZERO) return;
    if (sessionStatus !== "authenticated") return;

    axios
      .get("/api/user/get-user", {
        params: { address },
      })
      .then((res: any) => {
        console.log("User data", res.data);
        setUser({
          ...res.data.user,
          isAllowlisted: Boolean(res.data.user),
          id: address.toLowerCase(),
        });
        setStatus(Status.SUCCESS);
        resolve();
      })
      .catch((err: any) => {
        console.log("Error", err);
        setStatus(Status.ERROR);
        reject(err);
      });
    });
  }

  const value: UserDataValue = {
    user,
    setUser,
    status,
    message,
    updateUser
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export const useUserData = () => {
  return React.useContext(UserDataContext);
};

export { UserDataProvider, UserDataContext };

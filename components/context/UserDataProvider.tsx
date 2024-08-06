import {
  AccessCode,
  AllowlistedUser,
  TwitterAccount,
  DiscordConnect,
  User as _User,
} from "@prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ADDRESS_ZERO } from "../../src/const";
import { Status } from "../utils/status";

interface UserObject extends _User {
  accessCodes: AccessCode[];
}

interface UserData extends AllowlistedUser {
  user?: UserObject;
  isAllowlisted: boolean;
  twitter: TwitterAccount | null;
  discord: DiscordConnect;
}

export interface UserDataValue {
  status: Status;
  message: string;
  user: UserData | undefined;
  setUser: React.Dispatch<React.SetStateAction<UserData | undefined>>;
  updateUser: () => Promise<void>;
  refreshUserData: () => void;
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

  console.log("User Data is ", user);

  useEffect(() => {
    updateUser();
  }, [address, sessionStatus]);

  async function updateUser(): Promise<void> {
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

  const refreshUserData = () => {
    updateUser().catch((err) =>
      console.error("Failed to refresh user data", err)
    );
  };

  const value: UserDataValue = {
    user,
    setUser,
    status,
    message,
    updateUser,
    refreshUserData,
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

export { UserDataContext, UserDataProvider };

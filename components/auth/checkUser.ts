"use server";
import { redirect } from "next/navigation";
import { isLoggedIn } from "../../app/connect/actions/auth";

const checkUser = async () => {
  const { isAuthenticated } = await isLoggedIn();

  if (!isAuthenticated) {
    redirect("/connect");
  }

  return null;
};

export { checkUser };

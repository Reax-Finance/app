"use server";
import { redirect } from "next/navigation";
import { isLoggedIn } from "../../app/connect/actions/auth";

const checkUser = async () => {
  const userLoggedIn = await isLoggedIn();

  if (!userLoggedIn) {
    redirect("/connect");
  }

  return null;
};

export { checkUser };

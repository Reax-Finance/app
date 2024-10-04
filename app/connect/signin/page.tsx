import { redirect } from "next/navigation";
import { isLoggedIn } from "../actions/auth";
import SignInBox from "./components/SignIn";

export default async function ConnectPage() {
  const { isAuthenticated } = await isLoggedIn();

  if (isAuthenticated) {
    redirect("/connect/get-started");
  }

  return <SignInBox />;
}

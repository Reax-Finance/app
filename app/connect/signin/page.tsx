import { redirect } from "next/navigation";
import { isLoggedIn } from "../actions/auth";
import SignInBox from "./components/SignIn";

export default async function ConnectPage() {

  if(await isLoggedIn()) {
    redirect("/connect/get-started");
  }

  return (<SignInBox />);
}

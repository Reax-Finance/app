import { isLoggedIn } from "./actions/auth";
import { redirect } from "next/navigation";

export default async function ConnectPage() {
  const { isAuthenticated } = await isLoggedIn();
  if (isAuthenticated) {
    redirect("/connect/get-started");
  } else {
    redirect("/connect/signin");
  }
}

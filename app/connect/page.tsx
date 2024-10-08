import { isLoggedIn } from "./actions/auth";
import { redirect } from "next/navigation";

export default async function ConnectPage() {
  const { isAuthenticated, payload } = await isLoggedIn();

  if (isAuthenticated && payload?.parsedJWT.sub) {
    redirect("/connect/get-started");
  } else {
    redirect("/connect/signin");
  }
}

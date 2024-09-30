import { isLoggedIn } from "./actions/auth";
import { redirect } from "next/navigation";

export default async function ConnectPage() {
  if (await isLoggedIn()) {
    redirect("/connect/get-started");
  } else {
    redirect("/connect/signin");
  }
}

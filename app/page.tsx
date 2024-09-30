import { redirect } from "next/navigation";
import { isLoggedIn } from "./connect/actions/auth";
import Swap from "./swap/components/Swap";

export default async function SwapPage() {
  if (!(await isLoggedIn())) {
    redirect("/connect");
  }

  return <Swap />;
}

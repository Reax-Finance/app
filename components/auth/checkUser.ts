import { redirect } from "next/navigation";
import { isLoggedIn } from "../../app/connect/connect-button/actions/auth";

const checkUser = async () => {
  if (!(await isLoggedIn())) {
    redirect("/connect");
  }
};

export { checkUser };

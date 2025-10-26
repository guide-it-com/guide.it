import { p } from "utils/types";
import { tool } from "../utils/tools";

class SignIn {
  @(p`r${"String with the e-mail address to sign in with."}`) email: string;
  @(p`r${"String with the code sent to the e-mail address."}`) code: string;
}

export default tool(
  {
    lambda: "signIn",
    description: "Sign in the user with the e-mail address and code.",
  },
  SignIn,
);

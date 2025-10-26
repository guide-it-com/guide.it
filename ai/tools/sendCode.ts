import { p } from "utils/types";
import { tool } from "../utils/tools";

class SendCode {
  @(p`r${"String with the e-mail address to send the code to."}`) email: string;
}

export default tool(
  {
    description: "Send a 6-digit code to verify their e-mail address.",
  },
  SendCode,
);

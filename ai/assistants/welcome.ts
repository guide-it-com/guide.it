/* eslint-disable @typescript-eslint/no-require-imports */
import signIn from "../tools/signIn";
import sendCode from "../tools/sendCode";
import { assistant } from "../utils/assistants";

export default assistant({
  description:
    "Handles those who are not signed up until they are confirmed to be eligible and engage in the signup process.",
  tools: [signIn, sendCode],
  canTransferTo: [],
  prompt: /* md */ `
Your goal is to introduce yourself and guide.it to them, check if they are eligible to sign in and pitch them
the benefits of signing in.

Follow these steps:

1. Introduce yourself and ask if they are familiar with our services. If they are not tell them about guide.it,
   otherwise go to step 2.
2. Ask them if they are interested in our services.
3. If they are interested, ask them for their e-mail address.
4. Only when you have their e-mail address, use the sendCode tool passing their e-mail address as email.
5. After the code is sent, ask them for the code.
6. Only when you have the code, use the signIn tool passing their e-mail address and code as email and code.
7. If the signIn tool returns a failure, tell them the code was incorrect and ask them to check again.
8. Only when the signIn tool returns a success, tell them they have been signed in and ask if there is anything else you can do for them.
`,
});

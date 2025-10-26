import { randomUUID } from "crypto";
import { Session, sign } from "utils/encryption";
import { User } from "../../entities/user";
import { getRepository } from "../../utils/db";
import { handle } from "../../utils/handler";

interface Payload {
  session?: Session;
  email?: string;
  code?: string;
}

export const handler = handle({
  handler: async (event) => {
    const body = JSON.parse(event.body) as Payload;
    console.log("body", body);

    if (!body.session?.email && !body.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email is required",
        }),
      };
    }

    const userRepository = await getRepository(User);
    const emailUsers = await userRepository.find({
      index: "email",
      where: {
        email: (body.session?.email || body.email).toLowerCase(),
      },
    });
    console.log("emailUsers", emailUsers);

    if (!emailUsers.length) {
      const user = new User();
      user.id = randomUUID();
      user.email = (body.session?.email || body.email).toLowerCase();
      emailUsers.push(user);
    }

    if (body.session) {
      emailUsers[0].lastSignIn = new Date().toISOString();
      await userRepository.put(emailUsers[0]);

      return {
        statusCode: 200,
        body: JSON.stringify(sign(body.session)),
      };
    }

    if (!body.email || !body.code) {
      throw new Error("Email and code are required");
    }

    if (body.code !== emailUsers[0].code) {
      throw new Error("Invalid code");
    }

    const user = emailUsers[0];
    user.code = undefined;
    user.lastCodeTime = undefined;
    user.lastSignIn = new Date().toISOString();
    await userRepository.put(user);

    const response = {
      statusCode: 200,
      body: JSON.stringify(
        sign({
          email: user.email,
          type: user.type,
          name: user.name,
        }),
      ),
    };
    return response;
  },
});

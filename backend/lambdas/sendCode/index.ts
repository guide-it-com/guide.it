import { sendEmail } from "backend/utils/smtp";
import { randomUUID } from "crypto";
import { User } from "../../entities/user";
import { getRepository } from "../../utils/db";
import { handle } from "../../utils/handler";

interface Payload {
  email?: string;
}

export const handler = handle({
  handler: async (event) => {
    const body = JSON.parse(event.body) as Payload;
    console.log("body", body);

    if (!body.email) {
      throw new Error("Email is required");
    }

    const userRepository = await getRepository(User);
    const users = await userRepository.find({
      index: "email",
      where: {
        email: body.email,
      },
    });

    if (!users.length) {
      const user = new User();
      user.id = randomUUID();
      user.email = body.email;
      users.push(user);
    }
    const user = users[0];
    if (
      user.lastCodeTime &&
      new Date(user.lastCodeTime).getTime() + 15 * 60 * 1000 >
        new Date().getTime()
    ) {
      return {
        statusCode: 200,
        body: "success",
      };
    }
    user.code = Math.floor(100000 + Math.random() * 900000).toString();
    user.lastCodeTime = new Date().toISOString();
    await userRepository.put(user);

    await sendEmail(
      user.email,
      "Verification Code",
      `Your verification code is: ${user.code}`,
      `
        <p>Your verification code is: ${user.code}</p>
      `,
    );

    const response = {
      statusCode: 200,
      body: "success",
    };
    return response;
  },
});

import { parseSignature } from "utils/encryption";
import { tryJsonParse } from "utils/strings";
import { User } from "../entities/user";

// this function is used to verify the signature of the request
// it is used as a middleware in the handler functions
export const handleSignature =
  (
    fn: AWSLambda.APIGatewayProxyHandler,
    required?: boolean,
    requireUser?: boolean,
    requireType?: User["type"],
  ): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    console.log("handleSignature event.body", event.body);
    const body = tryJsonParse(event.body);
    // extract the signature from the body
    let signature =
      body?.signature ||
      body?.message?.call?.assistantOverrides?.variableValues?.token ||
      body?.message?.call?.squad?.membersOverrides?.variableValues?.token;
    if (required && !signature) {
      // if the signature is required but not present, return a 403 response
      console.error("signature not found");
      return Promise.resolve({
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    }
    // parse the signature
    signature = parseSignature(signature);
    if (body?.signature && !signature) {
      // if there is a signature and it is invalid, return a 403 response
      console.error("invalid signature");
      return Promise.resolve({
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    }
    delete body?.signature;
    if (requireUser && !signature?.email) {
      // if the user is required but not present, return a 403 response
      console.error("user not provided");
      return Promise.resolve({
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    }
    if (requireType && signature?.type !== requireType) {
      // if the type is required but not present, return a 403 response
      console.error(
        `type ${signature?.type} does not match required type ${requireType}`,
      );
      return Promise.resolve({
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    }
    return fn(
      {
        ...event,
        // if the signature is valid, set it on body
        body: signature
          ? JSON.stringify({ ...body, session: signature })
          : event.body,
      },
      context,
      callback,
    );
  };

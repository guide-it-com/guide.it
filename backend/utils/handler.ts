import { User } from "../entities/user";
import { handleAsaas } from "./asaas";
import { handleSignature } from "./encryption";
import { handleMultipart } from "./multipart";
import { handleSES } from "./ses";
import { handleSNS } from "./sns";
import { handleSQS } from "./sqs";
import { handleTwilio } from "./twilio";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handle = ({
  requireSignature,
  requireUser,
  requireType,
  asaasWebhook,
  twilioWebhook,
  sns,
  ses,
  multipart,
  handler,
}: {
  requireSignature?: boolean;
  requireUser?: boolean;
  requireType?: User["type"];
  asaasWebhook?: boolean;
  twilioWebhook?: boolean;
  sns?: boolean;
  ses?: boolean;
  multipart?: boolean;
  handler: AWSLambda.APIGatewayProxyHandler;
}): AWSLambda.APIGatewayProxyHandler => {
  handler = handleSignature(
    handler,
    requireSignature,
    requireUser,
    requireType,
  );
  handler = handleAsaas(handler, asaasWebhook);
  handler = handleTwilio(handler, twilioWebhook);
  if (multipart) {
    handler = handleMultipart(handler);
  }
  if (ses) {
    handler = handleSES(handler);
  }
  if (sns) {
    handler = handleSNS(handler);
  }
  handler = handleSQS(handler);
  const name = process.env.AWS_LAMBDA_FUNCTION_NAME;
  const errorTitle = `Error in ${name}:`;
  return async (event, context) => {
    if (
      ["OPTIONS", "HEAD"].includes((event.requestContext as any)?.http?.method)
    ) {
      return {
        statusCode: 200,
        body: "",
        headers: CORS_HEADERS,
      };
    }
    try {
      let response = await new Promise<AWSLambda.APIGatewayProxyResult>(
        (resolve, reject) => {
          try {
            const response = handler(event, context, (error, response) => {
              if (error) {
                reject(error as Error);
              } else {
                resolve(response);
              }
            });
            if (response instanceof Promise) {
              resolve(response);
            }
          } catch (error) {
            reject(error as Error);
          }
        },
      );
      if (!response) {
        response = {
          statusCode: 500,
          body: JSON.stringify({ message: "No response" }),
        };
      }
      response.headers = {
        ...CORS_HEADERS,
        ...(response.headers || {}),
      };
      if (response.statusCode >= 500) {
        console.error(errorTitle, response);
      }
      return response;
    } catch (error) {
      console.error(errorTitle, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
        headers: CORS_HEADERS,
      };
    }
  };
};

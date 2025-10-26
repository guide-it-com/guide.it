import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// this function is used to verify the Twilio signature of the request
// it is used as a middleware in the handler functions
export const handleTwilio =
  (
    fn: AWSLambda.APIGatewayProxyHandler,
    twilioWebhook: boolean = false,
  ): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    const twilioSignature = (event.headers || {})["x-twilio-signature"];
    if (!twilioSignature) {
      if (twilioWebhook) {
        console.error("twilio signature not found");
        return Promise.resolve({
          statusCode: 403,
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      }
      return fn(event, context, callback);
    }
    const url =
      "https://" + event.requestContext.domainName + event.requestContext.path;
    const params = Object.fromEntries(new URLSearchParams(event.body));
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      params,
    );
    if (!isValid) {
      console.error("twilio signature is invalid");
      return Promise.resolve({
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    }
    return fn(
      {
        ...event,
        body: JSON.stringify(params),
      },
      context,
      callback,
    );
  };

export const sendVerify = async (to: string) => {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({
      channel: "sms",
      locale: "pt-br",
      to,
    });
  console.log("sendVerify", verification);
  return verification;
};

export const verifyCode = async (to: string, code: string) => {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({
      to,
      code,
    });
  console.log("verifyCode", verification);
  return verification;
};

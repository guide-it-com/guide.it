// this function is used parse the SNS event and assign the message to body
export const handleSNS =
  (fn: AWSLambda.APIGatewayProxyHandler): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    event.body = (event as any).Records?.[0]?.Sns?.Message;
    if (!event.body) {
      return Promise.resolve({
        statusCode: 403,
        body: "Unauthorized",
      });
    }
    return fn(event, context, callback);
  };

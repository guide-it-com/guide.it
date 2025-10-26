// this function is used parse the SQS event and assign the message to body
export const handleSQS =
  (fn: AWSLambda.APIGatewayProxyHandler): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    const body = (event as any).Records?.[0]?.body;
    if (body) {
      try {
        const eventBody = JSON.parse(body);
        Object.assign(event, eventBody);
      } catch (error) {
        console.error(error);
      }
    }
    return fn(event, context, callback);
  };

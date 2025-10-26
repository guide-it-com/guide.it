// this function is used parse the SES event and assign the headers and body
export const handleSES =
  (fn: AWSLambda.APIGatewayProxyHandler): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    const content: string = JSON.parse(event.body || "{}")?.content || "";
    if (!content) {
      return Promise.resolve({
        statusCode: 403,
        body: "Unauthorized",
      });
    }
    const finalHeaderIndex = content.indexOf("\r\n\r\n");
    event.headers = Object.fromEntries(
      content
        .substring(0, finalHeaderIndex)
        .split(/\r\n(?! )/g)
        .filter((h) => h.includes(": "))
        .map((h) => [
          h.substring(0, h.indexOf(": ")).toLowerCase(),
          h.substring(h.indexOf(": ") + 2).trim(),
        ]),
    );
    event.body = content.substring(finalHeaderIndex + 4);
    return fn(event, context, callback);
  };

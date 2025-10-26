import { APIGatewayProxyEvent } from "aws-lambda";
import { getFirstGroupMatch } from "utils/strings";

export type MultipartFile = {
  type: string;
  filename: string;
  encoding: string;
  contentType: string;
  content: string;
};

// extract the boundary from the content-type header
function getBoundary({
  headers: { "content-type": contentType },
}: APIGatewayProxyEvent) {
  const boundary = contentType?.toLowerCase().split("boundary=")[1]?.trim();
  if (boundary?.startsWith('"') && boundary?.endsWith('"')) {
    return boundary.substring(1, boundary.length - 1);
  }
  return boundary;
}

// extract the content from a multipart item
function getContent(item: string) {
  if (/filename="[^"]*"/g.test(item)) {
    // since the item contains a filename, it's a file
    const filename = getFirstGroupMatch(item, /filename="([^"]*)"/g);
    if (!filename) {
      // if the filename is empty, return an empty object
      return {};
    }
    // extract the field name from the item
    const name = getFirstGroupMatch(item, /name="([^"]+)";/g);
    // create a file object with the extracted values,
    // encoding the content as base64
    const value: MultipartFile = {
      type: "file",
      filename,
      encoding: "base64",
      contentType: getFirstGroupMatch(item, /Content-Type:\s(.+)/g),
      content: Buffer.from(
        item.slice(
          item.search(/Content-Type:\s.+/g) +
            getFirstGroupMatch(item, /(Content-Type:\s.+)/g).length +
            4,
          -2,
        ),
        "binary",
      ).toString("base64"),
    };
    return { [name]: value };
  } else if (/name="[^"]+"/g.test(item)) {
    // since the item contains a name but no filename,
    // it's a regular field
    // extract the field name from the item
    const name = getFirstGroupMatch(item, /name="([^"]+)"/g);
    // extract the field value from the item
    const value = item.slice(
      item.search(/name="[^"]+"/g) +
        getFirstGroupMatch(item, /(name="[^"]+")/g).length +
        4,
      -2,
    );
    return { [name]: value };
  } else if (item.trim().startsWith("Content-Type: ")) {
    // handle multipart/alternative
    const contentType = getFirstGroupMatch(item, /Content-Type: ([^;]+)/g);
    if (!contentType) {
      return {};
    }
    const content = item.substring(
      item.indexOf("\r\n\r\n") + 4,
      item.length - 4,
    );
    return {
      [contentType]: content,
    };
  }
}

const IS_BASE_64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;

// handle multipart form data as a middleware
export const handleMultipart =
  (fn: AWSLambda.APIGatewayProxyHandler): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    console.log("handleMultipart event.body", event.body);
    // extract the boundary from the event
    const boundary = getBoundary(event);
    console.log("handleMultipart boundary", boundary);
    if (IS_BASE_64.test(event.body)) {
      // decode the base64-encoded body
      event.body = Buffer.from(event.body, "base64").toString("binary");
      console.log("handleMultipart event.body decoded", event.body);
    }
    if (!boundary) {
      // if the boundary is not found, just remove the line breaks at the end of the body
      event.body = event.body.substring(0, event.body.length - 4);
      return fn(event, context, callback);
    }
    // split the body into parts using the boundary, ignoring case
    const parts = event.body.toLowerCase().split(boundary.toLowerCase());
    const fields: string[] = [];
    let i = 0;
    for (const part of parts) {
      fields.push(event.body.substring(i, i + part.length).replace(/-*$/i, ""));
      i += part.length + boundary.length;
    }
    console.log("handleMultipart fields", fields);
    if (!fields?.length) {
      // if no fields are found, return an error
      return Promise.resolve({
        statusCode: 400,
        body: JSON.stringify({ message: "multipart fields not found" }),
      });
    }
    // extract the content from each field and merge them
    const body = fields.reduce(
      (result, item) => ({
        ...result,
        ...getContent(item),
      }),
      {},
    );
    // stringify the body and pass it to the original handler
    event.body = JSON.stringify(body);
    return fn(event, context, callback);
  };

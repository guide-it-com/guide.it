import { handleMultipart } from "./multipart";
import { body, boundary, handledBody } from "./samples/multipart";

describe("handleMultipart", () => {
  it("should handle a multipart form data request", async () => {
    let event = {
      body,
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
    };
    expect(
      await handleMultipart((e) => {
        event.body = e.body;
      })(event as any, null, () => {}),
    ).toBeUndefined();
    expect(event.body).toEqual(handledBody);
  });
});

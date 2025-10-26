const process = require("process");
const spawn = require("child_process").spawn;
const pathResolve = require("path").resolve;
const existsSync = require("fs").existsSync;

process.env.ENCRYPTION_PRIVATE_KEY =
  '"-----BEGIN RSA PRIVATE KEY-----\\n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\\n-----END RSA PRIVATE KEY-----\\n"';
process.env.ENCRYPTION_PUBLIC_KEY =
  '"-----BEGIN PUBLIC KEY-----\\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEApJrtF1ClKYsmqGTbAmPn\\n1e85tDJ3HmOLvO7jCeTjfoJffIkpfqS92cFEkRt+vMKbPp00YVR6OYnChWQZFv7Y\\nr9aZ8ZXYfvWOxt3u0PlQSYb6xUe/bCa8DqP0SZ1Z4BUb7H2bJr1dgOdYgHn2fhuq\\n1UkfgRm65N+mCY2Jjv3XcQQxDkKZ/5KoULgELduL+yPcZGpcyBmmT4fBDtoP9Y/y\\nnah42NBcRkKnfBUaQB4TICaZSfKvQJjrTyBLvN5WkwcrXI0+Lj+uPahJ9k6DxFfL\\npbaSiVzGCuI5cYXxSC9CEAwSLl1gRvJCantdmgYay2XByU1nuBRfrwrmgvKnOSBD\\nLAIoTJeLXxHYHTTIKSkvxIStN3Y3FO/PJvaspaUM7FVlF1G9HEb7YI21iMdwLPRa\\nLosnbZjpmRA081zKrZV4JKO/fNAXW6VVu8nyjo5iQrnDmZ08paxDiD99uIJAsbv+\\npTaH3wfKn+HZwDD32c2BmS5Prk9xFmRi/JGSuEXpGp3taQ6XuferhnrBM7pYsfUa\\nMlHk4wSKGZnpEbXOHkWFSF0CuiFuSb7mGEH3pvOshLljDd9ThZrdtebIukWVPEyM\\nBVx3IEE9wOHdOfy0njPHhDREXG5BxGRpRQw71t/DQx4b+4WglSw6MjcdSqygWKfr\\n5+FACj0SCs8GEY2wkR9rpnMCAwEAAQ==\\n-----END PUBLIC KEY-----\\n"';

const jest = spawn("yarn", [
  "node",
  "--require",
  existsSync("./utils/tests/stub.js")
    ? "./utils/tests/stub.js"
    : "../utils/tests/stub.js",
  pathResolve(require.resolve("jest"), "../../bin/jest.js"),
  "--testTimeout=60000",
  ...process.argv.slice(2),
]);

setTimeout(() => jest.stdin.write("n"), 1000);
setTimeout(() => jest.stdin.write("n"), 2000);
setTimeout(() => jest.stdin.write("n"), 4000);
setTimeout(() => jest.stdin.write("n"), 8000);
setTimeout(() => jest.stdin.write("n"), 16000);
setTimeout(() => jest.stdin.write("n"), 32000);
setTimeout(() => jest.stdin.write("n"), 64000);
setTimeout(() => jest.stdin.write("n"), 128000);
setTimeout(() => jest.stdin.write("n"), 256000);
setTimeout(() => jest.stdin.write("n"), 512000);

process.stdin.pipe(jest.stdin);
jest.stdout.pipe(process.stdout);
jest.stderr.pipe(process.stderr);

import { Client } from "basic-ftp";
import { Readable } from "stream";

export const upload = async (file: Readable, path: string) => {
  const client = new Client();
  let error: any;
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false,
    });
    await client.uploadFrom(file, process.env.FTP_PATH + path);
  } catch (err) {
    error = err;
  }
  client.close();
  if (error) {
    throw error;
  }
};

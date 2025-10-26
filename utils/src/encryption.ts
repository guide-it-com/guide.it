import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "crypto";
import { JwtPayload, sign as JWTSign, verify as JWTVerify } from "jsonwebtoken";

const EXPIRATION_TIME = 15 * 60; // 15 minutes

export type Session = {
  phone: string;
  type?: "candidate" | "recruiter" | "representative" | "admin";
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  companyRole?: string;
};

export const parseSignature = (
  signature: string | undefined,
): Session | undefined => {
  try {
    return signature ? (verify(signature) as Session) : undefined;
  } catch (e) {
    console.error(e);
    return;
  }
};

export const sign = (
  value: JwtPayload,
  expiresIn = EXPIRATION_TIME,
): string => {
  // store env in a variable to avoid leaking it in compiled JS
  const env: any = process?.env || {};
  return JWTSign(
    value,
    env.ENCRYPTION_PRIVATE_KEY ||
      (globalThis as any).Runtime.getAssets()["/private.pem"].open(),
    { algorithm: "RS256", expiresIn },
  );
};

export const verify = (value: string): JwtPayload | undefined => {
  try {
    if (!value) return;
    // store env in a variable to avoid leaking it in compiled JS
    const env: any = process?.env || {};
    const decoded = JWTVerify(
      value,
      env.ENCRYPTION_PUBLIC_KEY ||
        (globalThis as any).Runtime.getAssets()["/public.pem"].open(),
      { algorithms: ["RS256"] },
    );
    if (!decoded) {
      throw new Error("Invalid token");
    }
    delete (decoded as any).exp;
    return decoded as JwtPayload;
  } catch (e) {
    console.error(e);
  }
};

export const hash = (value: string, key: string): string | undefined => {
  if (!value || !key) {
    return;
  }
  let hmac = createHmac("sha256", key);
  let expectedSignature: string;
  try {
    hmac.update(value);
    expectedSignature = hmac.digest("hex");
  } catch (e) {
    console.error(e);
    return;
  }
  return expectedSignature;
};

export const encrypt = (
  value: string | undefined,
  key: string,
): string | undefined => {
  if (!value || !key) {
    return;
  }
  const iv = randomBytes(32).toString("hex");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(value, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${cipher.getAuthTag().toString("base64")}:${iv}:${encrypted}`;
};

export const decrypt = (
  encrypted: string | undefined,
  key: string,
): string | undefined => {
  try {
    if (!encrypted || !key) {
      return;
    }
    const firstColon = encrypted.indexOf(":");
    const secondColon = encrypted.indexOf(":", firstColon + 1);
    if (firstColon === -1 || secondColon === -1) {
      return;
    }
    const tag = encrypted.slice(0, firstColon);
    const iv = encrypted.slice(firstColon + 1, secondColon);
    const encryptedData = encrypted.slice(secondColon + 1);
    if (!tag || !iv || !encryptedData) {
      return;
    }
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(Buffer.from(tag, "base64") as any);
    const decrypted = decipher.update(encryptedData, "base64", "utf8");
    return decrypted + decipher.final("utf8");
  } catch (e) {}
};

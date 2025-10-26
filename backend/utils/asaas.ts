import axios from "axios";
import { createStaticPix, parsePix, StaticPixEmvElements } from "pix-utils";
import { Settings } from "../entities/settings";
import { getRepository } from "./db";

let credentials: {
  token: string;
  webhookSecret: string;
  merchantName: string;
  merchantCity: string;
};
const getAasasCredentials = async () => {
  if (credentials) {
    return credentials;
  }
  const settingsRepository = await getRepository(Settings);
  const settings = await settingsRepository.find();
  return (credentials = {
    token: settings[0].asaasToken,
    webhookSecret: settings[0].asaasWebhookSecret,
    merchantName: settings[0].nome,
    merchantCity: settings[0].cidade,
  });
};

export const handleAsaas =
  (
    fn: AWSLambda.APIGatewayProxyHandler,
    asaasWebhook: boolean = false,
  ): AWSLambda.APIGatewayProxyHandler =>
  (event, context, callback) => {
    if (asaasWebhook) {
      return getAasasCredentials().then((credentials) => {
        if (
          event.headers?.["asaas-access-token"] !== credentials.webhookSecret
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({ message: "Unauthorized" }),
          };
        }
        return new Promise((resolve, reject) => {
          const response = fn(event, context, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
          if (response instanceof Promise) {
            response.then(resolve).catch(reject);
          }
        });
      });
    }
    return fn(event, context, callback);
  };

export const refundPix = async (paymentId: string, value?: number) => {
  const credentials = await getAasasCredentials();
  try {
    const response = await axios.post(
      `https://api.asaas.com/v3/payments/${paymentId}/refund`,
      value && { value },
      {
        headers: {
          "User-Agent": "Loja Bellan Online",
          accept: "application/json",
          access_token: credentials.token,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(error.stack);
      throw error.response.data;
    }
    throw error;
  }
};

const mapPixKey = (pixKey: {
  id: string;
  key: string;
  type: string;
  status: string;
  dateCreated: string;
  canBeDeleted: boolean;
  cannotBeDeletedReason: string | null;
  qrCode: {
    encodedImage: string;
    payload: string;
  };
}) =>
  ({
    key: pixKey.key,
    txid: (parsePix(pixKey.qrCode.payload) as StaticPixEmvElements).txid,
  }) as {
    key: string;
    txid: string;
  };

export const getPixKeys = async () => {
  const credentials = await getAasasCredentials();
  try {
    const response = await axios.get(
      "https://api.asaas.com/v3/pix/addressKeys",
      {
        headers: {
          "User-Agent": "Loja Bellan Online",
          accept: "application/json",
          access_token: credentials.token,
        },
      },
    );
    return response.data.data.map(mapPixKey) as ReturnType<typeof mapPixKey>[];
  } catch (error) {
    if (error.response) {
      console.error(error.stack);
      throw error.response.data;
    }
    throw error;
  }
};

export const createPixKey = async () => {
  const credentials = await getAasasCredentials();
  try {
    const response = await axios.post(
      "https://api.asaas.com/v3/pix/addressKeys",
      {
        type: "EVP",
      },
      {
        headers: {
          "User-Agent": "Loja Bellan Online",
          accept: "application/json",
          access_token: credentials.token,
        },
      },
    );
    return mapPixKey(response.data);
  } catch (error) {
    if (error.response) {
      console.error(error.stack);
      throw error.response.data;
    }
    throw error;
  }
};

export const createPix = async (
  pixKey: ReturnType<typeof mapPixKey>,
  value: number,
) => {
  const credentials = await getAasasCredentials();
  const pix = createStaticPix({
    merchantName: credentials.merchantName,
    merchantCity: credentials.merchantCity,
    pixKey: pixKey.key,
    transactionAmount: value,
    txid: pixKey.txid,
  }).throwIfError();
  return {
    qrCode: await pix.toImage(),
    copyPaste: pix.toBRCode(),
  };
};

export const getPixTransaction = async (pixTransactionId: string) => {
  const credentials = await getAasasCredentials();
  try {
    const response = await axios.get(
      `https://api.asaas.com/v3/pix/transactions/${pixTransactionId}`,
      {
        headers: {
          "User-Agent": "Loja Bellan Online",
          accept: "application/json",
          access_token: credentials.token,
        },
      },
    );
    return response.data as {
      id: string;
      transferId: any;
      endToEndIdentifier: string;
      finality: any;
      value: number;
      changeValue: any;
      refundedValue: number;
      dateCreated: string;
      effectiveDate: string;
      scheduledDate: any;
      status: string;
      type: string;
      originType: string;
      conciliationIdentifier: any;
      description: any;
      transactionReceiptUrl: string;
      chargedFeeValue: number;
      canBeRefunded: boolean;
      refundDisabledReason: any;
      refusalReason: any;
      canBeCanceled: boolean;
      originalTransaction: any;
      externalAccount: {
        ispb: number;
        ispbName: string;
        name: string;
        agency: string;
        account: string;
        accountDigit: string;
        accountType: string;
        cpfCnpj: string;
        addressKey: string;
        addressKeyType: string;
      };
      qrCode: any;
      payment: string;
      addressKey: string;
      addressKeyType: string;
      externalReference: any;
    };
  } catch (error) {
    if (error.response) {
      console.error(error.stack);
      throw error.response.data;
    }
    throw error;
  }
};

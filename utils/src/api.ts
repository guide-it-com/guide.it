import { VenueBlock, VenueBlockType } from "@/components/common/venue";
import axios from "axios";
import lambdas from "./lambdas.json";

export const IMAGES_DOMAIN = "imagens.bellan.online";

const apiUrl = (lambda: string) =>
  process.env.NODE_ENV === "development" && !process.env.AWS_API
    ? `http://localhost:3003/dev/${lambda}`
    : lambdas[lambda];

export const COOKIE_SESSION_KEYS = [
  "s0",
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
];

/**
 * Refresh the session
 */
let lastRefresh = Date.now();
export async function refreshSession() {
  const response = await axios.post(apiUrl("entrar"), {
    signature: (globalThis as any).session?.signature,
  });
  ((globalThis as any).session || {}).signature = response.data;
  lastRefresh = Date.now();
}

/**
 * Send a verification code to the provided email address
 */
export async function enviarCodigo(email: string) {
  await axios.post(apiUrl("enviarCodigo"), { email });
}

/**
 * Verify the code sent to the email address
 */
export async function entrar(email: string, code: string, destino: string) {
  const response = await axios.post(apiUrl("entrar"), { email, code });

  const cookieLength = Math.ceil(
    response.data!.length / COOKIE_SESSION_KEYS.length,
  );
  COOKIE_SESSION_KEYS.forEach((key, i) => {
    document.cookie = `${key}=${response.data!.substring(
      i * cookieLength,
      (i + 1) * cookieLength,
    )}; expires=${new Date(
      // 7 days for the session cookie expiration
      Date.now() + 1000 * 60 * 60 * 24 * 7,
    ).toUTCString()}; path=/`;
  });
  window.location.href = destino || "/";
}

export async function sair() {
  COOKIE_SESSION_KEYS.forEach((key) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  window.location.reload();
}

export type SaleItem = {
  productId: string;
  price: number;
  quantity: number | Record<string, number>;
  consumed: number | Record<string, number>;
};

export type Sale = {
  id: string;
  userEmail: string;
  status: "pendente" | "paga" | "cancelada";
  date: string;
  pixKey?: string;
  pixValue?: number;
  paymentId?: string;
  paymentDate?: number;
  paymentMethod?: string;
  referral?: string;
  originalReferral?: string;
  items: SaleItem[];
  canceledItems: SaleItem[];
  pix?: {
    qrCode: string;
    copyPaste: string;
  };
  whatsapp?: string;
  recurrentInMonths?: number;
};

export type Product = {
  id: string;
  order?: number;
  title: string;
  price: number | Record<string, number>;
  stock: number | Record<string, number>;
  minutesToPay: number;
  recurrentInMonths?: number;
  sold: number | Record<string, number>;
  venueId: string;
  description?: string;
  image: string;
  shortDescription?: string;
  saleIds?: string[];
  sharedStockProductIds?: string[];
  draft: {
    title: string;
    description?: string;
    image: string;
    shortDescription?: string;
    venueId: string;
    price: number | Record<string, number>;
    stock: number | Record<string, number>;
    minutesToPay: number;
    recurrentInMonths?: number;
  };
};

export type Block = Omit<VenueBlock, "disabled">;

export type BlockType = Omit<VenueBlockType, "type"> & {
  defaultStock: number;
  defaultPrice: number;
  blocks: Block[];
};

export type Venue = {
  id: string;
  name: string;
  description?: string;
  blocks: BlockType[];
  draft: {
    name: string;
    title?: string;
    description?: string;
    blocks: BlockType[];
  };
};

export type User = {
  id: string;
  name: string;
  email?: string;
  type?: "atendente" | "vendedor" | "administrador";
  lastSignIn?: string;
  saleIds?: string[];
};

export type Settings = {
  id?: "settings";
  asaasToken?: string;
  asaasWebhookSecret?: string;
  pixKeys?: string[];
  nome?: string;
  cidade?: string;
  whatsapp?: string;
  email?: string;
};

export type Painel = {
  sales: Sale[];
  products: Product[];
  venues: Venue[];
  users?: User[];
  settings?: Settings[];
};

export async function verPainel() {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (!(globalThis as any).session?.type) {
    throw new Error("Not allowed");
  }
  const response = await axios.post(apiUrl("verPainel"), {
    signature: (globalThis as any).session.signature,
  });
  return response.data as Painel;
}

export async function enviarImagem(image: File) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  const response = await axios.post(
    apiUrl("enviarImagem"),
    {
      signature: (globalThis as any).session.signature,
      image,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

export async function salvarUsuario(user: User) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  const response = await axios.post(apiUrl("salvarUsuario"), {
    signature: (globalThis as any).session.signature,
    user,
  });
  user.id = response.data;
}

export async function salvarProduto(product: Product) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  const response = await axios.post(apiUrl("salvarProduto"), {
    signature: (globalThis as any).session.signature,
    product,
  });
  product.id = response.data;
}

export async function salvarEstrutura(venue: Venue) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  const response = await axios.post(apiUrl("salvarEstrutura"), {
    signature: (globalThis as any).session.signature,
    venue,
  });
  venue.id = response.data;
}

export async function apagarProduto(productId: string) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("apagarProduto"), {
    signature: (globalThis as any).session.signature,
    productId,
  });
}

export async function apagarEstrutura(venueId: string) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("apagarEstrutura"), {
    signature: (globalThis as any).session.signature,
    venueId,
  });
}

export async function salvarConfiguracoes(settings: Settings) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if ((globalThis as any).session?.type !== "administrador") {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("salvarConfiguracoes"), {
    signature: (globalThis as any).session.signature,
    settings,
  });
}

export async function verLoja() {
  const response = await axios.post(apiUrl("verLoja"), {
    signature: (globalThis as any).session?.signature,
  });
  return response.data as {
    products: Product[];
    venues: Venue[];
    sales: Sale[];
  };
}

export async function criarVenda(
  items: Record<string, number | Record<string, number>>,
  referral: string,
  email?: string,
) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (!(globalThis as any).session?.email) {
    throw new Error("Not allowed");
  }
  if (
    email &&
    !["administrador", "vendedor"].includes((globalThis as any).session?.type)
  ) {
    throw new Error("Not allowed");
  }
  const response = await axios.post(apiUrl("criarVenda"), {
    signature: (globalThis as any).session?.signature,
    userEmail: email,
    items,
    referral,
  });
  return response.data as string;
}

export async function desfazerVenda(saleId: string) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (!(globalThis as any).session?.email) {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("desfazerVenda"), {
    signature: (globalThis as any).session.signature,
    saleId,
  });
}

export async function pagarVenda(saleId: string) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (
    !["administrador", "vendedor"].includes((globalThis as any).session?.type)
  ) {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("pagarVenda"), {
    signature: (globalThis as any).session.signature,
    saleId,
  });
}

export async function cancelarVenda(
  saleId: string,
  canceledItems?: SaleItem[],
) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (
    !["administrador", "vendedor"].includes((globalThis as any).session?.type)
  ) {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("cancelarVenda"), {
    signature: (globalThis as any).session.signature,
    saleId,
    canceledItems,
  });
}

export async function entregarVenda(
  saleId: string,
  consumedItems: Record<string, number | Record<string, number>>,
) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (!(globalThis as any).session?.type) {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("entregarVenda"), {
    signature: (globalThis as any).session.signature,
    saleId,
    consumedItems,
  });
}

export async function desfazerEntrega(saleId: string) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (
    !["administrador", "vendedor"].includes((globalThis as any).session?.type)
  ) {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("desfazerEntrega"), {
    signature: (globalThis as any).session.signature,
    saleId,
  });
}

export async function mudarIndicacao(saleId: string, referral: string) {
  if (Date.now() - lastRefresh > 1000 * 60 * 11) {
    window.location.reload();
    throw new Error("Session expired");
  }
  if (
    !["administrador", "vendedor"].includes((globalThis as any).session?.type)
  ) {
    throw new Error("Not allowed");
  }
  await axios.post(apiUrl("mudarIndicacao"), {
    signature: (globalThis as any).session.signature,
    saleId,
    referral,
  });
}

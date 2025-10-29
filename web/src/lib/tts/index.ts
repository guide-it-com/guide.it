export const listLanguages: () => Promise<
  { id: string; name: string }[]
> = async () => {
  throw new Error("Not implemented");
};

export const setLanguage: (id: string) => Promise<void> = async () => {
  throw new Error("Not implemented");
};

export const listVoices: () => Promise<
  { id: string; languageId: string; name: string }[]
> = async () => {
  throw new Error("Not implemented");
};

export const setVoice: (id: string) => Promise<void> = async () => {
  throw new Error("Not implemented");
};

export const speak: (
  message: string,
) => Promise<"done" | "stopped"> = async () => {
  throw new Error("Not implemented");
};

export const stop: () => Promise<boolean> = async () => {
  throw new Error("Not implemented");
};

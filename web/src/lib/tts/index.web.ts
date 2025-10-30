let voices: SpeechSynthesisVoice[];
const reloadVoices = () => {
  voices = (globalThis as typeof window).speechSynthesis?.getVoices?.() ?? [];
  voices.sort(
    (a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name),
  );
};
reloadVoices();
if ((globalThis as typeof window).speechSynthesis) {
  (globalThis as typeof window).speechSynthesis.onvoiceschanged = reloadVoices;
}
let voiceName: string;

export const listLanguages: () => Promise<
  {
    id: string;
    name: string;
  }[]
> = async () => {
  return Array.from(new Set(voices.map(({ lang }) => lang))).map((lang) => ({
    id: lang,
    name: lang,
  }));
};

export const setLanguage: (id: string) => Promise<void> = async () => {
  // noop
};

export const listVoices: () => Promise<
  { id: string; languageId: string; name: string }[]
> = async () => {
  return voices.map((voice) => ({
    id: voice.name,
    languageId: voice.lang,
    name: voice.name,
  }));
};

export const setVoice: (id: string) => Promise<void> = async (id) => {
  voiceName = id;
};

export const speak: (message: string) => Promise<"done" | "stopped"> = async (
  message,
) => {
  if (!voices.length) {
    throw new Error("TTS is not supported on this browser");
  }
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = voices.find(
    (voice) => voice.name === (voiceName || voices[0]?.name),
  )!;
  (globalThis as typeof window).speechSynthesis.speak(utterance);
  return new Promise((resolve) => {
    utterance.onend = () => resolve("done");
    utterance.onerror = () => resolve("stopped");
  });
};

export const stop: () => Promise<boolean> = async () => {
  (globalThis as typeof window).speechSynthesis.cancel();
  return true;
};

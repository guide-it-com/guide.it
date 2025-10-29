import Tts from "react-native-tts";
import type * as TTS from ".";

let resolveAudio: (status: "done" | "stopped") => void;
let resolvePlayingAudio: typeof resolveAudio;

Tts.removeAllListeners("tts-start");
Tts.addEventListener("tts-start", () => {
  if (!resolveAudio) return;
  resolvePlayingAudio = resolveAudio;
  resolveAudio = undefined as any;
});
Tts.removeAllListeners("tts-finish");
Tts.addEventListener("tts-finish", () => {
  if (!resolvePlayingAudio) return;
  resolvePlayingAudio("done");
  resolvePlayingAudio = undefined as any;
});
Tts.removeAllListeners("tts-cancel");
Tts.addEventListener("tts-cancel", () => {
  if (!resolvePlayingAudio) return;
  resolvePlayingAudio("stopped");
  resolvePlayingAudio = undefined as any;
});

const tts: typeof TTS = {
  listLanguages: async () =>
    Array.from(
      new Set((await Tts.voices()).map(({ language }) => language)),
    ).map((l) => ({
      id: l,
      name: l,
    })),
  setLanguage: async (id) => {
    await Tts.setDefaultLanguage(id);
  },
  listVoices: async () =>
    (await Tts.voices())
      .filter(({ notInstalled }) => !notInstalled)
      .map((voice) => ({
        id: voice.id,
        languageId: voice.language,
        name: voice.name,
      })),
  setVoice: async (id) => {
    await Tts.setDefaultVoice(id);
  },
  speak: async (message) => {
    Tts.speak(message);
    return new Promise((resolve) => {
      if (resolveAudio) resolveAudio("stopped");
      if (resolvePlayingAudio) resolvePlayingAudio("stopped");
      resolveAudio = resolve;
      resolvePlayingAudio = undefined as any;
    });
  },
  stop: () => Tts.stop(),
};

export const listLanguages = tts.listLanguages;
export const setLanguage = tts.setLanguage;
export const listVoices = tts.listVoices;
export const setVoice = tts.setVoice;
export const speak = tts.speak;
export const stop = tts.stop;

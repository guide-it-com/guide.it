import type * as TTS from ".";
import * as LinuxTTS from "./linux";

const tts: typeof TTS = {
  listLanguages: LinuxTTS.listLanguages,
  setLanguage: LinuxTTS.setLanguage,
  listVoices: LinuxTTS.listVoices,
  setVoice: LinuxTTS.setVoice,
  speak: LinuxTTS.speak,
  stop: LinuxTTS.stop,
};

export const listLanguages = tts.listLanguages;
export const setLanguage = tts.setLanguage;
export const listVoices = tts.listVoices;
export const setVoice = tts.setVoice;
export const speak = tts.speak;
export const stop = tts.stop;

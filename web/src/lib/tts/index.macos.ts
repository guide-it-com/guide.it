import { NativeModules } from "react-native";
import type * as TTS from ".";

const { TtsModule } = NativeModules;

if (!TtsModule) {
  throw new Error("TtsModule native module is not available");
}

export const listLanguages: typeof TTS.listLanguages = async () => {
  return await TtsModule.listLanguages();
};

export const setLanguage: typeof TTS.setLanguage = async (id: string) => {
  await TtsModule.setLanguage(id);
};

export const listVoices: typeof TTS.listVoices = async () => {
  return await TtsModule.listVoices();
};

export const setVoice: typeof TTS.setVoice = async (id: string) => {
  await TtsModule.setVoice(id);
};

export const speak: typeof TTS.speak = async (message: string) => {
  return await TtsModule.speak(message);
};

export const stop: typeof TTS.stop = async () => {
  return await TtsModule.stop();
};

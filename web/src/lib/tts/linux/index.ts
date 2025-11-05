import { PiperTTS, TextSplitterStream } from "tts-pipelines";
import voices from "./voices.json";

// Type definitions
interface VoiceFile {
  size_bytes: number;
  md5_digest: string;
}

interface VoiceLanguage {
  code: string;
  family: string;
  region: string;
  name_native: string;
  name_english: string;
  country_english: string;
}

interface Voice {
  key: string;
  name: string;
  language: VoiceLanguage;
  quality: string;
  num_speakers: number;
  speaker_id_map: Record<string, unknown>;
  files: Record<string, VoiceFile>;
  aliases: string[];
}

type VoicesData = Record<string, Voice>;

// State management
let currentLanguageId: string | null = null;
let currentVoiceId: string | null = null;
let currentTTS: PiperTTS | null = null;
let isStopped = false;
let currentAudio: HTMLAudioElement | null = null;
let currentResolve: ((value: "stopped" | "done") => void) | null = null;
let currentAudioCleanup: (() => void) | null = null;

const voiceToPretrained = (voice: Voice): string[] => {
  return Object.keys(voice.files)
    .slice(0, 2)
    .map(
      (p) => `https://huggingface.co/rhasspy/piper-voices/resolve/main/${p}`,
    );
};

/**
 * Get a unique list of languages from the voices data
 */
export const listLanguages = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  const languagesMap = new Map<string, { id: string; name: string }>();

  const voicesData = voices as VoicesData;
  for (const voiceKey in voicesData) {
    const voice = voicesData[voiceKey];
    const langCode = voice.language.code;
    if (!languagesMap.has(langCode)) {
      languagesMap.set(langCode, {
        id: langCode,
        name: `${voice.language.name_english} - ${voice.language.name_native} (${voice.language.country_english})`,
      });
    }
  }

  return Array.from(languagesMap.values());
};

/**
 * Set the current language
 */
export const setLanguage = async (id: string): Promise<void> => {
  currentLanguageId = id;
  // Reset voice when language changes
  currentVoiceId = null;
  currentTTS = null;
};

/**
 * Get list of voices
 */
export const listVoices = async (): Promise<
  Array<{ id: string; languageId: string; name: string }>
> => {
  const result: Array<{ id: string; languageId: string; name: string }> = [];

  const voicesData = voices as VoicesData;
  for (const voiceKey in voicesData) {
    const voice = voicesData[voiceKey];
    const firstFile = Object.values(voice.files)[0];
    const sizeMB = firstFile
      ? Math.round(firstFile.size_bytes / 1024 / 1024)
      : 0;

    result.push({
      id: voice.key,
      languageId: voice.language.code,
      name: `${voice.name} (${voice.quality}, ${sizeMB}MB)`,
    });
  }

  return result;
};

/**
 * Set the current voice
 */
export const setVoice = async (id: string): Promise<void> => {
  const voicesData = voices as VoicesData;
  if (!voicesData[id]) {
    throw new Error(`Voice with id "${id}" not found`);
  }

  currentVoiceId = id;
  currentTTS = null; // Reset TTS instance, will be lazy-loaded
};

/**
 * Initialize TTS instance if needed
 */
const ensureTTS = async (): Promise<PiperTTS> => {
  if (currentTTS) {
    return currentTTS;
  }

  const voicesData = voices as VoicesData;
  if (!currentLanguageId) {
    const firstVoice = Object.values(voicesData).find(() => true);
    if (!firstVoice) {
      throw new Error("No voices available");
    }
    currentLanguageId = firstVoice.language.code;
  }

  if (!currentVoiceId) {
    const matchingVoice = Object.values(voicesData).find(
      (voice) => voice.language.code === currentLanguageId,
    );
    if (!matchingVoice) {
      throw new Error(`No voice found for language "${currentLanguageId}"`);
    }
    currentVoiceId = matchingVoice.key;
  }

  const voice = voicesData[currentVoiceId];
  if (!voice) {
    throw new Error(`Voice "${currentVoiceId}" not found`);
  }

  currentTTS = await PiperTTS.from_pretrained(...voiceToPretrained(voice));

  return currentTTS;
};

/**
 * Generate and return audio from text
 */
export const speak = async (message: string): Promise<"stopped" | "done"> => {
  // Stop any previously playing audio and clean it up properly
  const prevCleanup = currentAudioCleanup;
  if (prevCleanup) {
    prevCleanup();
    currentAudioCleanup = null;
  }
  if (currentResolve) {
    const resolve = currentResolve;
    currentResolve = null;
    resolve("stopped");
  }

  isStopped = false;

  try {
    const tts = await ensureTTS();

    const streamer = new TextSplitterStream();
    streamer.push(message);
    streamer.close(); // Indicate we won't add more text

    const stream = tts.stream(streamer);

    // Process the stream
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _chunk of stream) {
      if (isStopped) {
        return "stopped";
      }
    }

    // Merge audio and generate blob
    const audioData = tts.merge_audio();
    tts.clearAudio();
    if (!audioData) {
      return "done";
    }

    const blob = audioData.toBlob();

    // Check if stopped during blob generation
    if (isStopped) {
      return "stopped";
    }

    // Create audio element and play
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    currentAudio = audio;

    // Create promise that resolves when audio finishes or is stopped
    const playPromise = new Promise<"stopped" | "done">((resolve) => {
      currentResolve = resolve;

      let isCleanedUp = false;
      const cleanup = () => {
        if (isCleanedUp) {
          return;
        }
        isCleanedUp = true;
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        if (currentAudio === audio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio = null;
        }
        if (currentAudioCleanup === cleanup) {
          currentAudioCleanup = null;
        }
        if (audio.src?.startsWith("blob:")) {
          URL.revokeObjectURL(audio.src);
        }
      };

      const onEnded = () => {
        cleanup();
        if (isStopped) {
          resolve("stopped");
        } else {
          resolve("done");
        }
        if (currentResolve === resolve) {
          currentResolve = null;
        }
      };

      const onError = () => {
        cleanup();
        resolve("done"); // Resolve as done even on error
        if (currentResolve === resolve) {
          currentResolve = null;
        }
      };

      // Store cleanup function so it can be called when a new speak starts
      currentAudioCleanup = cleanup;

      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      // Start playing
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        cleanup();
        resolve("done");
        if (currentResolve === resolve) {
          currentResolve = null;
        }
      });
    });

    const result = await playPromise;
    currentResolve = null;

    isStopped = false;
    return result;
  } catch (error) {
    console.error("Error during TTS generation:", error);
    const cleanup = currentAudioCleanup;
    if (cleanup) {
      cleanup();
      currentAudioCleanup = null;
    }
    if (currentAudio) {
      currentAudio = null;
    }
    currentResolve = null;
    throw error;
  }
};

/**
 * Stop any ongoing TTS generation
 */
export const stop = async (): Promise<boolean> => {
  const wasActive = !isStopped || currentAudio !== null;

  // Clean up current audio properly
  const cleanup = currentAudioCleanup;
  if (cleanup) {
    cleanup();
    currentAudioCleanup = null;
  }

  // Resolve the promise if audio is playing
  if (currentResolve) {
    const resolve = currentResolve;
    currentResolve = null;
    resolve("stopped");
  }

  isStopped = true;
  return wasActive;
};

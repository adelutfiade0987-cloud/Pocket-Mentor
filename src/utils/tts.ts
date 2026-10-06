// Audio helper for Gemini 3.8 Flash TTS narration and speech synthesis

let currentAudio: HTMLAudioElement | null = null;

export async function playTextToSpeech(
  text: string,
  options?: {
    voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
    style?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<() => void> {
  // Stop any currently playing audio
  stopAudioPlayback();

  try {
    options?.onStart?.();

    // Call server endpoint for gemini-3.8-flash-tts
    const res = await fetch('/api/mentor/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceName: options?.voiceName || 'Puck',
        style: options?.style || 'Warm, expressive, encouraging older mentor',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        const audio = new Audio(audioSrc);
        currentAudio = audio;

        audio.onended = () => {
          options?.onEnd?.();
          currentAudio = null;
        };
        audio.onerror = () => {
          fallbackSpeech(text, options);
        };

        await audio.play();
        return () => stopAudioPlayback();
      }
    }

    // Fallback if server returned non-200 or no audio
    fallbackSpeech(text, options);
  } catch (err) {
    console.warn('Gemini TTS server call error, falling back to Web Speech API:', err);
    fallbackSpeech(text, options);
  }

  return () => stopAudioPlayback();
}

export function stopAudioPlayback() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function fallbackSpeech(text: string, options?: { onStart?: () => void; onEnd?: () => void; onError?: (err: any) => void }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.('Speech not supported');
    return;
  }

  const cleanText = text.replace(/[#*`_~]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Prefer Indonesian or warm English voice
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find((v) => v.lang.startsWith('id') || v.name.includes('Indonesia'));
  if (idVoice) {
    utterance.voice = idVoice;
  }

  utterance.onend = () => {
    options?.onEnd?.();
  };
  utterance.onerror = (e) => {
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}

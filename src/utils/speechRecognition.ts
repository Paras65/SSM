/**
 * Cross-browser Speech Recognition Utility for SSM ERP
 * Centralizes Web Speech API detection, configuration and lifecycle handling (DRY Architecture).
 */

export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

/**
 * Checks if the browser supports speech recognition (Web Speech API).
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Creates and initializes a cross-browser SpeechRecognition instance.
 */
export function createSpeechRecognitionInstance(options: SpeechRecognitionOptions = {}) {
  if (typeof window === 'undefined') return null;
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.lang = options.lang || 'hi-IN';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? false;

    if (options.onStart) recognition.onstart = options.onStart;
    if (options.onError) recognition.onerror = options.onError;
    if (options.onEnd) recognition.onend = options.onEnd;

    if (options.onResult) {
      recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        options.onResult!(transcript.trim(), isFinal);
      };
    }

    return recognition;
  } catch {
    return null;
  }
}


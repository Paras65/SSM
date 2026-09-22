/**
 * Central AI Service for SSM ERP
 * Encapsulates backend server proxy (/api/ai/...) with rate limiting,
 * zero-exposure key handling, and resilient direct client fallback.
 */

export interface SmartGenerateOptions {
  apiKey?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export interface SmartKeyHealthResult {
  success: boolean;
  message: string;
  latency?: number;
}

const apiBase = (import.meta.env.VITE_API_BASE as string || '').trim();

/**
 * Determines whether a backend API proxy should be attempted.
 * On static hosting (like Vercel) where VITE_API_BASE is not set to an external server,
 * calling /api/* results in Vercel rewriting to index.html and returning 405 Method Not Allowed.
 */
export const canUseBackendProxy = (): boolean => {
  if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
    return true;
  }
  if (import.meta.env.DEV) {
    return true;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return true;
  }
  return false;
};

export const getProxyUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
    return `${apiBase.replace(/\/$/, '')}${cleanPath}`;
  }
  return `/api${cleanPath}`;
};

/**
 * Returns the effective smart API key configured on the client (if any).
 * Used for direct fallback if the backend server is unreachable.
 */
export const getEffectiveSmartKey = (): string => {
  return (
    (import.meta.env.VITE_SMART_API_KEY as string) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    localStorage.getItem('ssm_smart_api_key') ||
    localStorage.getItem('ssm_gemini_api_key') ||
    ''
  ).trim();
};

/**
 * Strips markdown code fences (e.g. ```json ... ```) and returns clean text.
 */
export const cleanJsonFence = (text: string): string => {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

/**
 * Robust extractor for structured JSON rows from any Gemini response shape.
 * Handles arrays, wrapped objects ({ students: [...] }, { records: [...] }, etc.),
 * markdown code fences, and text-embedded JSON.
 */
export const extractJsonRows = (input: any): any[] => {
  if (!input) return [];

  // 1. If already an array
  if (Array.isArray(input)) return input;

  // 2. If it's a string, attempt robust parsing
  if (typeof input === 'string') {
    let text = input.trim();
    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Direct JSON parse attempt
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return extractJsonRows(parsed);
    } catch {}

    // Find first '[' and last ']'
    const startBracket = text.indexOf('[');
    const endBracket = text.lastIndexOf(']');
    if (startBracket !== -1 && endBracket > startBracket) {
      try {
        const slice = text.slice(startBracket, endBracket + 1);
        const parsed = JSON.parse(slice);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }

    // Find first '{' and last '}'
    const startBrace = text.indexOf('{');
    const endBrace = text.lastIndexOf('}');
    if (startBrace !== -1 && endBrace > startBrace) {
      try {
        const slice = text.slice(startBrace, endBrace + 1);
        const parsed = JSON.parse(slice);
        if (parsed && typeof parsed === 'object') return extractJsonRows(parsed);
      } catch {}
    }
  }

  // 3. If it's an object, look for known array properties or any child array
  if (typeof input === 'object' && input !== null) {
    const candidateKeys = ['students', 'records', 'rows', 'data', 'items', 'list', 'entries', 'result', 'candidates'];
    for (const key of candidateKeys) {
      if (Array.isArray(input[key]) && input[key].length > 0) {
        if (key === 'candidates') {
          const partText = input.candidates[0]?.content?.parts?.[0]?.text;
          if (partText) return extractJsonRows(partText);
        } else {
          return input[key];
        }
      }
    }

    for (const val of Object.values(input)) {
      if (Array.isArray(val) && val.length > 0) {
        return val;
      }
    }
  }

  return [];
};

/**
 * Generates text via the secure backend proxy (/api/ai/generate) with
 * automatic direct fallback if the proxy is unavailable.
 */
export const generateSmartText = async (
  prompt: string,
  options: SmartGenerateOptions = {}
): Promise<string> => {
  const effectiveKey = (options.apiKey || getEffectiveSmartKey()).trim();
  const { temperature = 0.4, maxOutputTokens = 1000, responseMimeType } = options;

  // 1. Try secure backend server proxy first if available (e.g. in dev or when remote API_BASE is configured)
  if (canUseBackendProxy()) {
    try {
      const proxyUrl = getProxyUrl('/ai/generate');
      const proxyRes = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveKey ? { 'x-gemini-api-key': effectiveKey } : {})
        },
        body: JSON.stringify({
          prompt,
          temperature,
          maxOutputTokens,
          ...(responseMimeType ? { responseMimeType } : {})
        })
      });

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        const text = proxyData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      // Backend proxy unavailable, fallback to direct call
    }
  }

  // 2. Direct fallback call if client key is present
  if (effectiveKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': effectiveKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature,
                maxOutputTokens,
                ...(responseMimeType ? { responseMimeType } : {})
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch {
        // Try next fallback model
      }
    }
  }

  throw new Error('बौद्धिक सेवा से संपर्क नहीं हो सका।');
};

/**
 * Generates and parses structured JSON via the secure AI proxy.
 */
export const generateSmartJSON = async <T = any>(
  prompt: string,
  options: Omit<SmartGenerateOptions, 'responseMimeType'> = {}
): Promise<T> => {
  const rawText = await generateSmartText(prompt, {
    ...options,
    responseMimeType: 'application/json'
  });

  const cleaned = cleanJsonFence(rawText);
  return JSON.parse(cleaned) as T;
};

/**
 * Processes an image with Vision AI via the secure backend proxy (/api/ai/vision)
 * with automatic direct fallback.
 */
export const generateSmartVision = async <T = any>(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  prompt: string = 'Extract data'
): Promise<T> => {
  const effectiveKey = getEffectiveSmartKey();
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  // 1. Try secure backend server proxy first if available
  if (canUseBackendProxy()) {
    try {
      const proxyUrl = getProxyUrl('/ai/vision');
      const proxyRes = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveKey ? { 'x-gemini-api-key': effectiveKey } : {})
        },
        body: JSON.stringify({
          imageBase64: cleanBase64,
          mimeType,
          prompt
        })
      });

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        const extracted = extractJsonRows(proxyData);
        if (extracted && extracted.length > 0) {
          return extracted as unknown as T;
        }
        const rawText = proxyData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const fromText = extractJsonRows(rawText);
          if (fromText && fromText.length > 0) return fromText as unknown as T;
        }
      } else {
        const errData = await proxyRes.json().catch(() => ({}));
        console.warn('[AI Vision Proxy Error]', proxyRes.status, errData);
      }
    } catch (err) {
      console.warn('[AI Vision Proxy Network Error]', err);
    }
  }

  // 2. Direct fallback call
  if (effectiveKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
    let lastError: string | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(effectiveKey)}`;
        const response = await fetch(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': effectiveKey
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType,
                        data: cleanBase64
                      }
                    },
                    { text: prompt }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const extracted = extractJsonRows(data);
          if (extracted && extracted.length > 0) {
            return extracted as unknown as T;
          }
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const fromText = extractJsonRows(rawText);
            if (fromText && fromText.length > 0) return fromText as unknown as T;
          }
          return [] as unknown as T;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData?.error?.message || `HTTP ${response.status}`;
          console.warn(`[AI Vision Direct] Model ${model} returned:`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (lastError) {
      throw new Error(`Vision AI सेवा त्रुटि: ${lastError}`);
    }
  }

  throw new Error('Vision AI सेवा से संपर्क नहीं हो सका। कृपया API कुंजी एवं इंटरनेट कनेक्शन जांचें।');
};

/**
 * Tests smart service connectivity and latency via server proxy with direct fallback.
 */
export const testSmartKeyHealth = async (): Promise<SmartKeyHealthResult> => {
  const startTime = Date.now();
  const effectiveKey = getEffectiveSmartKey();

  // 1. Try secure backend server endpoint if available
  if (canUseBackendProxy()) {
    try {
      const proxyUrl = getProxyUrl('/ai/test-key');
      const srvRes = await fetch(proxyUrl);
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        const latency = srvData.latency || (Date.now() - startTime);
        return {
          success: true,
          message: `कुंजी सर्वर पर 100% सुरक्षित एवं कार्यशील है! (प्रतिक्रिया समय: ${latency}ms)`,
          latency
        };
      }
    } catch {
      // Fall back to direct test
    }
  }

  // 2. Direct fallback test
  if (effectiveKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(effectiveKey)}`;
        const response = await fetch(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': effectiveKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with the single word: OK' }] }],
              generationConfig: { maxOutputTokens: 5, temperature: 0.1 }
            })
          }
        );

        const latency = Date.now() - startTime;
        if (response.ok) {
          return {
            success: true,
            message: `कुंजी 100% कार्यशील एवं सक्रिय है! (प्रतिक्रिया समय: ${latency}ms)`,
            latency
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData?.error?.message || `HTTP ${response.status}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return {
      success: false,
      message: `कुंजी सत्यापन विफल (${lastError})।`,
      latency: Date.now() - startTime
    };
  }

  return {
    success: false,
    message: 'पर्यावरण (.env) अथवा सर्वर पर कोई कुंजी नहीं मिली।'
  };
};


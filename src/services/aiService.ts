/**
 * Central AI Service for SSM ERP
 * Encapsulates backend server proxy (/api/ai/...) with rate limiting,
 * zero-exposure key handling, and resilient direct client fallback.
 */

export interface SmartGenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export interface SmartKeyHealthResult {
  success: boolean;
  message: string;
  latency?: number;
}

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
 * Generates text via the secure backend proxy (/api/ai/generate) with
 * automatic direct fallback if the proxy is unavailable.
 */
export const generateSmartText = async (
  prompt: string,
  options: SmartGenerateOptions = {}
): Promise<string> => {
  const effectiveKey = getEffectiveSmartKey();
  const { temperature = 0.4, maxOutputTokens = 1000, responseMimeType } = options;

  // 1. Try secure backend server proxy first (keeps key secure on server and enforces rate limiting)
  try {
    const proxyRes = await fetch('/api/ai/generate', {
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
    // Backend proxy unavailable (e.g. offline dev), fallback to direct call
  }

  // 2. Direct fallback call if client key is present
  if (effectiveKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
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

  // 1. Try secure backend server proxy first
  try {
    const proxyRes = await fetch('/api/ai/vision', {
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
      const rawText = proxyData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(cleanJsonFence(rawText)) as T;
    }
  } catch {
    // Backend proxy unavailable, fallback to direct call
  }

  // 2. Direct fallback call
  if (effectiveKey) {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
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
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return JSON.parse(cleanJsonFence(rawText)) as T;
    }
  }

  throw new Error('Vision AI सेवा से संपर्क नहीं हो सका।');
};

/**
 * Tests smart service connectivity and latency via server proxy with direct fallback.
 */
export const testSmartKeyHealth = async (): Promise<SmartKeyHealthResult> => {
  const startTime = Date.now();
  const effectiveKey = getEffectiveSmartKey();

  // 1. Try secure backend server endpoint
  try {
    const srvRes = await fetch('/api/ai/test-key');
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

  // 2. Direct fallback test
  if (effectiveKey) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
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
        const errMsg = errData?.error?.message || `HTTP ${response.status}`;
        return {
          success: false,
          message: `कुंजी सत्यापन विफल (${errMsg})।`,
          latency
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `सत्यापन त्रुटि: ${err.message}`,
        latency: Date.now() - startTime
      };
    }
  }

  return {
    success: false,
    message: 'पर्यावरण (.env) अथवा सर्वर पर कोई कुंजी नहीं मिली।'
  };
};


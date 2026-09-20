const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Strict Rate Limiting: Max 30 requests per 1 minute per IP to prevent DoS / quota exhaustion attacks
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'बौद्धिक सेवा गति सीमा (Rate Limit) पार हो गई है। कृपया 1 मिनट बाद पुनः प्रयास करें।' },
  skip: () => process.env.NODE_ENV === 'test'
});

const getEffectiveServerKey = (req) => {
  return (
    process.env.SMART_API_KEY ||
    process.env.VITE_SMART_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    req.headers['x-gemini-api-key'] ||
    req.headers['x-goog-api-key'] ||
    ''
  ).trim();
};

// POST /api/ai/generate (Generic text / JSON generation)
router.post('/generate', aiLimiter, async (req, res) => {
  try {
    const { prompt, temperature = 0.4, maxOutputTokens = 1000, responseMimeType } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'प्रॉम्प्ट (prompt) अनिवार्य है।' });
    }

    const apiKey = getEffectiveServerKey(req);
    if (!apiKey) {
      return res.status(503).json({ error: 'सर्वर पर कोई बौद्धिक सेवा कुंजी विन्यासित नहीं है।' });
    }

    const generationConfig = {
      temperature,
      maxOutputTokens
    };
    if (responseMimeType) {
      generationConfig.responseMimeType = responseMimeType;
    }

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          return res.json(data);
        } else {
          const errBody = await response.json().catch(() => ({}));
          lastError = errBody?.error?.message || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    return res.status(502).json({ error: lastError || 'Google AI सेवा से संपर्क नहीं हो सका।' });
  } catch (err) {
    return res.status(500).json({ error: 'आंतरिक सर्वर त्रुटि: ' + err.message });
  }
});

// POST /api/ai/generate-question-paper (Automated question paper generator)
router.post('/generate-question-paper', aiLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'प्रॉम्प्ट (prompt) अनिवार्य है।' });
    }

    const apiKey = getEffectiveServerKey(req);
    if (!apiKey) {
      return res.status(503).json({ error: 'सर्वर पर कोई बौद्धिक सेवा कुंजी विन्यासित नहीं है।' });
    }

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          return res.json(JSON.parse(cleanJson));
        } else {
          const errBody = await response.json().catch(() => ({}));
          lastError = errBody?.error?.message || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    return res.status(502).json({ error: lastError || 'प्रश्न पत्र निर्माण में विफलता' });
  } catch (err) {
    return res.status(500).json({ error: 'आंतरिक सर्वर त्रुटि: ' + err.message });
  }
});

// POST /api/ai/vision (Image OCR / Register scanner)
router.post('/vision', aiLimiter, async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'छवि डेटा (imageBase64) अनिवार्य है।' });
    }

    const apiKey = getEffectiveServerKey(req);
    if (!apiKey) {
      return res.status(503).json({ error: 'सर्वर पर कोई बौद्धिक सेवा कुंजी विन्यासित नहीं है।' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
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
                { text: prompt || 'Extract student details' }
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

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errBody?.error?.message || 'Vision API त्रुटि' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Vision API विफलता: ' + err.message });
  }
});

// GET /api/ai/test-key (Live test endpoint for Super Admin)
router.get('/test-key', aiLimiter, async (req, res) => {
  const startTime = Date.now();
  const apiKey = getEffectiveServerKey(req);

  if (!apiKey) {
    return res.status(404).json({
      success: false,
      message: 'सर्वर (.env) में कोई स्मार्ट सेवा कुंजी विन्यासित नहीं है।'
    });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the single word: OK' }] }],
          generationConfig: { maxOutputTokens: 5, temperature: 0.1 }
        })
      }
    );

    const latency = Date.now() - startTime;

    if (response.ok) {
      return res.json({
        success: true,
        message: `कुंजी सर्वर पर 100% सुरक्षित एवं कार्यशील है!`,
        latency
      });
    } else {
      const errData = await response.json().catch(() => ({}));
      return res.status(400).json({
        success: false,
        message: errData?.error?.message || `HTTP ${response.status}`,
        latency
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      latency: Date.now() - startTime
    });
  }
});

module.exports = router;

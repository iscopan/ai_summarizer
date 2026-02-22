require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Validate required environment variables ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';

if (!OPENROUTER_API_KEY) {
    console.error('[FATAL] OPENROUTER_API_KEY is not set. Exiting.');
    process.exit(1);
}

// --- Constants ---
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_TEXT_LENGTH = 15_000;
const MAX_TOKENS = 400;

// --- CORS: only allow requests from the Chrome extension ---
// The origin for a published extension is chrome-extension://<extension-id>
// Set ALLOWED_EXTENSION_ORIGIN in .env once you have the extension ID from the Web Store.
// Leave empty to allow all origins during development.
const ALLOWED_ORIGIN = process.env.ALLOWED_EXTENSION_ORIGIN || '*';
app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['POST'],
}));

// --- Body parser ---
app.use(express.json({ limit: '100kb' }));

// --- Rate limiting: max 30 requests per 10 minutes per IP ---
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});
app.use('/api/', limiter);

// --- Health check ---
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

// --- Map BCP-47 language tags to natural language names ---
const LANG_NAMES = {
    es: 'Spanish', en: 'English', fr: 'French', de: 'German',
    it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
    ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
    ar: 'Arabic', tr: 'Turkish', sv: 'Swedish', da: 'Danish',
    fi: 'Finnish', nb: 'Norwegian', ca: 'Catalan', eu: 'Basque',
    gl: 'Galician',
};

// --- Main summarize endpoint ---
app.post('/api/summarize', async (req, res) => {
    const { text, lang } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or invalid "text" field in request body.' });
    }

    // Normalise BCP-47 tag: "es-ES" → "es"
    const baseLang = (typeof lang === 'string' ? lang.split('-')[0].toLowerCase() : '');
    const langName = LANG_NAMES[baseLang];

    const truncated = text.length > MAX_TEXT_LENGTH
        ? text.substring(0, MAX_TEXT_LENGTH) + '...'
        : text;

    // Explicit language instruction when known; heuristic fallback otherwise.
    const languageInstruction = langName
        ? `You MUST write the summary in ${langName}. Do not use any other language.`
        : 'Detect the language of the text and write the summary in that exact same language. Never default to English.';

    const prompt = `You are an expert assistant that summarizes web page content.

${languageInstruction}

Summarize the following text concisely and clearly. Reply with plain text only — no markdown, no bullet points, no headers, no bold or italic formatting of any kind.

Text to summarize:
"${truncated}"`;

    try {
        const openRouterRes = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://github.com/iscopan/ai-summarizer',
                'X-Title': 'AI Summarizer Extension',
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: MAX_TOKENS,
                temperature: 0.5,
            }),
        });

        const data = await openRouterRes.json();

        if (!openRouterRes.ok) {
            let msg = `OpenRouter API Error ${openRouterRes.status}`;
            if (data?.error?.message) msg += `: ${data.error.message}`;
            console.error('[OpenRouter Error]', msg);

            if (openRouterRes.status === 429) {
                return res.status(429).json({ error: 'AI service rate limit reached. Please try again later.' });
            }
            return res.status(502).json({ error: msg });
        }

        const summary = data?.choices?.[0]?.message?.content?.trim();
        if (!summary) {
            const reason = data?.choices?.[0]?.finish_reason || 'unknown';
            return res.status(502).json({ error: `No summary returned. Finish reason: ${reason}` });
        }

        return res.json({ summary });

    } catch (err) {
        console.error('[Fetch Error]', err);
        return res.status(500).json({ error: 'Internal server error while contacting the AI service.' });
    }
});

// --- 404 fallback ---
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
    console.log(`[AI Summarizer Backend] Running on port ${PORT}`);
    console.log(`  Model   : ${OPENROUTER_MODEL}`);
    console.log(`  CORS    : ${ALLOWED_ORIGIN}`);
});

// Load API key from config.js (gitignored, never committed to GitHub).
// Falls back to empty string if config.js is missing (fresh clone / dev without key).
// See config.example.js for the template.
var CONFIG = { apiKey: '' };
try { importScripts('config.js'); } catch (e) { /* config.js not present */ }

// --- AI Settings ---
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';
const MAX_TEXT_LENGTH = 15000;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    (async () => {
      try {
        const summary = await callOpenRouter(request.text);
        sendResponse({ summary });
      } catch (error) {
        console.error("Background: Error calling AI:", error);
        sendResponse({ error: error.message || "Unknown error contacting the API." });
      }
    })();
    return true; // async sendResponse
  }
});

async function callOpenRouter(text) {
  const truncatedText = text.length > MAX_TEXT_LENGTH
    ? text.substring(0, MAX_TEXT_LENGTH) + "..."
    : text;

  const prompt = `You are an expert assistant in summarizing web page content. Summarize the following text concisely and clearly, in the same language as the original content. Reply with plain text only — no markdown, no bullet points, no headers, no bold or italic formatting of any kind.\n\n"${truncatedText}"`;

  const headers = {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://github.com/iscopan/ai-summarizer',
    'X-Title': 'AI Summarizer Extension',
  };

  if (CONFIG.apiKey) {
    headers['Authorization'] = `Bearer ${CONFIG.apiKey}`;
  }

  const requestBody = {
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 400,
    temperature: 0.5,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    let msg = `API Error ${response.status}`;
    if (data?.error?.message) msg += `: ${data.error.message}`;
    if (response.status === 401) throw new Error("API key invalid or missing. Check config.js.");
    if (response.status === 429) throw new Error("Rate limit reached. Please try again later.");
    throw new Error(msg);
  }

  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    const reason = data?.choices?.[0]?.finish_reason || 'unknown';
    throw new Error(`No summary returned. Finish reason: ${reason}`);
  }

  return content;
}

// Open options page on first install
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

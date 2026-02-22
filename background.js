/* eslint-env serviceworker */

// ---------------------------------------------------------------------------
// Backend proxy URL — update this to your deployed backend URL before packing.
// ---------------------------------------------------------------------------
const BACKEND_URL = 'https://aisummarizer.fpuente.com/api/summarize';

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    (async () => {
      try {
        const summary = await callBackend(request.text);
        sendResponse({ summary });
      } catch (error) {
        console.error('Background: Error calling backend:', error);
        sendResponse({ error: error.message || 'Unknown error contacting the summarizer.' });
      }
    })();
    return true; // keep message channel open for async response
  }
});

async function callBackend(text) {
  let response;
  try {
    response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (networkError) {
    throw new Error('Could not reach the summarizer service. Check your internet connection.');
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error || `Server error ${response.status}`;
    if (response.status === 429) throw new Error('Rate limit reached. Please wait a few minutes and try again.');
    throw new Error(msg);
  }

  if (!data.summary) throw new Error('No summary returned by the server.');
  return data.summary;
}

// Open options page on first install
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

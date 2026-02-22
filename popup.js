const summarizeBtn = document.getElementById('summarizeBtn');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');
const statusDiv = document.getElementById('status');
const summaryDiv = document.getElementById('summary');
const summaryCard = document.getElementById('summary-card');
const copyBtn = document.getElementById('copyBtn');

// Shorthand for i18n
const t = (key) => chrome.i18n.getMessage(key) || key;

// Apply i18n to static UI elements
function applyI18n() {
  document.getElementById('btnText').textContent = t('summarizeBtn');
  document.getElementById('summaryLabel').textContent = t('summaryLabel');
  document.getElementById('copyBtn').title = t('copy');
  document.getElementById('footerFree').textContent = t('freeToUse');
  document.getElementById('footerDonate').textContent = t('donate');
}

function setStatus(type, html) {
  statusDiv.className = type || '';
  statusDiv.innerHTML = html;
}

function setLoading(loading) {
  summarizeBtn.disabled = loading;
  if (loading) {
    btnIcon.className = 'spinner';
    btnIcon.textContent = '';
    btnText.textContent = t('summarizing');
  } else {
    btnIcon.className = '';
    btnIcon.textContent = '⚡';
    btnText.textContent = t('summarizeBtn');
  }
}

function extractPageContent() {
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  return main.innerText;
}

copyBtn.addEventListener('click', () => {
  const text = summaryDiv.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '✅';
      setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
    });
  }
});

summarizeBtn.addEventListener('click', () => {
  setStatus('loading', `<span class="spinner"></span> ${t('extracting')}`);
  summaryCard.classList.remove('visible');
  summaryDiv.textContent = '';
  setLoading(true);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) {
      setStatus('error', `❌ ${t('errNoTab')}`);
      setLoading(false);
      return;
    }

    chrome.scripting.executeScript(
      { target: { tabId: tabs[0].id }, function: extractPageContent },
      (results) => {
        if (chrome.runtime.lastError || !results?.length) {
          setStatus('error', `❌ ${t('errRead')} ${chrome.runtime.lastError?.message || ''}`);
          setLoading(false);
          return;
        }

        const pageText = results[0].result;
        if (!pageText?.trim()) {
          setStatus('error', `❌ ${t('errNoContent')}`);
          setLoading(false);
          return;
        }

        setStatus('loading', `<span class="spinner"></span> ${t('sendingToAI')}`);

        chrome.runtime.sendMessage({ action: 'summarize', text: pageText }, (response) => {
          setLoading(false);

          if (chrome.runtime.lastError) {
            setStatus('error', `❌ ${chrome.runtime.lastError.message}`);
            return;
          }

          if (response?.summary) {
            setStatus('success', `✅ ${t('done')}`);
            summaryDiv.textContent = response.summary;
            summaryCard.classList.add('visible');
          } else if (response?.error) {
            const msg = response.error;
            const isRateLimit = msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('429');
            setStatus('error',
              `❌ ${msg}${isRateLimit ? ` <a href="options.html" target="_blank">${t('errRateLimit')}</a>` : ''}`
            );
          } else {
            setStatus('error', `❌ ${t('errUnexpected')}`);
          }
        });
      }
    );
  });
});

document.addEventListener('DOMContentLoaded', applyI18n);

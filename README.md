<div align="center">
  <img src="icons/icon128.png" alt="AI Summarizer icon" width="96">
  <h1>AI Summarizer</h1>
  <p>A Chrome extension that summarizes any webpage in seconds using AI — completely free, no setup required.</p>
  <p>Built on <a href="https://openrouter.ai">OpenRouter</a> using the <code>openrouter/free</code> model router.</p>

  <a href="https://github.com/iscopan/ai-summarizer/blob/main/LICENSE"><img alt="License: CC BY-NC-SA 4.0" src="https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg"></a>
  <a href="https://github.com/iscopan/ai_summarizer/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/iscopan/ai_summarizer/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="Manifest v3" src="https://img.shields.io/badge/Manifest-v3-blue">
  <img alt="Free to use" src="https://img.shields.io/badge/Free-No%20setup%20needed-teal">
</div>

---

## ✨ Features

- **Works instantly** — no account, no API key, no configuration
- **Powered by [OpenRouter](https://openrouter.ai)** — uses the `openrouter/free` model router under the hood
- **Any webpage** — articles, blogs, documentation, news, and more
- **Multilingual** — summaries are generated in the same language as the page
- **Copy to clipboard** — one click to copy the generated summary
- **Modern dark UI** — clean teal-themed popup and settings page

## 🚀 Installation (from source)

> Chrome Web Store listing coming soon. In the meantime, load it manually:

1. Clone this repository:
   ```bash
   git clone https://github.com/iscopan/ai-summarizer.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. The extension icon will appear in your toolbar — you're ready to go!

## 🛠️ Development

```bash
# No build step needed — plain HTML/CSS/JS
# Edit files and reload the extension in chrome://extensions
```

### Project structure

```
ai_summarizer/
├── manifest.json       # Extension manifest (v3)
├── background.js       # Service worker — calls OpenRouter API (openrouter/free model)
├── popup.html/js       # Extension popup UI
├── options.html/js     # Settings page
├── icons/              # Extension icons (16, 48, 128 px)
└── .github/workflows/  # CI pipeline
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## ❤️ Support

If this extension saves you time, consider [donating via PayPal](https://paypal.me/iscopan).

## 📄 License

[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE) (CC BY-NC-SA 4.0)

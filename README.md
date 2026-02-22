<div align="center">
  <img src="icons/icon128.png" alt="AI Summarizer icon" width="96">
  <h1>AI Summarizer</h1>
  <p>A Chrome extension that summarizes any webpage in seconds using AI — completely free, no setup required.</p>
  <p>Powered by <a href="https://openrouter.ai">OpenRouter</a> via a self-hosted backend proxy.</p>

  <a href="https://github.com/iscopan/ai-summarizer/blob/main/LICENSE"><img alt="License: CC BY-NC-SA 4.0" src="https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg"></a>
  <a href="https://github.com/iscopan/ai_summarizer/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/iscopan/ai_summarizer/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="Manifest v3" src="https://img.shields.io/badge/Manifest-v3-blue">
  <img alt="Free to use" src="https://img.shields.io/badge/Free-No%20setup%20needed-teal">
</div>

---

## ✨ Features

- **Works instantly** — no account, no API key, no configuration required by the end user
- **Secure by design** — the API key lives exclusively on the backend; the extension never handles credentials
- **Any webpage** — articles, blogs, documentation, news, and more
- **Multilingual** — summaries are generated in the same language as the page (detected from the `<html lang>` attribute)
- **Copy to clipboard** — one click to copy the generated summary
- **Modern dark UI** — clean teal-themed popup and settings page
- **Rate limiting** — the backend enforces a per-IP limit to prevent abuse

## 🏗️ Architecture

```
Chrome Extension  →  POST /api/summarize  →  Backend (Node.js)  →  OpenRouter API
  (popup.js)          { text, lang }         (aisummarizer.fpuente.com)
```

The extension **never talks to OpenRouter directly**. All AI calls are proxied through the backend, which holds the API key securely as an environment variable.

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

The project is split into two independent parts:

### Extension (no build step)

```bash
# Edit files directly and reload the extension in chrome://extensions
```

If you want to point the extension at a local backend during development, edit `background.js`:

```js
const BACKEND_URL = 'http://localhost:3000/api/summarize';
```

### Backend

```bash
cd backend
cp .env.example .env      # add your OpenRouter API key
npm install
npm run dev               # starts with nodemon on port 3000
```

#### Environment variables (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | ✅ | — | Your [OpenRouter](https://openrouter.ai/keys) API key |
| `OPENROUTER_MODEL` | ❌ | `openrouter/auto` | Model to use for summarisation |
| `ALLOWED_EXTENSION_ORIGIN` | ❌ | `*` | Set to `chrome-extension://<id>` in production |
| `PORT` | ❌ | `3000` | Port the server listens on |

### Project structure

```
ai_summarizer/
├── manifest.json           # Extension manifest (v3)
├── background.js           # Service worker — proxies requests to the backend
├── popup.html / popup.js   # Extension popup UI
├── options.html / options.js # Settings & info page
├── icons/                  # Extension icons (16, 48, 128 px)
├── _locales/               # i18n strings (en, es, fr, de, it, pt)
├── .github/workflows/      # CI pipeline
└── backend/
    ├── index.js            # Express proxy server with rate limiting
    ├── package.json
    ├── Dockerfile          # For deployment on Docker/Dokploy
    └── .env.example        # Environment variable template
```

## ☁️ Deploying the backend

The backend is a standard Node.js Express app. A `Dockerfile` is included for containerised deployments.

### With Docker

```bash
cd backend
docker build -t ai-summarizer-backend .
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=sk-or-v1-... \
  -e OPENROUTER_MODEL=openrouter/auto \
  ai-summarizer-backend
```

## 📦 Packaging for the Chrome Web Store

```bash
zip -r ai_summarizer_v1.2.zip \
  manifest.json background.js \
  popup.html popup.js \
  options.html options.js \
  icons/ _locales/
```

> ⚠️ Never include `config.js`, `.env`, or any file containing credentials in the ZIP.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## ❤️ Support

If this extension saves you time, consider [donating via PayPal](https://paypal.me/iscopan).

## 📄 License

[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE) (CC BY-NC-SA 4.0)

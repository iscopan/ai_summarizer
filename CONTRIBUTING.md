# Contributing to AI Summarizer

Thank you for considering contributing to AI Summarizer! 🎉

## Architecture

The project is divided into two parts:
1. **The Chrome Extension**: pure HTML/CSS/JS, running in the browser.
2. **The Backend Proxy**: a Node.js/Express application that forwards requests to OpenRouter securely.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-summarizer.git
   ```

### Running the Extension Locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the root project folder
4. Since the extension relies on a backend, you'll want to run the backend locally too (see below), and update `background.js` to point to `http://localhost:3000/api/summarize`.

### Running the Backend Locally

1. `cd backend`
2. `npm install`
3. Copy the environment variables template: `cp .env.example .env`
4. Edit `.env` and add your [OpenRouter API key](https://openrouter.ai/keys).
5. Start the development server: `npm run dev`

## Development Guidelines

### Code Style
- Plain JavaScript (ES2022) for both extension and backend (no transpilers needed).
- Use `const`/`let`, no `var`
- Descriptive variable names in English
- Keep functions small and focused
- Add comments for non-obvious logic
- Do not expose credentials or API keys anywhere in the extension code

### File Structure
- **`background.js`** — service worker, forwards requests to the backend proxy
- **`popup.js / popup.html`** — the extension popup (≤ 340px wide)
- **`options.js / options.html`** — settings page
- **`backend/`** — the Node.js API proxy that interacts directly with OpenRouter

### Commit Messages
Follow conventional commits:
```
feat: extract language dynamically from html lang tag
fix: handle rate limit errors gracefully
docs: update architecture details
chore: update CI workflow
```

## Submitting a Pull Request

1. Create a branch: `git checkout -b feat/your-feature`
2. Make your changes and test them locally
3. Ensure **all CI checks pass** (the GitHub Actions workflow validates manifest, lints JS, and checks for required files)
4. Open a Pull Request against `main` with a clear description of what changed and why

## Reporting Issues

- Search [existing issues](https://github.com/iscopan/ai-summarizer/issues) before opening a new one
- Include your Chrome version, extension version, and steps to reproduce
- For security issues, please email instead of opening a public issue

## License

By contributing, you agree that your contributions will be licensed under the same [CC BY-NC-SA 4.0](LICENSE) license as the project.

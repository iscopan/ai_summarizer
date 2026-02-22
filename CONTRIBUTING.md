# Contributing to AI Summarizer

Thank you for considering contributing to AI Summarizer! 🎉

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-summarizer.git
   ```
3. **Load the extension** in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** → select the project folder
4. Make your changes and **reload** the extension to test

## Development Guidelines

### Code Style
- Plain JavaScript (ES2022, no transpilation needed)
- Use `const`/`let`, no `var`
- Descriptive variable names in English
- Keep functions small and focused
- Add comments for non-obvious logic

### File Structure
- **`background.js`** — service worker, calls the [OpenRouter API](https://openrouter.ai) using the `openrouter/free` model router
- **`popup.js / popup.html`** — the extension popup (≤ 340px wide)
- **`options.js / options.html`** — settings page
- **No build step** — keep it dependency-free

### Commit Messages
Follow conventional commits:
```
feat: add support for custom AI models
fix: handle rate limit errors gracefully
docs: update OpenRouter key instructions
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

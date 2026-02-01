
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-01-30 - [Robust Prompt Sanitization and Config Fix]
**Vulnerability:** Weak prompt injection protection (lack of escaping) and missing API key in GoogleGenAI constructor.
**Learning:** Blacklist-based sanitization (stripping "SYSTEM:") is fragile and "security theater". Robust sanitization should focus on escaping control characters (backslashes, quotes) to prevent breaking out of intended prompt templates.
**Prevention:** Use a centralized `sanitizePromptInput` helper that escapes both backslashes and double quotes, and enforces a strict length limit (e.g., 500 characters). Always pass environment-based API keys to service constructors.


## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-06 - [Prompt Injection Protection and safe truncation]
**Vulnerability:** Prompt injection via unsanitized user inputs (titles, instructions) and insecure AI client initialization.
**Learning:** Aggressive string truncation (e.g., 500 characters) in sanitization functions can break technical features that require long context, such as garment construction steps. A more generous limit (e.g., 2000 characters) balances security and functionality.
**Prevention:** Use `sanitizePromptInput` to escape backslashes, quotes, and remove delimiters. Always pass the API key explicitly to AI constructors to avoid ambient auth issues and ensure type safety.


## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-03 - [Prompt Injection Mitigation and API Key Security]
**Vulnerability:** Unsanitized user inputs in AI prompts and insecure GoogleGenAI initialization without an API key.
**Learning:** Mixing SYSTEM and USER instructions in a single text part increases injection risk. Truncating user input to a reasonable length (e.g., 500 chars) is an effective defense-in-depth measure.
**Prevention:** Use the `sanitizePromptInput` helper for all user-controlled strings and always use structured content parts to separate instructions from data.

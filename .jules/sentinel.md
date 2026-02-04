
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-04 - [Prompt Injection and API Key Initialization]
**Vulnerability:** User-controlled strings were interpolated directly into LLM prompts without sanitization. Also, GoogleGenAI was initialized without an API key, causing runtime errors.
**Learning:** GoogleGenAI constructor requires an API key. Prompt injection can be mitigated by escaping quotes/backslashes and replacing semicolons/newlines to prevent breaking out of technical instruction blocks.
**Prevention:** Always use a `sanitizePromptInput` helper for any user-controlled data passed to AI services and ensure environment variables are correctly typed in tsconfig.

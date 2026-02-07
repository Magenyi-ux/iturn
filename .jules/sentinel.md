
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2025-05-15 - [Prompt Injection Mitigation & AI Service Stabilization]
**Vulnerability:** User-controlled strings (style titles, instructions) were directly interpolated into AI prompts, creating a risk of prompt injection. AI service initialization was also missing explicit API key passing, causing build failures.
**Learning:** Modern LLM SDKs (like Gemini) benefit significantly from separating instructions into distinct content parts rather than single-string blocks. Missing type definitions for Vite environment variables (`import.meta.env`) can block compilation even if the code is logically sound.
**Prevention:** Always use a dedicated `sanitizePromptInput` helper for user input. Structuring `generateContent` with separate `parts` for `SYSTEM` and `USER INSTRUCTIONS` provides a cleaner security boundary. Ensure `tsconfig.json` includes `vite/client` for proper typing of environment variables.

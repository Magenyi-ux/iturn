
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-03-27 - [Hardening Gemini AI Prompts]
**Vulnerability:** User-controlled input was directly interpolated into AI prompts without sanitization, allowing for potential instruction bypass or prompt injection.
**Learning:** Separating system instructions and user instructions into distinct content parts in the Gemini SDK provides a structural defense that reduces the efficacy of injection attempts compared to a single concatenated string.
**Prevention:** Implement a `sanitizePromptInput` helper to escape quotes and strip malicious keywords. Always use the structured `parts` array in `generateContent` to isolate user input from system-level instructions.


## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-03-27 - [Hardening Gemini Prompts against Injection]
**Vulnerability:** Prompt injection via un-sanitized user input in `services/gemini.ts`. User could close string quotes and inject new "SYSTEM:" instructions.
**Learning:** Even with "SYSTEM:" and "USER INSTRUCTIONS:" prefixes, direct string interpolation is risky. Using separate parts in the Gemini `contents` array and a dedicated `sanitizePromptInput` helper provides defense-in-depth.
**Prevention:** Always sanitize user-controlled strings (escape quotes, length limit) and use structured content parts instead of raw string prompts.

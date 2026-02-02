
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-03-01 - [Mitigating Prompt Injection via Input Sanitization]
**Vulnerability:** Prompt injection risks where user-provided or AI-generated strings were directly embedded into LLM instructions, potentially allowing instruction overrides.
**Learning:** Even with structured prompts (SYSTEM/USER separation), special characters like double quotes and backslashes can be used to break out of string literals within the prompt. Length constraints are also critical to prevent DoS or complex instruction overrides.
**Prevention:** Always use a dedicated `sanitizePromptInput` helper for any dynamic content included in prompts. This helper should escape backslashes and quotes, replace newlines with spaces, and enforce a reasonable character limit (e.g., 500 chars).

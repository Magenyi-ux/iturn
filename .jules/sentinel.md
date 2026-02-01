
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-01 - [Prompt Injection Protection and SDK Hardening]
**Vulnerability:** User-controlled strings were directly interpolated into AI prompts without sanitization, allowing for potential prompt injection attacks. Additionally, the `GoogleGenAI` SDK was initialized without an API key, relying on ambient authentication which caused TypeScript verification failures.
**Learning:** Even when using "Master Tutor" or "System" prefixes, raw user input in prompts can override instructions. Escaping backslashes and double quotes while limiting input length to 500 characters provides a robust baseline defense. TypeScript verification (`tsc`) is essential as `pnpm build` may succeed despite critical type errors.
**Prevention:** Always use a dedicated `sanitizePromptInput` helper for any user string entering an LLM prompt. Ensure SDK constructors are explicitly passed environment-based API keys to maintain type safety and configuration clarity.

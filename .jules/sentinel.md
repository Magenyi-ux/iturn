
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-03 - [Robust Prompt Sanitization and SDK Authentication]
**Vulnerability:** Prompt injection risks due to direct interpolation of user-controlled strings into AI prompts and lack of quoting. Also, incorrect assumption about ambient SDK authentication led to build failures.
**Learning:** Even with "SYSTEM:" and "USER INSTRUCTIONS:" prefixes, unquoted and unsanitized user input can allow instruction conflation. The @google/genai SDK v1.39.0 requires an API key in the constructor, contrary to previous assumptions that ambient auth was sufficient.
**Prevention:** Use a robust `sanitizePromptInput` helper that escapes quotes and backslashes, replaces newlines, and enforces length limits. Always initialize AI clients with explicit configuration from environment variables to ensure compatibility across different deployment environments and strict TypeScript compliance.

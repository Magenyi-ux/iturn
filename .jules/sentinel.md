
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-11 - [Prompt Injection Protection & Build Robustness]
**Vulnerability:** User input was directly interpolated into system prompts in AI services, allowing for potential prompt injection. Also, the build was fragile due to missing type definitions for 'import.meta.env' and missing icon imports.
**Learning:** Centralizing AI initialization and using a sanitization helper for all user-controllable strings significantly reduces the attack surface for prompt injection. Additionally, 'vite/client' must be included in 'tsconfig.json' types for proper Vite environment variable typing.
**Prevention:** Always wrap user-provided strings with a sanitization utility before including them in LLM prompts. Use centralized factories for AI service instantiation to manage API keys securely.

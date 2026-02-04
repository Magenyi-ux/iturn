
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-04 - [Harden AI Prompts and ID Generation]
**Vulnerability:** Application lacked input sanitization for AI prompts, potentially allowing prompt injection. Also used insecure `Math.random` for generating unique identifiers.
**Learning:** Even if an app builds successfully with Vite, missing imports (like `lucide-react` icons) can be caught by `tsc --noEmit`. UUIDs are much more robust for unique tracking in luxury suites where data integrity is paramount.
**Prevention:** Always export a sanitization helper for user-controlled strings entering AI prompts. Use `crypto.randomUUID()` as the standard for all object IDs. Ensure `import.meta.env` is correctly typed via `vite/client` in `tsconfig.json`.

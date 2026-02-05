
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-02-05 - [Prompt Injection Mitigation and Secure ID Generation]
**Vulnerability:** Prompt injection risks through un-sanitized user inputs in LLM prompts and predictable ID generation using Math.random().
**Learning:** Even with SYSTEM/USER instruction separation, un-sanitized user strings can break template structure if they contain quotes or control characters. Standard PRNGs like Math.random() are unsuitable for secure identifier generation in professional applications.
**Prevention:** Use a dedicated 'sanitizePromptInput' helper for all user-controlled strings in prompts. Use 'crypto.randomUUID()' for all unique identifiers to ensure cryptographic strength and prevent predictability.

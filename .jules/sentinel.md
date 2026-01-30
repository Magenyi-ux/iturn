
## 2026-01-29 - [Securing AI Service and Fixing Mounting Bug]
**Vulnerability:** Hardcoded API key injection via `vite.config.ts` and unseparated prompt instructions in `services/gemini.ts`.
**Learning:** The application was using an `importmap` in `index.html` which conflicted with Vite's bundling, causing a blank screen. Also, model identifiers were outdated/hallucinated (e.g., `gemini-3`).
**Prevention:** Always use `SYSTEM:` and `USER INSTRUCTIONS:` prefixes for prompt injection protection. Rely on ambient authentication (`new GoogleGenAI()`) instead of injecting keys into the client build. Ensure `index.html` correctly loads the entry point via a module script tag.

## 2026-03-05 - [Mitigating Prompt Injection via Input Sanitization]
**Vulnerability:** Prompt injection risk where user-controlled strings (titles, queries, instructions) were interpolated directly into LLM prompt templates without sanitization, allowing attackers to "break out" of string boundaries and inject instructions.
**Learning:** Even with structured 'SYSTEM:' and 'USER INSTRUCTIONS:' blocks, unescaped quotes in user input can still lead to instruction conflation or jailbreaking. Enforcing a character limit also mitigates context window overflow and DoS risks.
**Prevention:** Always use a sanitization helper like `sanitizePromptInput` to escape quotes, strip control keywords, and limit length for all user-provided data sent to AI models.

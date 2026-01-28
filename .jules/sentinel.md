# Sentinel Journal 🛡️

## 2026-01-28 - Prompt Injection Mitigation in Gemini Services
**Vulnerability:** User-provided input (e.g., style titles, search queries, design instructions) was directly concatenated into LLM prompts in `services/gemini.ts`. This could allow a malicious user to bypass intended constraints or manipulate AI behavior via prompt injection.
**Learning:** In this codebase, the standard mitigation for prompt injection is to clearly structure prompts using 'SYSTEM:' and 'USER INSTRUCTIONS:' prefixes. This helps the model distinguish between trusted developer-provided instructions and untrusted user data.
**Prevention:** Always wrap trusted instructions in a 'SYSTEM:' block and untrusted user input in a 'USER INSTRUCTIONS:' block when constructing prompts. Avoid direct string concatenation of user input without these clear delimiters.

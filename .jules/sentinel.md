## 2025-05-22 - [Mitigate Prompt Injection in Gemini Services]
**Vulnerability:** Prompt injection through direct string concatenation of user-provided suggestions and instructions into system prompts in `services/gemini.ts`.
**Learning:** In LLM-powered applications, mixing trusted system instructions with untrusted user input without clear delimiters can allow users to override system behavior or extract sensitive information.
**Prevention:** Use explicit markers like `SYSTEM:` and `USER INSTRUCTIONS:` to clearly demarcate untrusted input from system directives. This helps the model distinguish between instructions it must follow and content it should process according to those instructions.

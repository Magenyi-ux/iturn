## 2024-05-20 - Prompt Injection in Gemini Services

**Vulnerability:** User-provided strings in `services/gemini.ts` were directly embedded into prompts for the Gemini API. Functions like `searchInspiration`, `refineDesign`, and `generateStyles` were all vulnerable.

**Learning:** Any user input that becomes part of an LLM prompt must be treated as hostile. Without sanitization, a malicious user could inject new instructions, bypass safety filters, or manipulate the AI's output. The application architecture funneled multiple user inputs into a single service, creating a recurring vulnerability pattern.

**Prevention:** All user input must be sanitized before being included in an LLM prompt. A centralized sanitization function should be used for all external inputs that will be passed to the AI. This creates a single point of security control and makes it easier to enforce the policy.
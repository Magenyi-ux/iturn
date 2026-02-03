
import { GoogleGenAI, Type } from "@google/genai";
import { Measurements, StyleConcept, PhysicalCharacteristics, ViewAngle, DisplayMode, Fabric } from "../types";

/**
 * Custom error class to provide descriptive feedback to the atelier interface.
 * Helps distinguish between network issues, AI safety blocks, and quota limits.
 */
export class CoutureError extends Error {
  constructor(public message: string, public reason?: 'SAFETY_BLOCK' | 'AUTH_ERROR' | 'QUOTA_EXCEEDED' | 'RENDER_FAILURE' | 'MODEL_EMPTY' | 'NETWORK_ERROR') {
    super(message);
    this.name = 'CoutureError';
  }
}

/**
 * Sanitizes user input to prevent prompt injection.
 * Escapes backslashes and double quotes, replaces newlines with spaces,
 * and limits input length to 500 characters.
 */
export const sanitizePromptInput = (input: string): string => {
  if (!input) return "";
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .slice(0, 500);
};

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, initialDelay: number = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); } catch (err: any) {
      lastError = err;
      const errStr = JSON.stringify(err) || err.message || "";
      
      // Handle explicit quota/rate limit errors (429)
      if ((errStr.includes('429') || err.message?.includes('429')) && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, initialDelay * Math.pow(2, i)));
        continue;
      }

      // Handle explicit API key errors (403/401)
      if (errStr.includes('403') || errStr.includes('401')) {
        throw new CoutureError("Access Denied: Please check your API key configuration or billing status.", "AUTH_ERROR");
      }

      // Handle safety or finish reason errors from the SDK
      if (err.message?.includes('SAFETY') || err.message?.includes('blocked')) {
        throw new CoutureError("The creative vision was restricted by safety filters. Please refine your design instructions.", "SAFETY_BLOCK");
      }

      // Check for quota specifically
      if (errStr.includes('quota') || errStr.includes('LimitExceeded')) {
        throw new CoutureError("The studio has reached its maximum generation quota for now. Please wait a moment.", "QUOTA_EXCEEDED");
      }

      throw err;
    }
  }
  throw lastError;
}

async function standardizeImage(dataUrl: string, maxDimension: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > h) { if (w > maxDimension) { h *= maxDimension / w; w = maxDimension; } }
      else { if (h > maxDimension) { w *= maxDimension / h; h = maxDimension; } }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new CoutureError("Failed to initialize canvas for image processing.", "RENDER_FAILURE"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new CoutureError("Failed to load image for digital processing.", "RENDER_FAILURE"));
    img.src = dataUrl;
  });
}

const extractBase64 = (url: string) => url.split(',')[1];

/**
 * Generates a "Design DNA" blueprint.
 */
export const generateDesignDNA = async (frontViewImage: string, style: StyleConcept): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const img = await standardizeImage(frontViewImage, 768);
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(img) } },
          { text: `SYSTEM: TECHNICAL BLUEPRINT EXTRACTION (SECRET FILE GEN):
          Analyze this established front-view couture design.
          Extract a hyper-detailed architectural 'Design DNA' block. 
          Document the following with clinical precision:
          1. TEXTILE MAPPING: Exact thread count appearance, surface luster, and drape physics.
          2. COLOR SPECIFICATIONS: Precise hex-logic, highlight behaviors, and shadow tints.
          3. COMPONENT HEIGHTS: Exact pixel-relative coordinates for the waistline, neckline, and hemlines.
          4. HARDWARE LOG: Detailed count, shape, and material of buttons, zippers, and rivets.
          5. SEAM ARCHITECTURE: Placement of darts, top-stitching, and panel joins.` },
          { text: `USER INSTRUCTIONS: Extract Design DNA for "${sanitizePromptInput(style.title)}".` }
        ]
      }
    });

    if (!response.text) {
      throw new CoutureError("Design DNA generation failed.", "MODEL_EMPTY");
    }

    return response.text;
  });
};

export const searchInspiration = async (query: string): Promise<{ text: string, links: { title: string, uri: string }[] }> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { role: 'user', parts: [{ text: 'SYSTEM: Search for high-end fashion design related to the user query. Provide a deep aesthetic synthesis.' }] },
        { role: 'user', parts: [{ text: `USER INSTRUCTIONS: Query: "${sanitizePromptInput(query)}"` }] }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];
    return { text: response.text || "", links };
  });
};

export const generateMoodImages = async (description: string): Promise<string[]> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const aspects: ("1:1" | "3:4" | "4:3")[] = ["3:4", "1:1", "4:3", "3:4"];
    const results: string[] = [];
    for (const aspect of aspects) {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          { role: 'user', parts: [{ text: 'SYSTEM: A high-fashion mood board image. Studio lighting, hyper-realistic.' }] },
          { role: 'user', parts: [{ text: `USER INSTRUCTIONS: Theme: "${sanitizePromptInput(description)}". Aspect ratio: ${aspect}.` }] }
        ],
        config: { imageConfig: { aspectRatio: aspect } }
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part) results.push(`data:image/png;base64,${part.inlineData.data}`);
    }
    return results;
  });
};

export const refineDesign = async (baseImage: string, sketchOverlay: string, instructions: string): Promise<string | null> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const base = await standardizeImage(baseImage, 512);
    const sketch = await standardizeImage(sketchOverlay, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(base) } },
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(sketch) } },
          { text: 'SYSTEM: Refine the garment shown in the images. Output editorial photography.' },
          { text: `USER INSTRUCTIONS: ${sanitizePromptInput(instructions)}` }
        ]
      },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      throw new CoutureError("Iteration Blocked.", "SAFETY_BLOCK");
    }

    const part = candidate?.content?.parts.find(p => p.inlineData);
    if (!part) {
      throw new CoutureError("Synthesis Stalled.", "RENDER_FAILURE");
    }

    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generatePattern = async (style: StyleConcept, measurements: Measurements): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { role: 'user', parts: [{ text: 'SYSTEM: Create a professional technical pattern description based on provided style and measurements.' }] },
        { role: 'user', parts: [{ text: `USER INSTRUCTIONS: Style: "${sanitizePromptInput(style.title)}". Measurements: ${JSON.stringify(measurements)}.` }] }
      ]
    });
    return response.text || "Pattern generation error.";
  });
};

export const analyzeFabric = async (imageUrl: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const img = await standardizeImage(imageUrl, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(img) } },
          { text: "SYSTEM: Analyze this luxury fabric swatch. Describe weave, drape, and recommended couture uses." },
          { text: "USER INSTRUCTIONS: Provide the analysis for the attached image." }
        ]
      }
    });
    return response.text || "Analysis unavailable.";
  });
};

export const predictMeasurements = async (photos: Record<string, string>) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const p = {
      front: await standardizeImage(photos.front),
      side: await standardizeImage(photos.side),
      back: await standardizeImage(photos.back),
    };
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: {
        parts: [
          { text: `SYSTEM: ANATOMIC TAILORING SYNTHESIS:
          Analyze these three silhouette captures (Front, Side, Back) to extract a complete set of bespoke tailoring measurements.
          1. Detect the acromion processes for Shoulder Width.
          2. Locate the natural waistline (narrowest part of torso).
          3. Analyze the side profile to detect chest projection and seat volume for Hips and Chest accuracy.
          4. Use the known vertical scale (Height) to calibrate all other measurements.
          Return the measurements in CM as a structured JSON object.` },
          { text: "USER INSTRUCTIONS: Extract measurements from the attached front, side, and back silhouette frames." },
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(p.front) } },
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(p.side) } },
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(p.back) } },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            measurements: {
              type: Type.OBJECT,
              properties: {
                height: { type: Type.STRING }, chest: { type: Type.STRING }, waist: { type: Type.STRING },
                hips: { type: Type.STRING }, shoulders: { type: Type.STRING }, sleeveLength: { type: Type.STRING },
                inseam: { type: Type.STRING }, neck: { type: Type.STRING },
              },
              required: ["height", "chest", "waist", "hips", "shoulders", "sleeveLength", "inseam", "neck"],
            },
            characteristics: {
              type: Type.OBJECT,
              properties: { gender: { type: Type.STRING }, ethnicity: { type: Type.STRING } },
              required: ["gender", "ethnicity"]
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateStyles = async (measurements: Measurements, photos: Record<string, string>, suggestion: string = "") => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const img = await standardizeImage(photos.front, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(img) } },
          { text: `SYSTEM: Create 30 visionary couture concepts. Proportions: ${JSON.stringify(measurements)}.` },
          { text: `USER INSTRUCTIONS: Suggestion: "${sanitizePromptInput(suggestion)}". Generate concepts based on the provided photo and proportions.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING },
              occasion: { type: Type.STRING }, category: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              materials: { type: Type.ARRAY, items: { type: Type.STRING } }, steps: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const generateStyleImage = async (
  style: StyleConcept, 
  measurements: Measurements, 
  characteristics: PhysicalCharacteristics, 
  angle: ViewAngle, 
  mode: DisplayMode, 
  userPhotoRef: string,
  designReferenceImage?: string,
  designDNA?: string
) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const personRef = await standardizeImage(userPhotoRef, 768);
    
    const parts: any[] = [
      { inlineData: { mimeType: 'image/jpeg', data: extractBase64(personRef) } }
    ];

    let architecturalDirective = "";
    if (designReferenceImage && designDNA) {
      const designRef = await standardizeImage(designReferenceImage, 768);
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: extractBase64(designRef) } });
      architecturalDirective = `Render ${angle} view using the hidden 'SECRET DESIGN DNA' blueprint: ${sanitizePromptInput(designDNA)}`;
    }

    parts.push({ text: `SYSTEM: Hyper-realistic 8k fashion photography. Mode: ${mode}. Studio lighting. ${architecturalDirective}` });
    parts.push({ text: `USER INSTRUCTIONS: View: ${angle}. Style: "${sanitizePromptInput(style.title)}".` });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part) throw new CoutureError("Render Failure", "RENDER_FAILURE");

    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

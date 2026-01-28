
import { GoogleGenAI, Type } from "@google/genai";
import { Measurements, StyleConcept, PhysicalCharacteristics, ViewAngle, DisplayMode, Fabric } from "../types";

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, initialDelay: number = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); } catch (err: any) {
      lastError = err;
      const errStr = JSON.stringify(err);
      if ((errStr.includes('429') || err.message?.includes('429')) && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, initialDelay * Math.pow(2, i)));
        continue;
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
      if (!ctx) return reject("Canvas error");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = dataUrl;
  });
}

const extractBase64 = (url: string) => url.split(',')[1];

export const generateDesignDNA = async (frontViewImage: string, style: StyleConcept): Promise<string> => {
  return withRetry(async () => {
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const img = await standardizeImage(frontViewImage, 768);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(img) } },
          { text: `SYSTEM: TECHNICAL ANALYSIS FOR TAILORING CONSISTENCY:
          Analyze the generated design and extract a hyper-detailed "Design DNA" blueprint.
          Describe:
          1. Exact fabric textures (weave, luster, grain).
          2. Precise color palette with shading descriptions.
          3. Button/hardware placement, count, and material.
          4. Seam lines, darting, and structural details.
          5. Pattern scaling and orientation.
          
          This text will be used to generate the SIDE and BACK views. Be extremely literal and technical.

          USER INSTRUCTIONS: Analyze this design for "${style.title}".` }
        ]
      }
    });
    return response.text || "Design DNA generation failed.";
  });
};

export const searchInspiration = async (query: string): Promise<{ text: string, links: { title: string, uri: string }[] }> => {
  return withRetry(async () => {
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `SYSTEM: Search for high-end fashion design, textile patterns, couture silhouettes, and bespoke tailoring elements. Provide a deep aesthetic synthesis of the trend.
      USER INSTRUCTIONS: Search related to: "${query}".`,
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
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const aspects: ("1:1" | "3:4" | "4:3")[] = ["3:4", "1:1", "4:3", "3:4"];
    const results: string[] = [];
    for (const aspect of aspects) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `SYSTEM: Generate a high-fashion editorial mood board image. Focus on fabric texture, avant-garde silhouette, or couture craftsmanship detail. Professional studio lighting, hyper-realistic, 8k resolution.
        USER INSTRUCTIONS: Capture the essence of: ${description}.`,
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
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const base = await standardizeImage(baseImage, 512);
    const sketch = await standardizeImage(sketchOverlay, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(base) } },
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(sketch) } },
          { text: `SYSTEM: Refine the high-fashion garment. Focus on luxurious fabric texture, intricate sewing details, and artistic silhouettes. The output must be a stunning, high-fashion editorial photograph.
          USER INSTRUCTIONS: ${instructions}.` }
        ]
      },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  });
};

export const generatePattern = async (style: StyleConcept, measurements: Measurements): Promise<string> => {
  return withRetry(async () => {
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `SYSTEM: Create a detailed technical pattern description and professional garment drafting guide. Provide specific cutting coordinates, seam allowances, and assembly order.
      USER INSTRUCTIONS: Create for "${style.title}" using measurements: ${JSON.stringify(measurements)}.`
    });
    return response.text || "Pattern generation error.";
  });
};

export const analyzeFabric = async (imageUrl: string): Promise<string> => {
  return withRetry(async () => {
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const img = await standardizeImage(imageUrl, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(img) } },
          { text: "SYSTEM: Analyze this luxury fabric swatch. Describe its aesthetic appeal, weave complexity, drape for high-end garments, and recommended couture uses." }
        ]
      }
    });
    return response.text || "Analysis unavailable.";
  });
};

export const predictMeasurements = async (photos: Record<string, string>) => {
  return withRetry(async () => {
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const p = {
      front: await standardizeImage(photos.front),
      side: await standardizeImage(photos.side),
      back: await standardizeImage(photos.back),
    };
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "SYSTEM: Analyze these silhouette captures for body proportions to inform bespoke garment construction. Return precise tailoring measurements in cm." },
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
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const img = await standardizeImage(photos.front, 512);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: extractBase64(img) } },
          { text: `SYSTEM: Create 30 visionary cloth designs and couture concepts. Focus on garment artistry, unique fabric combinations, and avant-garde or classic bespoke silhouettes.
          USER INSTRUCTIONS: User preference: ${suggestion}. Proportions for drape analysis: ${JSON.stringify(measurements)}.` }
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
    // API key is implicitly provided by the AI Studio environment.
    const ai = new GoogleGenAI();
    const personRef = await standardizeImage(userPhotoRef, 768);
    
    const parts: any[] = [
      { inlineData: { mimeType: 'image/jpeg', data: extractBase64(personRef) } }
    ];

    let consistencyPrompt = "";
    if (designReferenceImage && designDNA) {
      const designRef = await standardizeImage(designReferenceImage, 768);
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: extractBase64(designRef) } });
      consistencyPrompt = `
      STRICT ARCHITECTURAL ADHERENCE:
      Follow the provided DESIGN REFERENCE and DESIGN BLUEPRINT (DNA) exactly.
      Maintain exact pixel-perfect consistency in fabric texture, component alignment, proportions, and pattern scale.
      Do not hallucinate new details. This is a technical rendering of a fixed design.
      --- START DNA BLUEPRINT ---
      ${designDNA}
      --- END DNA BLUEPRINT ---`;
    }

    const prompt = `SYSTEM: Generate hyper-realistic 8k fashion photography in an editorial studio setting with cinematic lighting. Breathtaking couture quality. ${consistencyPrompt}
    USER INSTRUCTIONS: Generate ${angle} view for garment "${style.title}" in mode ${mode}.`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  });
};

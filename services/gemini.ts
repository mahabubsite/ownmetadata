import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

const BASE_PROMPT = `
You are an expert stock content contributor. Your task is to generate high-quality, SEO-friendly metadata for stock files.
Analyze the image/file for objects, colors, style, composition, and background.

Configuration Constraints:
- Title Length: Approx {{TITLE_LENGTH}} characters.
- Description Length: Approx {{DESC_LENGTH}} characters.
- Keywords Count: Approx {{KEYWORDS_COUNT}} keywords.
- Content Type Focus: {{CONTENT_TYPE}}
- Target Platform: {{PLATFORM}}
- Custom Instructions: {{CUSTOM_PROMPT}}

Rules for {{PLATFORM}}:
- If Adobe Stock: Order keywords by importance. Use standard vocabulary.
- If Shutterstock: Avoid restricted trademark keywords.
- If iStock/Getty: Focus on conceptual descriptions.

Output Requirements:
1. Title: Descriptive, keyword-rich.
2. Description: Appealing, concise, SEO-friendly sentence(s).
3. Tags: Comma-separated keywords, sorted by relevance.
4. Category: One stock category (e.g., Lifestyle, Business, Nature).

Format:
Return ONE single CSV row in this exact format:
filename,title,description,tags,category

Do NOT include the header.
Do NOT use markdown code blocks.
Ensure string fields with commas are enclosed in double quotes.

Input Filename: {{FILENAME}}
Input Filetype: {{FILETYPE}}
`;

// Helper to determine accurate MIME type based on extension
const getMimeType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  const mimeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'pdf': 'application/pdf'
  };

  // If known extension, use mapped mime type, otherwise fall back to file.type or default
  return mimeMap[extension || ''] || file.type || 'application/octet-stream';
};

const readFileAsBase64 = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Depending on how readAsDataURL returns, it might be "data:mime;base64,data"
      // We safely split by the first comma.
      const base64Data = result.includes(',') ? result.split(',')[1] : result;
      resolve({ data: base64Data, mimeType: getMimeType(file) });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const readFileAsText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const callGemini = async (ai: GoogleGenAI, model: string, contents: any, retries = 1): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents
    });
    
    if (!response.text) {
      throw new Error("No response text from Gemini");
    }
    
    return response.text;
  } catch (error: any) {
    if (retries > 0 && error?.status === 500) {
      console.warn(`Retrying Gemini request due to 500 error... (${retries} attempts left)`);
      // Short delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return callGemini(ai, model, contents, retries - 1);
    }
    throw error;
  }
};

export const processFileWithGemini = async (file: File, config: GenerationConfig, apiKey: string): Promise<string> => {
  const effectiveKey = apiKey || process.env.API_KEY;
  
  if (!effectiveKey) {
    throw new Error("API Key not found. Please configure your Gemini API Key in the settings.");
  }

  // File Validation
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("File size exceeds 20MB limit for inline processing.");
  }

  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isUnsupported = file.name.toLowerCase().endsWith('.ai') || file.name.toLowerCase().endsWith('.eps');

  if (isUnsupported) {
    throw new Error("AI and EPS files are not supported for browser-only processing.");
  }

  const ai = new GoogleGenAI({ apiKey: effectiveKey });
  
  let prompt = BASE_PROMPT
    .replace('{{FILENAME}}', file.name)
    .replace('{{FILETYPE}}', file.type || 'Unknown')
    .replace('{{TITLE_LENGTH}}', config.titleLength.toString())
    .replace('{{DESC_LENGTH}}', config.descriptionLength.toString())
    .replace('{{KEYWORDS_COUNT}}', config.keywordsCount.toString())
    .replace('{{CONTENT_TYPE}}', config.contentType === 'None (Auto)' ? 'General Stock' : config.contentType)
    .replace(/{{PLATFORM}}/g, config.targetPlatform)
    .replace('{{CUSTOM_PROMPT}}', config.customPrompt || 'None');

  try {
    let contents;

    if (isSvg) {
      // For SVG, read as text
      const svgContent = await readFileAsText(file);
      prompt += `\n\nSVG CONTENT:\n${svgContent}`;
      
      contents = {
        parts: [{ text: prompt }]
      };
    } else {
      // For Images/Video/PDF
      const { data, mimeType } = await readFileAsBase64(file);
      
      contents = {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          { text: prompt }
        ]
      };
    }

    // Using gemini-flash-latest (stable alias) instead of preview to reduce 500 errors
    const text = await callGemini(ai, 'gemini-flash-latest', contents);

    return text.replace(/```csv/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};
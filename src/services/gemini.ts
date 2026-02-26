import { GoogleGenAI } from '@google/genai';

export const extractTextFromImage = async (
  file: File,
  apiKey: string,
  croppedDataUrl?: string,
  customInstructions?: string
): Promise<{ text: string; explanation?: string }> => {
  const ai = new GoogleGenAI({ apiKey });
  
  let base64Data = '';
  let mimeType = '';

  if (croppedDataUrl) {
    base64Data = croppedDataUrl.split(',')[1];
    mimeType = croppedDataUrl.split(';')[0].split(':')[1];
  } else {
    base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    mimeType = file.type;
  }

  const defaultPrompt = `
    Task: Extract and organize text from this image.
    
    Guidelines:
    1. Handwriting Legibility: If the text is handwritten and unclear, use your intelligence to decipher it and make it legible.
    2. Logical Sequencing: Ensure the extracted text is in the correct logical order. If the writing is jumbled or out of order, rearrange it so it makes sense.
    3. Formatting: Preserve the original formatting where possible, but prioritize logical flow.
    4. Explanation: Provide a brief explanation of how you determined the sequence of the text (e.g., why certain parts precede others).
    
    Format your response as JSON with the following structure:
    {
      "text": "The full extracted and ordered text here",
      "explanation": "Brief explanation of the sequencing logic here"
    }
    
    Additional Instructions: ${customInstructions || 'None'}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        }
      },
      { text: defaultPrompt }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return {
      text: result.text || '',
      explanation: result.explanation
    };
  } catch (e) {
    return { text: response.text || '' };
  }
};

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { audioBase64, mimeType, language } = await req.json();

    if (!audioBase64) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Model update kar diya
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: audioBase64,
                mimeType: mimeType || 'audio/webm',
              }
            },
            {
              text: `Transcribe the following audio accurately in ${language === 'hi' ? 'Hindi' : 'English'}. Return ONLY the transcribed text without any markdown or extra comments.`
            }
          ]
        }
      ]
    });

    return NextResponse.json({ 
      success: true,
      transcript: response.text?.trim() || '' 
    });
    
  } catch (error) {
    console.error('Error in transcription API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transcribe audio' }, 
      { status: 500 }
    );
  }
}
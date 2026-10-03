import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type TranscribeRequest = {
  audioBase64?: string;
  mimeType?: string;
  language?: "en" | "hi";
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as TranscribeRequest;

    if (!body.audioBase64) {
      return NextResponse.json(
        {
          success: false,
          error: "Audio data is required.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const language =
      body.language === "hi"
        ? "hi"
        : "en";

    const mimeType =
      body.mimeType ||
      "audio/webm";

    const audioBuffer =
      Buffer.from(
        body.audioBase64,
        "base64"
      );

    if (audioBuffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Audio data is empty.",
        },
        { status: 400 }
      );
    }

    const audioBlob = new Blob(
      [audioBuffer],
      {
        type: mimeType,
      }
    );

    const ai = new GoogleGenAI({
      apiKey,
    });

    /*
     * Gemini Files API accepts a Blob in Node.js.
     */
    const uploadedFile =
      await ai.files.upload({
        file: audioBlob,
        config: {
          mimeType,
        },
      });

    if (!uploadedFile.uri) {
      throw new Error(
        "Gemini audio upload did not return a URI."
      );
    }

    /*
     * Gemini 3.5 Transcribe
     */
    const interaction =
      await ai.interactions.create({
        model:
          "gemini-3.5-transcribe",

        input: [
          {
            type: "audio",
            uri: uploadedFile.uri,
            mime_type:
              uploadedFile.mimeType ||
              mimeType,
          },
        ],

        generation_config: {
          transcription_config: {
            /*
             * Let Gemini intelligently transcribe
             * Hindi + English / Hinglish.
             */
            language_codes:
              language === "hi"
                ? ["hi-IN", "en-IN"]
                : ["en-IN", "hi-IN"],

            custom_vocabulary: [
              "Rakshak AI",
              "UPI",
              "OTP",
              "PIN",
              "CVV",
              "PAN",
              "Aadhaar",
              "SEBI",
              "RBI",
              "NSE",
              "BSE",
              "mutual fund",
              "stock market",
              "share market",
              "investment",
              "invest",
              "trading",
              "broker",
              "guaranteed return",
              "profit",
              "Telegram",
              "WhatsApp",
              "cybercrime.gov.in",
              "1930",
            ],
          },
        },
      });

    const transcript =
      interaction.output_text?.trim();

    if (!transcript) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No speech could be transcribed.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error(
      "Rakshak transcription error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Voice transcription failed.",
      },
      { status: 500 }
    );
  }
}
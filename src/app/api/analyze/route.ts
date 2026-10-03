import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

type Language = "en" | "hi";

type GeminiSignals = {
  guaranteedReturns: boolean;
  urgencyPressure: boolean;
  suspiciousLink: boolean;
  paymentRequest: boolean;
  credentialRequest: boolean;
  impersonation: boolean;
  unrealisticProfit: boolean;
  summary: string;
  redFlags: string[];
  advice: string[];
  detectedType: string;
};

const WEIGHTS = {
  guaranteedReturns: 25,
  urgencyPressure: 15,
  suspiciousLink: 15,
  paymentRequest: 15,
  credentialRequest: 25,
  impersonation: 20,
  unrealisticProfit: 20,
} as const;

function calculateRisk(signals: GeminiSignals) {
  let score = 0;

  score += signals.guaranteedReturns
    ? WEIGHTS.guaranteedReturns
    : 0;

  score += signals.urgencyPressure
    ? WEIGHTS.urgencyPressure
    : 0;

  score += signals.suspiciousLink
    ? WEIGHTS.suspiciousLink
    : 0;

  score += signals.paymentRequest
    ? WEIGHTS.paymentRequest
    : 0;

  score += signals.credentialRequest
    ? WEIGHTS.credentialRequest
    : 0;

  score += signals.impersonation
    ? WEIGHTS.impersonation
    : 0;

  score += signals.unrealisticProfit
    ? WEIGHTS.unrealisticProfit
    : 0;

  return Math.min(score, 100);
}

function getVerdict(score: number) {
  if (score > 70) return "High Risk Scam";
  if (score > 40) return "Suspicious";
  return "Safe";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input =
      typeof body.input === "string" ? body.input.trim() : "";

    const language: Language =
      body.language === "hi" ? "hi" : "en";

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          error: "Input is required.",
        },
        { status: 400 }
      );
    }

    if (input.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide more content.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const outputLanguage =
      language === "hi"
        ? "Hindi (Devanagari script)"
        : "English";

    const prompt = `
You are Rakshak AI, a financial scam and investment fraud detection assistant for Indian retail investors.

Analyze the following user-provided content:

--- CONTENT START ---
${input}
--- CONTENT END ---

Your job is to identify scam-related signals.

IMPORTANT:
1. Do NOT decide the final risk score yourself.
2. Only extract the boolean signals.
3. The server will calculate the final deterministic risk score.
4. Do not accuse a person or organization of fraud as a proven fact.
5. Treat the result as a safety warning.
6. Explain detected signals clearly.
7. Your natural-language output MUST be in ${outputLanguage}.
8. Keep boolean field names exactly as provided.
9. Return valid JSON matching the provided schema.

Detect these signals:

- guaranteedReturns:
  Claims guaranteed, fixed, risk-free, or assured returns.

- urgencyPressure:
  Creates urgency, limited slots, act now, today only, countdowns, or pressure to invest immediately.

- suspiciousLink:
  Contains a suspicious, unknown, shortened, lookalike, or investment-related URL.

- paymentRequest:
  Requests UPI, bank transfer, crypto, wallet, advance payment, or other direct payment.

- credentialRequest:
  Requests OTP, PIN, password, CVV, Aadhaar, PAN, bank credentials, login credentials, or similar sensitive information.

- impersonation:
  Pretends to represent a bank, broker, government authority, celebrity, company, regulator, or other trusted entity.

- unrealisticProfit:
  Promises unusually high or unrealistic profits/returns over a short period.

For summary, redFlags, advice, and detectedType:
- Use concise, user-friendly language.
- Explain the actual evidence present in the submitted content.
- Do not invent facts that are not present.
- If there are no meaningful red flags, say so clearly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guaranteedReturns: {
              type: Type.BOOLEAN,
            },
            urgencyPressure: {
              type: Type.BOOLEAN,
            },
            suspiciousLink: {
              type: Type.BOOLEAN,
            },
            paymentRequest: {
              type: Type.BOOLEAN,
            },
            credentialRequest: {
              type: Type.BOOLEAN,
            },
            impersonation: {
              type: Type.BOOLEAN,
            },
            unrealisticProfit: {
              type: Type.BOOLEAN,
            },
            summary: {
              type: Type.STRING,
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            advice: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            detectedType: {
              type: Type.STRING,
            },
          },
          required: [
            "guaranteedReturns",
            "urgencyPressure",
            "suspiciousLink",
            "paymentRequest",
            "credentialRequest",
            "impersonation",
            "unrealisticProfit",
            "summary",
            "redFlags",
            "advice",
            "detectedType",
          ],
        },
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    const signals = JSON.parse(rawText) as GeminiSignals;

    const riskScore = calculateRisk(signals);
    const verdict = getVerdict(riskScore);

    return NextResponse.json({
      success: true,
      result: {
        riskScore,
        verdict,
        summary: signals.summary,
        redFlags: signals.redFlags,
        advice: signals.advice,
        detectedType: signals.detectedType,
      },
    });
  } catch (error) {
    console.error("Rakshak analyze error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown analysis error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
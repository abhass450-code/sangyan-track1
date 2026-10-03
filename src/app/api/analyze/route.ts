import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface GeminiSignals {
  detectedType: string;
  summary: string;
  redFlags: string[];
  signals: {
    guaranteedReturns: boolean;
    urgencyPressure: boolean;
    suspiciousLink: boolean;
    paymentRequest: boolean;
    credentialRequest: boolean;
    impersonation: boolean;
    unrealisticProfit: boolean;
  };
  severity: "low" | "medium" | "high";
}

interface AnalysisResult {
  riskScore: number;
  verdict: "Safe" | "Suspicious" | "High Risk Scam";
  summary: string;
  redFlags: string[];
  advice: string[];
  detectedType: string;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function calculateRisk(signals: GeminiSignals["signals"]): number {
  let score = 0;

  // Deterministic rule engine.
  // Gemini identifies signals; the server calculates the score.

  if (signals.guaranteedReturns) score += 25;
  if (signals.urgencyPressure) score += 15;
  if (signals.suspiciousLink) score += 15;
  if (signals.paymentRequest) score += 15;
  if (signals.credentialRequest) score += 25;
  if (signals.impersonation) score += 20;
  if (signals.unrealisticProfit) score += 20;

  return Math.min(score, 100);
}

function getVerdict(
  score: number
): "Safe" | "Suspicious" | "High Risk Scam" {
  if (score > 70) return "High Risk Scam";
  if (score > 40) return "Suspicious";
  return "Safe";
}

function getAdvice(
  score: number,
  signals: GeminiSignals["signals"]
): string[] {
  const advice: string[] = [];

  if (score > 70) {
    advice.push(
      "Do not send money or share OTP, PIN, CVV, passwords, or banking details."
    );

    advice.push(
      "Do not click suspicious links until the organisation is independently verified."
    );

    advice.push(
      "If money has already been transferred, contact 1930 immediately."
    );
  } else if (score > 40) {
    advice.push(
      "Pause before investing, paying, or sharing personal information."
    );

    advice.push(
      "Verify the sender, company, and investment through an official source."
    );

    advice.push(
      "Do not rely only on forwarded messages, screenshots, or testimonials."
    );
  } else {
    advice.push(
      "No strong scam indicators were detected in the submitted content."
    );

    advice.push(
      "Still verify financial claims through an official source before investing."
    );

    advice.push(
      "Never share OTPs, PINs, passwords, or CVVs with anyone."
    );
  }

  if (signals.credentialRequest) {
    advice.push(
      "Never provide OTPs, passwords, CVVs, or banking credentials through unsolicited links."
    );
  }

  return [...new Set(advice)].slice(0, 4);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input =
      typeof body?.input === "string"
        ? body.input.trim()
        : "";

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
          error: "Please provide more content to analyze.",
        },
        { status: 400 }
      );
    }

    if (input.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Input is too long. Maximum 5000 characters.",
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "Gemini API key is not configured.",
        },
        { status: 500 }
      );
    }

    const prompt = `
You are Rakshak AI, a financial scam detection assistant for Indian retail investors.

Analyze the following user-submitted content.

The content may be:
- WhatsApp forward
- Telegram message
- SMS
- social media post
- investment offer
- financial advertisement
- suspicious URL
- phishing message

IMPORTANT:
1. Do NOT decide the final numerical risk score.
2. Extract observable scam signals only.
3. Do not invent facts about companies, people, domains, or organisations.
4. Treat URLs as suspicious when they show characteristics such as unusual domains, impersonation, login requests, or pressure tactics.
5. Guaranteed returns, unrealistic profits, urgency, payment requests, credential requests, impersonation, and suspicious links are important signals.
6. Return ONLY valid JSON matching the requested schema.

USER CONTENT:
"""
${input}
"""
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            detectedType: {
              type: "string",
            },
            summary: {
              type: "string",
            },
            redFlags: {
              type: "array",
              items: {
                type: "string",
              },
            },
            signals: {
              type: "object",
              properties: {
                guaranteedReturns: {
                  type: "boolean",
                },
                urgencyPressure: {
                  type: "boolean",
                },
                suspiciousLink: {
                  type: "boolean",
                },
                paymentRequest: {
                  type: "boolean",
                },
                credentialRequest: {
                  type: "boolean",
                },
                impersonation: {
                  type: "boolean",
                },
                unrealisticProfit: {
                  type: "boolean",
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
              ],
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
          },
          required: [
            "detectedType",
            "summary",
            "redFlags",
            "signals",
            "severity",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    let signals: GeminiSignals;

    try {
      signals = JSON.parse(response.text);
    } catch {
      console.error("Invalid Gemini JSON:", response.text);

      return NextResponse.json(
        {
          success: false,
          error: "AI returned an invalid analysis response.",
        },
        { status: 502 }
      );
    }

    const riskScore = calculateRisk(signals.signals);

    const verdict = getVerdict(riskScore);

    const result: AnalysisResult = {
      riskScore,
      verdict,
      summary:
        signals.summary ||
        "Rakshak analyzed the submitted content for common scam indicators.",
      redFlags:
        signals.redFlags.length > 0
          ? signals.redFlags.slice(0, 6)
          : ["No major scam indicators were detected."],
      advice: getAdvice(riskScore, signals.signals),
      detectedType:
        signals.detectedType || "Financial message",
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
  console.error("Rakshak analysis error:", error);

  const status =
    error?.status === 503 || error?.status === 429
      ? 503
      : 500;

  return NextResponse.json(
    {
      success: false,
      error:
        status === 503
          ? "Rakshak AI is temporarily busy. Please try again in a few seconds."
          : "Unable to analyze this content right now.",
    },
    { status }
  );
}
}
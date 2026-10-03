import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

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

type Language = "en" | "hi";

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
  let rawScore = 0;

  if (signals.guaranteedReturns) {
    rawScore += WEIGHTS.guaranteedReturns;
  }

  if (signals.urgencyPressure) {
    rawScore += WEIGHTS.urgencyPressure;
  }

  if (signals.suspiciousLink) {
    rawScore += WEIGHTS.suspiciousLink;
  }

  if (signals.paymentRequest) {
    rawScore += WEIGHTS.paymentRequest;
  }

  if (signals.credentialRequest) {
    rawScore += WEIGHTS.credentialRequest;
  }

  if (signals.impersonation) {
    rawScore += WEIGHTS.impersonation;
  }

  if (signals.unrealisticProfit) {
    rawScore += WEIGHTS.unrealisticProfit;
  }

  // Deterministic 0-100 score
  return Math.min(rawScore, 100);
}

function getVerdict(score: number) {
  if (score >= 71) return "High Risk Scam";
  if (score >= 41) return "Suspicious";
  return "Low Risk";
}

function normalizeSignals(raw: Partial<GeminiSignals>): GeminiSignals {
  return {
    guaranteedReturns: Boolean(raw.guaranteedReturns),
    urgencyPressure: Boolean(raw.urgencyPressure),
    suspiciousLink: Boolean(raw.suspiciousLink),
    paymentRequest: Boolean(raw.paymentRequest),
    credentialRequest: Boolean(raw.credentialRequest),
    impersonation: Boolean(raw.impersonation),
    unrealisticProfit: Boolean(raw.unrealisticProfit),
    summary:
      typeof raw.summary === "string"
        ? raw.summary
        : "No detailed summary was returned.",
    redFlags: Array.isArray(raw.redFlags)
      ? raw.redFlags.filter((x): x is string => typeof x === "string")
      : [],
    advice: Array.isArray(raw.advice)
      ? raw.advice.filter((x): x is string => typeof x === "string")
      : [],
    detectedType:
      typeof raw.detectedType === "string"
        ? raw.detectedType
        : "Unknown",
  };
}

const responseSchema = {
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
};

function buildPrompt(language: Language, sourceDescription: string) {
  const outputLanguage =
    language === "hi"
      ? "Hindi using Devanagari script"
      : "English";

  return `
You are Rakshak AI, a financial scam and investment fraud detection assistant for Indian retail investors.

Analyze the following user-provided content:
${sourceDescription}

Your task is to identify scam-related signals only.

IMPORTANT RULES:
1. Do NOT decide the final numerical risk score yourself.
2. Only extract the boolean scam signals.
3. The server calculates the final deterministic 0-100 score.
4. Do not accuse any person or organization of fraud as a proven fact.
5. Treat the result as a safety warning.
6. Only describe evidence actually present in the submitted content.
7. Do not invent URLs, names, claims, amounts, companies, or facts.
8. Natural-language output MUST be in ${outputLanguage}.
9. Keep all boolean field names exactly as provided.
10. Return valid JSON matching the provided schema.

Detect these signals:

- guaranteedReturns:
  Claims guaranteed, fixed, assured, risk-free, or certain investment returns.

- urgencyPressure:
  Says act now, today only, limited slots, final chance, countdown, immediate payment, or otherwise pressures the user to act immediately.

- suspiciousLink:
  Contains an unknown, shortened, lookalike, suspicious, or investment-related URL.

- paymentRequest:
  Requests UPI, bank transfer, crypto, wallet transfer, advance payment, processing fee, deposit, or any direct payment.

- credentialRequest:
  Requests OTP, PIN, password, CVV, Aadhaar, PAN, bank credentials, login credentials, KYC credentials, or other sensitive information.

- impersonation:
  Pretends to represent a bank, broker, government authority, celebrity, regulator, company, support team, or another trusted entity.

- unrealisticProfit:
  Promises unusually high, unrealistic, or extraordinary returns over a short period.

For summary:
- Keep it concise.
- Describe what was actually detected.

For redFlags:
- Return only the important evidence-based warning signs.

For advice:
- Give practical safety advice.
- Tell the user to verify independently before paying or sharing credentials.
- Do not provide personalized investment advice.

For detectedType:
- Use a concise category such as:
  "Investment Scam"
  "Ponzi Scheme"
  "Fake Advisory"
  "Phishing"
  "Payment Fraud"
  "Impersonation Scam"
  "Potentially Safe"
  or another accurate category based strictly on evidence.
`;
}

async function analyzeWithGemini(
  ai: GoogleGenAI,
  language: Language,
  textInput: string,
  imageData?: {
    base64: string;
    mimeType: string;
  }
) {
  const parts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [];

  let sourceDescription = "";

  if (textInput) {
    sourceDescription += `
--- TEXT CONTENT START ---
${textInput}
--- TEXT CONTENT END ---
`;
  }

  if (imageData) {
    sourceDescription += `
--- IMAGE CONTENT ---
A user-uploaded screenshot/image is attached.
Analyze visible text, URLs, logos, claims, payment requests, contact details,
urgency language, and suspicious patterns visible in the image.
--- IMAGE CONTENT END ---
`;
  }

  parts.push({
    text: buildPrompt(language, sourceDescription),
  });

  if (imageData) {
    parts.push({
      inlineData: {
        data: imageData.base64,
        mimeType: imageData.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(rawText) as Partial<GeminiSignals>;
  return normalizeSignals(parsed);
}

export async function POST(request: Request) {
  try {
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

    const contentType = request.headers.get("content-type") || "";

    let textInput = "";
    let language: Language = "en";
    let imageData:
      | {
          base64: string;
          mimeType: string;
        }
      | undefined;

    // -----------------------------
    // JSON request: text analysis
    // -----------------------------
    if (contentType.includes("application/json")) {
      const body = await request.json();

      textInput =
        typeof body.input === "string"
          ? body.input.trim()
          : "";

      language = body.language === "hi" ? "hi" : "en";
    }

    // -----------------------------------
    // Multipart request: text + image
    // -----------------------------------
    else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const input = formData.get("input");
      const languageValue = formData.get("language");
      const file = formData.get("image");

      textInput = typeof input === "string" ? input.trim() : "";
      language = languageValue === "hi" ? "hi" : "en";

      if (file instanceof File && file.size > 0) {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            {
              success: false,
              error: "Only JPG, PNG and WEBP images are supported.",
            },
            { status: 400 }
          );
        }

        // 8 MB safety limit
        if (file.size > 8 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              error: "Image must be smaller than 8 MB.",
            },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        imageData = {
          base64: buffer.toString("base64"),
          mimeType: file.type,
        };
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported request format.",
        },
        { status: 415 }
      );
    }

    // At least one input is required
    if (!textInput && !imageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide text or upload an image.",
        },
        { status: 400 }
      );
    }

    // Text should have enough content when text-only
    if (!imageData && textInput.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide more content.",
        },
        { status: 400 }
      );
    }

    const signals = await analyzeWithGemini(
      ai,
      language,
      textInput,
      imageData
    );

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

        signals: {
          guaranteedReturns: signals.guaranteedReturns,
          urgencyPressure: signals.urgencyPressure,
          suspiciousLink: signals.suspiciousLink,
          paymentRequest: signals.paymentRequest,
          credentialRequest: signals.credentialRequest,
          impersonation: signals.impersonation,
          unrealisticProfit: signals.unrealisticProfit,
        },
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
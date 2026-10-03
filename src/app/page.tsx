"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  ExternalLink,
  FileWarning,
  IndianRupee,
  Link2,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Mic,
  Moon,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
  TriangleAlert,
  X,
} from "lucide-react";

type Verdict =
  | "Safe"
  | "Suspicious"
  | "High Risk Scam";

type Language = "en" | "hi";

interface AnalysisResult {
  riskScore: number;
  verdict: Verdict;
  summary: string;
  redFlags: string[];
  advice: string[];
  detectedType: string;
}

interface AnalyzeResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
}

const INITIAL_RESULT: AnalysisResult = {
  riskScore: 0,
  verdict: "Safe",
  summary: "",
  redFlags: [],
  advice: [],
  detectedType: "",
};

const EXAMPLE_MESSAGES: Record<
  Language,
  string
> = {
  en:
    "URGENT: Guaranteed 30% return in 7 days! Invest ₹5,000 today through this exclusive link. Limited slots available. Send payment through UPI immediately. https://example-investment.com",

  hi:
    "जरूरी सूचना: 7 दिनों में 30% गारंटीड रिटर्न! आज ही ₹5,000 इस विशेष लिंक से निवेश करें। सीमित स्लॉट उपलब्ध हैं। तुरंत UPI से भुगतान करें। https://example-investment.com",
};

const UI_TEXT = {
  en: {
    safety: "Safety first",
    headerSubtitle:
      "Financial Scam Safety Assistant",

    badge: "Check before you invest",
    heroTitle:
      "Not sure if that investment message is real?",
    heroDescription:
      "Paste a forwarded WhatsApp message, Telegram tip, financial link, or investment claim. Rakshak AI checks for scam signals and explains what you should do next.",

    inputTitle:
      "Paste suspicious content",
    inputDescription:
      "WhatsApp • Telegram • SMS • URL • investment claim",
    inputPlaceholder:
      'Example: "Guaranteed 30% return in 7 days. Invest now..."',
    characters: "characters",
    tryExample: "Try an example",

    analyze: "Check with Rakshak AI",
    analyzingButton:
      "Rakshak AI is checking the message…",

    safetyTip1:
      "Never share OTPs or passwords",
    safetyTip2:
      "Verify before investing",

    loadingTitle:
      "Analyzing suspicious signals…",
    loadingDescription:
      "Rakshak AI is extracting signals before calculating the final risk score.",

    analysisResult: "Analysis result",
    found:
      "Here's what Rakshak found",
    recheck: "Re-check",

    risk: "risk / 100",
    detectedContent:
      "Detected content",

    redFlags:
      "Key red flags",
    redFlagsDescription:
      "Signals detected in the content",

    advice:
      "What you should do",
    adviceDescription:
      "Simple next steps",

    emergency:
      "Emergency Action",
    emergencyDescription:
      "This content has crossed Rakshak's intervention threshold. If you have already transferred money or shared sensitive information, act immediately.",

    cyberFraudHelpline:
      "Cyber fraud helpline",
    moneyLost:
      "If money has already been lost, report the financial cyber fraud as quickly as possible.",
    call1930: "Call 1930",

    officialReportingPortal:
      "Official reporting portal",
    portalDescription:
      "Use the official National Cyber Crime Reporting Portal for online cybercrime reporting.",
    openPortal:
      "Open Cyber Crime Portal",

    reportScamLink:
      "Report Scam Link",
    loggingReport:
      "Logging report…",
    scamReportLogged:
      "Scam report logged",
    localRegistryDescription:
      "This demo report has been added to Rakshak's local fraud registry.",

    disclaimerTitle:
      "Rakshak AI is a safety assistant",
    disclaimer:
      "A risk score is an automated warning signal, not proof that a person or organisation is fraudulent. Always verify financial claims through trusted official sources.",

    forwardedTitle:
      "Forwarded messages",
    forwardedDescription:
      "Check suspicious WhatsApp, Telegram, SMS, and social media claims.",

    linksTitle:
      "Financial links",
    linksDescription:
      "Identify warning signs before trusting an investment link.",

    investmentTitle:
      "Investment claims",
    investmentDescription:
      "Understand red flags like guaranteed returns and pressure tactics.",

    footerSafety:
      "Safety focused",
    footerVerify:
      "Verify independently",

    errorEmpty:
      "Please paste a WhatsApp message, Telegram tip, URL, or investment claim.",
    errorShort:
      "Please provide a little more content to analyze.",
    errorService:
      "Rakshak AI could not reach the analysis service. Please try again.",
    errorReport:
      "The local report could not be saved. Please try again.",

    errorMic:
      "Microphone access was blocked. Please allow microphone permission and try again.",

    errorRecording:
      "Audio recording could not be started. Please try again.",

    errorTranscription:
      "Voice transcription failed. Please try speaking again.",

    unsupportedMic:
      "This browser does not support audio recording. Please use Chrome or Edge.",

    verdictSafe:
      "Safe",

    verdictSuspicious:
      "Suspicious",

    verdictHighRisk:
      "High Risk Scam",

    detectedTypeFallback:
      "Financial content",

    languageButton:
      "हिन्दी",

    languageLabel:
      "Change language",

    liteMode:
      "Lite Mode",

    liteModeOn:
      "Data Saver ON",

    voiceInput:
      "Speak",

    stopVoice:
      "Stop",

    transcribing:
      "Transcribing…",

    darkModeLight:
      "Switch to light mode",

    darkModeDark:
      "Switch to dark mode",

    clearInput:
      "Clear input",
  },

  hi: {
    safety:
      "सुरक्षा पहले",

    headerSubtitle:
      "वित्तीय धोखाधड़ी सुरक्षा सहायक",

    badge:
      "निवेश करने से पहले जाँचें",

    heroTitle:
      "क्या आपको यकीन नहीं है कि यह निवेश संदेश असली है?",

    heroDescription:
      "फॉरवर्ड किया गया WhatsApp संदेश, Telegram टिप, वित्तीय लिंक या निवेश का दावा यहाँ पेस्ट करें। Rakshak AI धोखाधड़ी के संकेतों की जाँच करके बताता है कि आपको आगे क्या करना चाहिए।",

    inputTitle:
      "संदिग्ध सामग्री पेस्ट करें",

    inputDescription:
      "WhatsApp • Telegram • SMS • URL • निवेश का दावा",

    inputPlaceholder:
      'उदाहरण: "7 दिनों में 30% गारंटीड रिटर्न। अभी निवेश करें..."',

    characters:
      "कैरेक्टर",

    tryExample:
      "उदाहरण देखें",

    analyze:
      "Rakshak AI से जाँचें",

    analyzingButton:
      "Rakshak AI संदेश की जाँच कर रहा है…",

    safetyTip1:
      "OTP या पासवर्ड कभी साझा न करें",

    safetyTip2:
      "निवेश से पहले सत्यापित करें",

    loadingTitle:
      "संदिग्ध संकेतों की जाँच हो रही है…",

    loadingDescription:
      "Rakshak AI संकेत निकाल रहा है, उसके बाद Rakshak अंतिम जोखिम स्कोर निर्धारित करेगा।",

    analysisResult:
      "विश्लेषण परिणाम",

    found:
      "Rakshak को यह मिला",

    recheck:
      "फिर से जाँचें",

    risk:
      "जोखिम / 100",

    detectedContent:
      "पता चला कंटेंट",

    redFlags:
      "मुख्य चेतावनी संकेत",

    redFlagsDescription:
      "कंटेंट में पाए गए संकेत",

    advice:
      "आपको क्या करना चाहिए",

    adviceDescription:
      "अगले आसान कदम",

    emergency:
      "तुरंत कार्रवाई",

    emergencyDescription:
      "यह कंटेंट Rakshak की हस्तक्षेप सीमा पार कर चुका है। यदि आपने पैसे ट्रांसफर किए हैं या संवेदनशील जानकारी साझा की है, तो तुरंत कार्रवाई करें।",

    cyberFraudHelpline:
      "साइबर फ्रॉड हेल्पलाइन",

    moneyLost:
      "यदि पैसे पहले ही चले गए हैं, तो वित्तीय साइबर फ्रॉड की रिपोर्ट जितनी जल्दी हो सके करें।",

    call1930:
      "1930 पर कॉल करें",

    officialReportingPortal:
      "आधिकारिक रिपोर्टिंग पोर्टल",

    portalDescription:
      "ऑनलाइन साइबर अपराध की रिपोर्ट करने के लिए आधिकारिक National Cyber Crime Reporting Portal का उपयोग करें।",

    openPortal:
      "Cyber Crime Portal खोलें",

    reportScamLink:
      "स्कैम लिंक रिपोर्ट करें",

    loggingReport:
      "रिपोर्ट सेव हो रही है…",

    scamReportLogged:
      "स्कैम रिपोर्ट सेव हो गई",

    localRegistryDescription:
      "यह डेमो रिपोर्ट Rakshak की लोकल फ्रॉड रजिस्ट्री में जोड़ दी गई है।",

    disclaimerTitle:
      "Rakshak AI एक सुरक्षा सहायक है",

    disclaimer:
      "जोखिम स्कोर एक स्वचालित चेतावनी संकेत है, किसी व्यक्ति या संस्था के धोखाधड़ी करने का प्रमाण नहीं। वित्तीय दावों को हमेशा विश्वसनीय आधिकारिक स्रोतों से सत्यापित करें।",

    forwardedTitle:
      "फॉरवर्ड किए गए संदेश",

    forwardedDescription:
      "संदिग्ध WhatsApp, Telegram, SMS और सोशल मीडिया दावों की जाँच करें।",

    linksTitle:
      "वित्तीय लिंक",

    linksDescription:
      "किसी निवेश लिंक पर भरोसा करने से पहले चेतावनी संकेत पहचानें।",

    investmentTitle:
      "निवेश के दावे",

    investmentDescription:
      "गारंटीड रिटर्न और दबाव जैसी चेतावनियों को समझें।",

    footerSafety:
      "सुरक्षा पर केंद्रित",

    footerVerify:
      "स्वतंत्र रूप से सत्यापित करें",

    errorEmpty:
      "कृपया WhatsApp संदेश, Telegram टिप, URL या निवेश का दावा पेस्ट करें।",

    errorShort:
      "जाँच के लिए थोड़ी और जानकारी दें।",

    errorService:
      "Rakshak AI विश्लेषण सेवा तक नहीं पहुँच सका। कृपया फिर से प्रयास करें।",

    errorReport:
      "लोकल रिपोर्ट सेव नहीं हो सकी। कृपया फिर से प्रयास करें।",

    errorMic:
      "माइक्रोफोन की अनुमति नहीं मिली। Microphone permission allow करके फिर से प्रयास करें।",

    errorRecording:
      "ऑडियो रिकॉर्डिंग शुरू नहीं हो सकी। फिर से प्रयास करें।",

    errorTranscription:
      "Voice transcription fail हो गई। फिर से बोलकर देखें।",

    unsupportedMic:
      "इस browser में audio recording supported नहीं है। Chrome या Edge इस्तेमाल करें।",

    verdictSafe:
      "सुरक्षित",

    verdictSuspicious:
      "संदिग्ध",

    verdictHighRisk:
      "उच्च जोखिम स्कैम",

    detectedTypeFallback:
      "वित्तीय सामग्री",

    languageButton:
      "English",

    languageLabel:
      "भाषा बदलें",

    liteMode:
      "लाइट मोड",

    liteModeOn:
      "डेटा बचत ON",

    voiceInput:
      "बोलें",

    stopVoice:
      "रोकें",

    transcribing:
      "ट्रांसक्राइब हो रहा है…",

    darkModeLight:
      "लाइट मोड पर जाएँ",

    darkModeDark:
      "डार्क मोड पर जाएँ",

    clearInput:
      "इनपुट साफ़ करें",
  },
} as const;

function getScoreColor(
  score: number,
  darkMode: boolean
) {
  if (score > 70) {
    return darkMode
      ? "text-red-400"
      : "text-red-600";
  }

  if (score > 40) {
    return darkMode
      ? "text-amber-400"
      : "text-amber-600";
  }

  return darkMode
    ? "text-emerald-400"
    : "text-emerald-600";
}

function getVerdictStyles(
  verdict: Verdict,
  darkMode: boolean
) {
  if (verdict === "High Risk Scam") {
    return darkMode
      ? "border-red-900 bg-red-950/40 text-red-300"
      : "border-red-200 bg-red-50 text-red-700";
  }

  if (verdict === "Suspicious") {
    return darkMode
      ? "border-amber-900 bg-amber-950/40 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  return darkMode
    ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getVerdictLabel(
  verdict: Verdict,
  language: Language
) {
  if (language === "hi") {
    if (verdict === "High Risk Scam") {
      return UI_TEXT.hi.verdictHighRisk;
    }

    if (verdict === "Suspicious") {
      return UI_TEXT.hi.verdictSuspicious;
    }

    return UI_TEXT.hi.verdictSafe;
  }

  return verdict;
}

export default function Home() {
  const [darkMode, setDarkMode] =
    useState(false);

  const [language, setLanguage] =
    useState<Language>("en");

  const [liteMode, setLiteMode] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [result, setResult] =
    useState<AnalysisResult>(
      INITIAL_RESULT
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [reporting, setReporting] =
    useState(false);

  const [reported, setReported] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [transcribing, setTranscribing] =
    useState(false);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(
      null
    );

  const chunksRef =
    useRef<BlobPart[]>([]);

  const timerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const t = UI_TEXT[language];

  const hasResult =
    result.summary.length > 0;

  const scoreRing = useMemo(() => {
    const radius = 54;

    const circumference =
      2 * Math.PI * radius;

    const score = Math.min(
      Math.max(result.riskScore, 0),
      100
    );

    return {
      circumference,
      offset:
        circumference -
        (score / 100) *
          circumference,
    };
  }, [result.riskScore]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }

      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });
    };
  }, []);

  async function analyzeContent(
    event?: FormEvent
  ) {
    event?.preventDefault();

    const cleaned =
      input.trim();

    if (!cleaned) {
      setError(
        t.errorEmpty
      );
      return;
    }

    if (cleaned.length < 8) {
      setError(
        t.errorShort
      );
      return;
    }

    setLoading(true);
    setError("");
    setReported(false);

    try {
      const response =
        await fetch(
          "/api/analyze",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              input: cleaned,
              language,
            }),
          }
        );

      const raw =
        await response.text();

      let data: AnalyzeResponse;

      try {
        data = JSON.parse(raw);
      } catch {
        console.error(
          "Analyze raw response:",
          raw
        );

        throw new Error(
          "Analysis server returned invalid JSON."
        );
      }

      if (
        !response.ok ||
        !data.success ||
        !data.result
      ) {
        throw new Error(
          data.error ||
            "Invalid analysis response."
        );
      }

      setResult({
        ...data.result,

        riskScore: Math.min(
          Math.max(
            Number(
              data.result.riskScore
            ) || 0,
            0
          ),
          100
        ),

        summary:
          data.result.summary?.trim() ||
          t.detectedTypeFallback,

        redFlags:
          Array.isArray(
            data.result.redFlags
          )
            ? data.result.redFlags
            : [],

        advice:
          Array.isArray(
            data.result.advice
          )
            ? data.result.advice
            : [],

        detectedType:
          data.result.detectedType?.trim() ||
          t.detectedTypeFallback,
      });
    } catch (err) {
      console.error(
        "Analysis error:",
        err
      );

      setError(
        t.errorService
      );
    } finally {
      setLoading(false);
    }
  }

  function useExample() {
    stopRecording();

    setInput(
      EXAMPLE_MESSAGES[language]
    );

    setResult(
      INITIAL_RESULT
    );

    setError("");
    setReported(false);
  }

  function clearInput() {
    stopRecording();

    setInput("");

    setResult(
      INITIAL_RESULT
    );

    setError("");
    setReported(false);
  }

  function toggleLanguage() {
    stopRecording();

    setLanguage(
      (previous) =>
        previous === "en"
          ? "hi"
          : "en"
    );

    setError("");
  }

  function getSupportedMimeType() {
    if (
      typeof MediaRecorder ===
        "undefined" ||
      typeof MediaRecorder
        .isTypeSupported !==
        "function"
    ) {
      return "";
    }

    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    return (
      types.find((type) =>
        MediaRecorder.isTypeSupported(
          type
        )
      ) || ""
    );
  }

  function stopRecording() {
    if (timerRef.current) {
      clearTimeout(
        timerRef.current
      );

      timerRef.current = null;
    }

    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.stop();
    }
  }

  async function startVoiceRecording() {
    if (
      recording ||
      transcribing
    ) {
      stopRecording();
      return;
    }

    if (
      typeof window ===
        "undefined"
    ) {
      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      setError(
        t.unsupportedMic
      );

      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      setError(
        t.unsupportedMic
      );

      return;
    }

    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
            },
          }
        );

      streamRef.current =
        stream;

      const mimeType =
        getSupportedMimeType();

      const recorder = mimeType
        ? new MediaRecorder(
            stream,
            {
              mimeType,
            }
          )
        : new MediaRecorder(
            stream
          );

      mediaRecorderRef.current =
        recorder;

      chunksRef.current = [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        async () => {
          if (timerRef.current) {
            clearTimeout(
              timerRef.current
            );

            timerRef.current =
              null;
          }

          const recordedType =
            recorder.mimeType ||
            mimeType ||
            "audio/webm";

          const audioBlob =
            new Blob(
              chunksRef.current,
              {
                type: recordedType,
              }
            );

          chunksRef.current = [];

          stream
            .getTracks()
            .forEach(
              (track) => {
                track.stop();
              }
            );

          streamRef.current =
            null;

          mediaRecorderRef.current =
            null;

          setRecording(false);

          if (
            audioBlob.size === 0
          ) {
            setError(
              t.errorRecording
            );

            return;
          }

          await transcribeAudio(
            audioBlob
          );
        };

      recorder.onerror = () => {
        if (timerRef.current) {
          clearTimeout(
            timerRef.current
          );

          timerRef.current =
            null;
        }

        stream
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );

        streamRef.current =
          null;

        mediaRecorderRef.current =
          null;

        setRecording(false);

        setError(
          t.errorRecording
        );
      };

      recorder.start(250);

      setRecording(true);

      timerRef.current =
        setTimeout(() => {
          if (
            recorder.state !==
            "inactive"
          ) {
            recorder.stop();
          }
        }, 12000);
    } catch (err) {
      console.error(
        "Microphone error:",
        err
      );

      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current =
        null;

      mediaRecorderRef.current =
        null;

      setRecording(false);

      if (
        err instanceof DOMException &&
        err.name ===
          "NotAllowedError"
      ) {
        setError(
          t.errorMic
        );

        return;
      }

      setError(
        t.errorRecording
      );
    }
  }

  async function transcribeAudio(
    audioBlob: Blob
  ) {
    setTranscribing(true);
    setError("");

    try {
      /*
       * Convert audio Blob to Base64.
       *
       * This avoids multipart/FormData handling and
       * sends a normal JSON request to /api/transcribe.
       */
      const arrayBuffer =
        await audioBlob.arrayBuffer();

      const bytes =
        new Uint8Array(
          arrayBuffer
        );

      let binary = "";

      const chunkSize =
        0x8000;

      for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
      ) {
        const chunk =
          bytes.subarray(
            i,
            Math.min(
              i + chunkSize,
              bytes.length
            )
          );

        binary += String.fromCharCode(
          ...chunk
        );
      }

      const audioBase64 =
        btoa(binary);

      const response =
        await fetch(
          "/api/transcribe",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              audioBase64,

              mimeType:
                audioBlob.type ||
                "audio/webm",

              language,
            }),
          }
        );

      const raw =
        await response.text();

      let data: {
        success?: boolean;
        transcript?: string;
        error?: string;
      };

      try {
        data = JSON.parse(raw);
      } catch {
        console.error(
          "Transcription HTTP status:",
          response.status
        );

        console.error(
          "Transcription raw response:",
          raw
        );

        throw new Error(
          `Transcription server returned invalid JSON (${response.status}).`
        );
      }

      if (
        !response.ok ||
        !data.success ||
        !data.transcript
      ) {
        throw new Error(
          data.error ||
            "Voice transcription failed."
        );
      }

      const transcript =
        String(
          data.transcript
        ).trim();

      if (!transcript) {
        throw new Error(
          "Empty transcript received."
        );
      }

      setInput(
        (previous) => {
          const separator =
            previous.trim()
              ? " "
              : "";

          return `${previous}${separator}${transcript}`.slice(
            0,
            5000
          );
        }
      );
    } catch (err) {
      console.error(
        "Transcription error:",
        err
      );

      setError(
        t.errorTranscription
      );
    } finally {
      setTranscribing(false);
    }
  }

  async function reportScam() {
    if (
      !hasResult ||
      result.riskScore <= 40
    ) {
      return;
    }

    setReporting(true);

    try {
      const report = {
        reportId:
          `RAK-${Date.now()}`,

        createdAt:
          new Date().toISOString(),

        riskScore:
          result.riskScore,

        verdict:
          result.verdict,

        detectedType:
          result.detectedType,

        language,

        content:
          input.slice(0, 1000),
      };

      const rawExisting =
        localStorage.getItem(
          "rakshak-fraud-registry"
        );

      const existing: unknown[] =
        rawExisting
          ? JSON.parse(
              rawExisting
            )
          : [];

      if (
        !Array.isArray(
          existing
        )
      ) {
        throw new Error(
          "Invalid local registry."
        );
      }

      existing.push(report);

      localStorage.setItem(
        "rakshak-fraud-registry",
        JSON.stringify(
          existing
        )
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            700
          )
      );

      setReported(true);
    } catch (err) {
      console.error(
        "Report error:",
        err
      );

      setError(
        t.errorReport
      );
    } finally {
      setReporting(false);
    }
  }

  const verdictLabel =
    getVerdictLabel(
      result.verdict,
      language
    );

  const cardShadow =
    liteMode
      ? ""
      : "shadow-sm";

  return (
    <main
      className={`min-h-screen ${
        darkMode
          ? "bg-[#0b1120] text-slate-100"
          : "bg-[#f7f9fc] text-slate-900"
      }`}
    >
      {/* HEADER */}
      <header
        className={`border-b ${
          darkMode
            ? "border-slate-800 bg-[#111827]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {/* BRAND */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <h1
                className={`text-[17px] font-bold tracking-tight ${
                  darkMode
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Rakshak AI
              </h1>

              <p
                className={`hidden truncate text-[11px] sm:block ${
                  darkMode
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                {t.headerSubtitle}
              </p>
            </div>
          </div>

          {/* HEADER CONTROLS */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* SAFETY */}
            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold lg:flex ${
                darkMode
                  ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t.safety}
            </div>

            {/* LANGUAGE */}
            <button
              type="button"
              onClick={
                toggleLanguage
              }
              className={`rounded-xl border px-2.5 py-2 text-xs font-bold sm:px-3 ${
                darkMode
                  ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              aria-label={
                t.languageLabel
              }
            >
              {t.languageButton}
            </button>

            {/* LITE MODE */}
            <button
              type="button"
              onClick={() =>
                setLiteMode(
                  (value) => !value
                )
              }
              className={`rounded-xl border px-2.5 py-2 text-xs font-bold sm:px-3 ${
                liteMode
                  ? darkMode
                    ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : darkMode
                    ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              aria-pressed={
                liteMode
              }
            >
              <span className="hidden sm:inline">
                {liteMode
                  ? t.liteModeOn
                  : t.liteMode}
              </span>

              <span className="sm:hidden">
                {liteMode
                  ? "ON"
                  : "Lite"}
              </span>
            </button>

            {/* DARK MODE */}
            <button
              type="button"
              onClick={() =>
                setDarkMode(
                  (value) => !value
                )
              }
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                darkMode
                  ? "border-slate-700 bg-slate-800 text-amber-300"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
              aria-label={
                darkMode
                  ? t.darkModeLight
                  : t.darkModeDark
              }
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              darkMode
                ? "border-blue-900 bg-blue-950/50 text-blue-300"
                : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />

            {t.badge}
          </div>

          <h2
            className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${
              darkMode
                ? "text-white"
                : "text-slate-950"
            }`}
          >
            {t.heroTitle}
          </h2>

          <p
            className={`mx-auto mt-4 max-w-2xl text-sm leading-6 sm:text-base ${
              darkMode
                ? "text-slate-400"
                : "text-slate-600"
            }`}
          >
            {t.heroDescription}
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="mx-auto mt-8 max-w-4xl">
          <div
            className={`overflow-hidden rounded-2xl border ${cardShadow} ${
              darkMode
                ? "border-slate-700 bg-[#111827]"
                : "border-slate-200 bg-white"
            }`}
          >
            {/* CARD HEADER */}
            <div
              className={`border-b px-5 py-4 sm:px-6 ${
                darkMode
                  ? "border-slate-800"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />

                <h3
                  className={`font-bold ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  {t.inputTitle}
                </h3>
              </div>

              <p
                className={`mt-1 text-xs ${
                  darkMode
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                {t.inputDescription}
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={
                analyzeContent
              }
              className="p-5 sm:p-6"
            >
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(event) => {
                    setInput(
                      event.target.value
                    );

                    setError("");
                  }}
                  maxLength={5000}
                  placeholder={
                    t.inputPlaceholder
                  }
                  className={`min-h-[180px] w-full resize-y rounded-xl border px-4 py-4 pb-16 pr-12 text-sm leading-6 outline-none focus:ring-4 ${
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-950/50"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-50"
                  }`}
                  aria-label={
                    t.inputTitle
                  }
                />

                {/* CLEAR */}
                {input && (
                  <button
                    type="button"
                    onClick={
                      clearInput
                    }
                    className={`absolute right-3 top-3 rounded-lg p-1.5 ${
                      darkMode
                        ? "text-slate-500 hover:bg-slate-800"
                        : "text-slate-400 hover:bg-slate-200"
                    }`}
                    aria-label={
                      t.clearInput
                    }
                    title={
                      t.clearInput
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* MIC */}
                <button
                  type="button"
                  onClick={
                    recording
                      ? stopRecording
                      : startVoiceRecording
                  }
                  disabled={
                    transcribing
                  }
                  className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border ${
                    recording
                      ? "border-red-300 bg-red-50 text-red-600"
                      : darkMode
                        ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  aria-label={
                    recording
                      ? t.stopVoice
                      : t.voiceInput
                  }
                  title={
                    recording
                      ? t.stopVoice
                      : t.voiceInput
                  }
                >
                  {transcribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : recording ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* RECORDING STATUS */}
              {recording && (
                <div
                  className={`mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                    darkMode
                      ? "bg-red-950/30 text-red-300"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-red-400" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>

                  {language ===
                  "hi"
                    ? "सुन रहा है… अधिकतम 12 सेकंड"
                    : "Listening… maximum 12 seconds"}
                </div>
              )}

              {/* TRANSCRIBING STATUS */}
              {transcribing && (
                <div
                  className={`mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                    darkMode
                      ? "bg-blue-950/30 text-blue-300"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />

                  {t.transcribing}
                </div>
              )}

              {/* CHARACTER COUNT + EXAMPLE */}
              <div
                className={`mt-2 flex items-center justify-between text-[11px] ${
                  darkMode
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                <span>
                  {input.length}/5000{" "}
                  {t.characters}
                </span>

                <button
                  type="button"
                  onClick={
                    useExample
                  }
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-500 hover:text-blue-400"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />

                  {t.tryExample}
                </button>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                    darkMode
                      ? "border-red-900 bg-red-950/40 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              {/* ANALYZE BUTTON */}
              <button
                type="submit"
                disabled={
                  loading ||
                  recording ||
                  transcribing
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    {t.analyzingButton}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />

                    {t.analyze}

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* SAFETY TIPS */}
              <div
                className={`mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] ${
                  darkMode
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="h-3.5 w-3.5" />

                  {t.safetyTip1}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />

                  {t.safetyTip2}
                </span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
          <div
            className={`rounded-2xl border p-6 ${cardShadow} ${
              darkMode
                ? "border-slate-700 bg-[#111827]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  darkMode
                    ? "bg-blue-950/60"
                    : "bg-blue-50"
                }`}
              >
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>

              <div>
                <p
                  className={`text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-800"
                  }`}
                >
                  {t.loadingTitle}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    darkMode
                      ? "text-slate-500"
                      : "text-slate-500"
                  }`}
                >
                  {t.loadingDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {hasResult &&
        !loading && (
          <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
            {/* MAIN RESULT */}
            <div
              className={`overflow-hidden rounded-2xl border ${cardShadow} ${
                darkMode
                  ? "border-slate-700 bg-[#111827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`border-b px-5 py-4 sm:px-6 ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        darkMode
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {t.analysisResult}
                    </p>

                    <h3
                      className={`mt-1 text-lg font-bold ${
                        darkMode
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      {t.found}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      analyzeContent()
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                      darkMode
                        ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />

                    {t.recheck}
                  </button>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr]">
                {/* SCORE */}
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl p-5 ${
                    darkMode
                      ? "bg-slate-900"
                      : "bg-slate-50"
                  }`}
                >
                  <div className="relative h-36 w-36">
                    <svg
                      className="-rotate-90"
                      viewBox="0 0 128 128"
                    >
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9"
                        className={
                          darkMode
                            ? "text-slate-800"
                            : "text-slate-200"
                        }
                      />

                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={
                          scoreRing.circumference
                        }
                        strokeDashoffset={
                          scoreRing.offset
                        }
                        className={getScoreColor(
                          result.riskScore,
                          darkMode
                        )}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className={`text-3xl font-extrabold ${getScoreColor(
                          result.riskScore,
                          darkMode
                        )}`}
                      >
                        {
                          result.riskScore
                        }
                      </span>

                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          darkMode
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {t.risk}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${getVerdictStyles(
                      result.verdict,
                      darkMode
                    )}`}
                  >
                    {result.verdict ===
                      "Safe" && (
                      <ShieldCheck className="h-4 w-4" />
                    )}

                    {result.verdict ===
                      "Suspicious" && (
                      <TriangleAlert className="h-4 w-4" />
                    )}

                    {result.verdict ===
                      "High Risk Scam" && (
                      <ShieldAlert className="h-4 w-4" />
                    )}

                    {verdictLabel}
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="flex flex-col justify-center">
                  <div
                    className={`flex items-center gap-2 text-xs font-semibold ${
                      darkMode
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    <FileWarning className="h-4 w-4" />

                    {t.detectedContent}
                  </div>

                  <p
                    className={`mt-1 font-semibold ${
                      darkMode
                        ? "text-slate-200"
                        : "text-slate-800"
                    }`}
                  >
                    {result.detectedType ||
                      t.detectedTypeFallback}
                  </p>

                  <p
                    className={`mt-5 text-sm leading-6 ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* RED FLAGS + ADVICE */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* RED FLAGS */}
              <div
                className={`rounded-2xl border p-5 ${cardShadow} sm:p-6 ${
                  darkMode
                    ? "border-slate-700 bg-[#111827]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <TriangleAlert className="h-4 w-4" />
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        darkMode
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {t.redFlags}
                    </h3>

                    <p
                      className={`text-[11px] ${
                        darkMode
                          ? "text-slate-600"
                          : "text-slate-500"
                      }`}
                    >
                      {
                        t.redFlagsDescription
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {result.redFlags
                    .length > 0 ? (
                    result.redFlags.map(
                      (
                        flag,
                        index
                      ) => (
                        <div
                          key={`${flag}-${index}`}
                          className={`flex gap-3 rounded-xl p-3 ${
                            darkMode
                              ? "bg-red-950/20"
                              : "bg-red-50/70"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              darkMode
                                ? "bg-red-950 text-red-300"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {index +
                              1}
                          </span>

                          <p
                            className={`text-xs leading-5 ${
                              darkMode
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {flag}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <div
                      className={`rounded-xl p-4 text-xs leading-5 ${
                        darkMode
                          ? "bg-emerald-950/20 text-emerald-300"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {language ===
                      "hi"
                        ? "कोई स्पष्ट चेतावनी संकेत नहीं मिले। फिर भी निवेश से पहले स्वतंत्र सत्यापन करें।"
                        : "No clear warning signals were detected. Still verify independently before investing."}
                    </div>
                  )}
                </div>
              </div>

              {/* ADVICE */}
              <div
                className={`rounded-2xl border p-5 ${cardShadow} sm:p-6 ${
                  darkMode
                    ? "border-slate-700 bg-[#111827]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        darkMode
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {t.advice}
                    </h3>

                    <p
                      className={`text-[11px] ${
                        darkMode
                          ? "text-slate-600"
                          : "text-slate-500"
                      }`}
                    >
                      {
                        t.adviceDescription
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {result.advice
                    .length > 0 ? (
                    result.advice.map(
                      (
                        advice,
                        index
                      ) => (
                        <div
                          key={`${advice}-${index}`}
                          className={`flex gap-3 rounded-xl border p-3 ${
                            darkMode
                              ? "border-emerald-900/50 bg-emerald-950/20"
                              : "border-emerald-100 bg-emerald-50/60"
                          }`}
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                          <p
                            className={`text-xs leading-5 ${
                              darkMode
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {advice}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <div
                      className={`rounded-xl p-4 text-xs leading-5 ${
                        darkMode
                          ? "bg-slate-900 text-slate-400"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {language ===
                      "hi"
                        ? "अभी कोई अतिरिक्त सलाह उपलब्ध नहीं है।"
                        : "No additional advice is available."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EMERGENCY */}
            {result.riskScore >
              40 && (
              <div
                className={`mt-5 overflow-hidden rounded-2xl border-2 ${cardShadow} ${
                  darkMode
                    ? "border-red-900 bg-[#1a1115]"
                    : "border-red-200 bg-white"
                }`}
              >
                <div
                  className={`border-b px-5 py-4 sm:px-6 ${
                    darkMode
                      ? "border-red-900 bg-red-950/30"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        darkMode
                          ? "bg-red-950 text-red-400"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <ShieldAlert className="h-5 w-5" />
                    </div>

                    <div>
                      <h3
                        className={`text-base font-extrabold ${
                          darkMode
                            ? "text-red-300"
                            : "text-red-800"
                        }`}
                      >
                        {t.emergency}
                      </h3>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          darkMode
                            ? "text-red-300/70"
                            : "text-red-700"
                        }`}
                      >
                        {
                          t.emergencyDescription
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
                  {/* 1930 */}
                  <div
                    className={`rounded-xl border p-4 ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
                        <Phone className="h-4 w-4" />
                      </div>

                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          {
                            t.cyberFraudHelpline
                          }
                        </p>

                        <a
                          href="tel:1930"
                          className="text-2xl font-extrabold text-red-600"
                        >
                          1930
                        </a>
                      </div>
                    </div>

                    <p
                      className={`mt-3 text-xs leading-5 ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {t.moneyLost}
                    </p>

                    <a
                      href="tel:1930"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white hover:bg-red-700"
                    >
                      <Phone className="h-4 w-4" />

                      {t.call1930}
                    </a>
                  </div>

                  {/* PORTAL */}
                  <div
                    className={`rounded-xl border p-4 ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          darkMode
                            ? "bg-blue-950 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </div>

                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          {
                            t.officialReportingPortal
                          }
                        </p>

                        <p
                          className={`font-bold ${
                            darkMode
                              ? "text-slate-200"
                              : "text-slate-800"
                          }`}
                        >
                          cybercrime.gov.in
                        </p>
                      </div>
                    </div>

                    <p
                      className={`mt-3 text-xs leading-5 ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {
                        t.portalDescription
                      }
                    </p>

                    <a
                      href="https://cybercrime.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      {t.openPortal}

                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* REPORT */}
                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                  {!reported ? (
                    <button
                      type="button"
                      onClick={
                        reportScam
                      }
                      disabled={
                        reporting
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                        darkMode
                          ? "border-red-800 text-red-300 hover:bg-red-950/40"
                          : "border-red-200 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {reporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          {t.loggingReport}
                        </>
                      ) : (
                        <>
                          <FileWarning className="h-4 w-4" />

                          {t.reportScamLink}
                        </>
                      )}
                    </button>
                  ) : (
                    <div
                      className={`flex items-center gap-3 rounded-xl border p-4 ${
                        darkMode
                          ? "border-emerald-900 bg-emerald-950/20"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                      <div>
                        <p
                          className={`text-sm font-bold ${
                            darkMode
                              ? "text-emerald-300"
                              : "text-emerald-800"
                          }`}
                        >
                          {
                            t.scamReportLogged
                          }
                        </p>

                        <p
                          className={`mt-0.5 text-xs ${
                            darkMode
                              ? "text-emerald-300/70"
                              : "text-emerald-700"
                          }`}
                        >
                          {
                            t.localRegistryDescription
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DISCLAIMER */}
            <div
              className={`mt-4 rounded-2xl border p-5 ${
                darkMode
                  ? "border-blue-900/60 bg-blue-950/20"
                  : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

                <div>
                  <p
                    className={`text-sm font-bold ${
                      darkMode
                        ? "text-blue-300"
                        : "text-blue-900"
                    }`}
                  >
                    {
                      t.disclaimerTitle
                    }
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      darkMode
                        ? "text-blue-300/70"
                        : "text-blue-800/80"
                    }`}
                  >
                    {t.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* FEATURE CARDS */}
      {!hasResult &&
        !loading && (
          <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                darkMode={
                  darkMode
                }
                liteMode={
                  liteMode
                }
                icon={
                  <MessageCircle className="h-5 w-5" />
                }
                title={
                  t.forwardedTitle
                }
                description={
                  t.forwardedDescription
                }
              />

              <FeatureCard
                darkMode={
                  darkMode
                }
                liteMode={
                  liteMode
                }
                icon={
                  <Link2 className="h-5 w-5" />
                }
                title={
                  t.linksTitle
                }
                description={
                  t.linksDescription
                }
              />

              <FeatureCard
                darkMode={
                  darkMode
                }
                liteMode={
                  liteMode
                }
                icon={
                  <IndianRupee className="h-5 w-5" />
                }
                title={
                  t.investmentTitle
                }
                description={
                  t.investmentDescription
                }
              />
            </div>
          </section>
        )}

      {/* FOOTER */}
      <footer
        className={`border-t ${
          darkMode
            ? "border-slate-800 bg-[#111827]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-center text-[11px] sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
          <p className="text-slate-500">
            © 2026 Rakshak AI · Built by{" "}
            <span
              className={`font-semibold ${
                darkMode
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              Abhas
            </span>
          </p>

          <div className="flex items-center justify-center gap-4 text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5" />

              {t.footerSafety}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />

              {t.footerVerify}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  darkMode,
  liteMode,
  icon,
  title,
  description,
}: {
  darkMode: boolean;
  liteMode: boolean;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        liteMode
          ? ""
          : "shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      } ${
        darkMode
          ? "border-slate-700 bg-[#111827]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          darkMode
            ? "bg-blue-950/60 text-blue-400"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`mt-4 text-sm font-bold ${
          darkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1.5 text-xs leading-5 ${
          darkMode
            ? "text-slate-500"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
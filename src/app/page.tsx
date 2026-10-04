"use client";

import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileImage,
  Image as ImageIcon,
  Languages,
  Loader2,
  Mic,
  MicOff,
  Moon,
  PhoneCall,
  Shield,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";

type Language = "en" | "hi";

type AnalysisResult = {
  riskScore: number;
  verdict: string;
  summary: string;
  redFlags: string[];
  advice: string[];
  detectedType: string;
};

type AnalyzeResponse = {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
};

const TEXT = {
  en: {
    badge: "REAL-TIME INVESTOR PROTECTION",
    title: "Check before you trust.",
    subtitle:
      "Upload a suspicious screenshot, paste a message, or speak it out. Rakshak AI detects scam signals in seconds.",
    inputTitle: "Analyze suspicious content",
    inputSubtitle:
      "Upload a WhatsApp / Telegram screenshot or enter the message manually.",
    uploadTitle: "Upload Screenshot",
    uploadHint: "Drag & drop your image here",
    browse: "Browse files",
    supported: "JPG, PNG or WEBP • Max 8 MB",
    remove: "Remove",
    placeholder:
      "Paste the suspicious WhatsApp / Telegram message here...",
    voice: "Voice input",
    stopVoice: "Stop recording",
    analyze: "Analyze with Rakshak AI",
    analyzing: "Analyzing...",
    resultTitle: "Risk assessment",
    score: "Risk score",
    detected: "What Rakshak detected",
    redFlags: "Red flags",
    whatNow: "What to do now",
    report: "Report / Escalate",
    helpline: "1930 Cyber Helpline",
    portal: "cybercrime.gov.in",
    howWorks: "How Rakshak works",
    builtFor: "Built for Bharat",
    lite: "Lite Mode",
    light: "Light",
    dark: "Dark",
    safeNote: "Safety warning only — not financial advice.",
    secureNote: "Your Gemini API key stays server-side.",
    empty: "Please paste a message or upload a screenshot.",
    badImage: "Only JPG, PNG and WEBP images are supported.",
    largeImage: "Image must be smaller than 8 MB.",
    micUnsupported:
      "Voice input is not supported in this browser. Use Chrome or Edge.",
    micError: "Could not capture voice input.",
    serviceError: "Analysis failed. Please try again.",
    lowRisk: "Low Risk",
    suspicious: "Suspicious",
    highRisk: "High Risk Scam",
  },
  hi: {
    badge: "रीयल-टाइम निवेशक सुरक्षा",
    title: "भरोसा करने से पहले जाँचें।",
    subtitle:
      "संदिग्ध स्क्रीनशॉट अपलोड करें, मैसेज पेस्ट करें या बोलकर बताएं। Rakshak AI कुछ सेकंड में फ्रॉड संकेत पहचानता है।",
    inputTitle: "संदिग्ध सामग्री की जाँच करें",
    inputSubtitle:
      "WhatsApp / Telegram का स्क्रीनशॉट अपलोड करें या मैसेज स्वयं डालें।",
    uploadTitle: "स्क्रीनशॉट अपलोड करें",
    uploadHint: "इमेज यहाँ ड्रैग और ड्रॉप करें",
    browse: "फाइल चुनें",
    supported: "JPG, PNG या WEBP • अधिकतम 8 MB",
    remove: "हटाएँ",
    placeholder:
      "संदिग्ध WhatsApp / Telegram मैसेज यहाँ पेस्ट करें...",
    voice: "आवाज़ इनपुट",
    stopVoice: "रिकॉर्डिंग रोकें",
    analyze: "Rakshak AI से जाँचें",
    analyzing: "जाँच जारी है...",
    resultTitle: "जोखिम आकलन",
    score: "जोखिम स्कोर",
    detected: "Rakshak ने क्या पाया",
    redFlags: "चेतावनी संकेत",
    whatNow: "अभी क्या करें",
    report: "रिपोर्ट / एस्केलेट",
    helpline: "1930 साइबर हेल्पलाइन",
    portal: "cybercrime.gov.in",
    howWorks: "Rakshak कैसे काम करता है",
    builtFor: "भारत के लिए बनाया गया",
    lite: "लाइट मोड",
    light: "लाइट",
    dark: "डार्क",
    safeNote: "यह केवल सुरक्षा चेतावनी है — वित्तीय सलाह नहीं।",
    secureNote: "आपकी Gemini API key सर्वर पर सुरक्षित रहती है।",
    empty: "कृपया मैसेज पेस्ट करें या स्क्रीनशॉट अपलोड करें।",
    badImage: "सिर्फ JPG, PNG और WEBP इमेज समर्थित हैं।",
    largeImage: "इमेज 8 MB से छोटी होनी चाहिए।",
    micUnsupported:
      "इस browser में voice input उपलब्ध नहीं है। Chrome या Edge इस्तेमाल करें।",
    micError: "Voice input capture नहीं हो सका।",
    serviceError: "जाँच विफल हुई। कृपया फिर से प्रयास करें।",
    lowRisk: "कम जोखिम",
    suspicious: "संदिग्ध",
    highRisk: "उच्च जोखिम स्कैम",
  },
} as const;

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const [liteMode, setLiteMode] = useState(false);

  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reported, setReported] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = TEXT[language];

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  function handleFile(file?: File) {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t.badImage);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(t.largeImage);
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  }

  function removeImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function startVoice() {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setError(t.micUnsupported);
    return;
  }

  if (isRecording) {
    try {
      recognitionRef.current?.stop();
    } catch {}

    setIsRecording(false);
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang =
    language === "hi" ? "hi-IN" : "en-IN";

  // IMPORTANT:
  // Only final results are accepted.
  recognition.interimResults = false;

  // Keep listening until user presses stop.
  recognition.continuous = true;

  recognition.onstart = () => {
    setIsRecording(true);
    setError("");
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i += 1
    ) {
      const result = event.results[i];

      // Ignore interim/non-final results.
      if (!result.isFinal) continue;

      const spokenText =
        result[0]?.transcript?.trim();

      if (spokenText) {
        finalTranscript += `${spokenText} `;
      }
    }

    const cleanTranscript =
      finalTranscript.trim();

    if (cleanTranscript) {
      setInput((previous) => {
        if (!previous.trim()) {
          return cleanTranscript;
        }

        return `${previous.trim()} ${cleanTranscript}`;
      });
    }
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error:", event);

    setIsRecording(false);

    if (event?.error !== "no-speech") {
      setError(t.micError);
    }
  };

  recognition.onend = () => {
    setIsRecording(false);
  };

  recognitionRef.current = recognition;

  try {
    recognition.start();
  } catch (err) {
    console.error("Could not start recognition:", err);
    setIsRecording(false);
    setError(t.micError);
  }
}
  async function analyze(event?: FormEvent) {
    event?.preventDefault();

    if (!input.trim() && !image) {
      setError(t.empty);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setReported(false);

    try {
      let response: Response;

      if (image) {
        const formData = new FormData();

        formData.append("image", image);
        formData.append("input", input.trim());
        formData.append("language", language);

        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: input.trim(),
            language,
          }),
        });
      }

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.success || !data.result) {
        throw new Error(data.error || t.serviceError);
      }

      setResult(data.result);
    } catch (err) {
      console.error("Rakshak analysis error:", err);

      setError(
        err instanceof Error
          ? err.message
          : t.serviceError
      );
    } finally {
      setLoading(false);
    }
  }

  function reportScam() {
    try {
      const reports = JSON.parse(
        localStorage.getItem("rakshak_reports") || "[]"
      );

      reports.push({
        createdAt: new Date().toISOString(),
        riskScore: result?.riskScore ?? null,
        verdict: result?.verdict ?? null,
        detectedType: result?.detectedType ?? null,
        input: input.trim(),
        imageName: image?.name ?? null,
      });

      localStorage.setItem(
        "rakshak_reports",
        JSON.stringify(reports.slice(-50))
      );

      setReported(true);
    } catch {
      setError("The report could not be saved. Please try again.");
    }
  }

  function scoreColor(score: number) {
    if (score >= 71) {
      return darkMode ? "text-red-400" : "text-red-600";
    }

    if (score >= 41) {
      return darkMode
        ? "text-yellow-400"
        : "text-yellow-600";
    }

    return darkMode
      ? "text-emerald-400"
      : "text-emerald-600";
  }

  function scoreBar(score: number) {
    if (score >= 71) return "bg-red-500";
    if (score >= 41) return "bg-yellow-400";
    return "bg-emerald-400";
  }

  function verdictLabel(verdict: string) {
    if (verdict === "High Risk Scam") return t.highRisk;
    if (verdict === "Suspicious") return t.suspicious;
    return t.lowRisk;
  }

  const cardClass = darkMode
    ? "border-slate-700 bg-[#0c2446]"
    : "border-slate-200 bg-white";

  const innerClass = darkMode
    ? "border-slate-700 bg-[#071630]"
    : "border-slate-200 bg-slate-50";

  const mutedClass = darkMode
    ? "text-slate-400"
    : "text-slate-600";

  const smallMutedClass = darkMode
    ? "text-slate-500"
    : "text-slate-500";

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#071630] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">

        {/* HEADER */}
        <header className="mb-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF9933] text-[#071630]">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight">
                Rakshak AI
              </div>

              <div
                className={`text-[11px] font-medium ${smallMutedClass}`}
              >
                Investor Protection Layer
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* LANGUAGE */}
            <button
              type="button"
              onClick={() =>
                setLanguage((previous) =>
                  previous === "en" ? "hi" : "en"
                )
              }
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:border-[#FF9933] ${
                darkMode
                  ? "border-slate-700 bg-[#10284d] text-slate-200"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <Languages className="h-4 w-4" />
              {language === "en" ? "हिन्दी" : "English"}
            </button>

            {/* LITE MODE */}
            <button
              type="button"
              onClick={() => setLiteMode((previous) => !previous)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                liteMode
                  ? "border-[#FF9933] bg-[#FF9933] text-[#071630]"
                  : darkMode
                  ? "border-slate-700 bg-[#10284d] text-slate-200 hover:border-[#FF9933]"
                  : "border-slate-300 bg-white text-slate-700 hover:border-[#FF9933]"
              }`}
            >
              ⚡ {t.lite}
            </button>

            {/* THEME */}
            <button
              type="button"
              onClick={() => setDarkMode((previous) => !previous)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:border-[#FF9933] ${
                darkMode
                  ? "border-slate-700 bg-[#10284d] text-slate-200"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4 text-[#FF9933]" />
                  {t.light}
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  {t.dark}
                </>
              )}
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="mb-10 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF9933]/30 bg-[#FF9933]/10 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-[#FF9933]">
              <span className="h-2 w-2 rounded-full bg-[#FF9933]" />
              {t.badge}
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
              {t.title}
            </h1>

            <p
              className={`mt-5 max-w-2xl text-base leading-7 md:text-lg ${mutedClass}`}
            >
              {t.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                "📷 Screenshot analysis",
                "🎙 Voice input",
                "0–100 transparent risk",
              ].map((item) => (
                <div
                  key={item}
                  className={`rounded-full border px-4 py-2 text-xs font-bold ${
                    darkMode
                      ? "border-slate-700 bg-[#10284d] text-slate-300"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {!liteMode && (
            <div className="hidden justify-end lg:flex">
              <div className="relative flex h-72 w-72 items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border ${
                    darkMode
                      ? "border-[#FF9933]/20"
                      : "border-[#FF9933]/30"
                  }`}
                />
                <div
                  className={`absolute inset-7 rounded-full border ${
                    darkMode
                      ? "border-[#FF9933]/20"
                      : "border-[#FF9933]/25"
                  }`}
                />
                <div
                  className={`absolute inset-14 rounded-full border ${
                    darkMode
                      ? "border-[#FF9933]/20"
                      : "border-[#FF9933]/20"
                  }`}
                />

                <div
                  className={`z-10 flex h-36 w-36 items-center justify-center rounded-[2rem] border shadow-2xl ${
                    darkMode
                      ? "border-[#FF9933]/50 bg-[#10284d] shadow-[#FF9933]/10"
                      : "border-orange-200 bg-white shadow-orange-100"
                  }`}
                >
                  <Shield className="h-20 w-20 text-[#FF9933]" />
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-7 lg:grid-cols-[1.35fr_.65fr]">

          {/* INPUT */}
          <section
            className={`rounded-3xl border p-5 shadow-2xl transition-colors duration-300 md:p-7 ${cardClass}`}
          >
            <div className="mb-6">
              <div className="text-xl font-extrabold">
                {t.inputTitle}
              </div>

              <div className={`mt-1 text-sm ${mutedClass}`}>
                {t.inputSubtitle}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* IMAGE UPLOAD */}
            {!preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={`group mb-5 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-9 text-center transition hover:border-[#FF9933] ${
                  darkMode
                    ? "border-slate-600 bg-[#0a1f44] hover:bg-[#0e2a54]"
                    : "border-slate-300 bg-slate-50 hover:bg-orange-50"
                }`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF9933]/10 text-[#FF9933]">
                  <Upload className="h-6 w-6" />
                </div>

                <div className="text-base font-bold">
                  {t.uploadTitle}
                </div>

                <div className={`mt-2 text-sm ${mutedClass}`}>
                  {t.uploadHint}
                </div>

                <div className={`my-3 text-xs ${smallMutedClass}`}>
                  or
                </div>

                <div className="rounded-xl bg-[#FF9933] px-4 py-2 text-sm font-extrabold text-[#071630]">
                  {t.browse}
                </div>

                <div className={`mt-3 text-[11px] ${smallMutedClass}`}>
                  {t.supported}
                </div>
              </button>
            ) : (
              <div
                className={`mb-5 overflow-hidden rounded-2xl border ${
                  darkMode
                    ? "border-slate-700 bg-[#071630]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b px-4 py-3 ${
                    darkMode
                      ? "border-slate-700"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileImage className="h-4 w-4 shrink-0 text-[#FF9933]" />
                    <span className="truncate text-sm font-semibold">
                      {image?.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className={`ml-3 flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                      darkMode
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.remove}
                  </button>
                </div>

                <div
                  className={`flex justify-center p-4 ${
                    darkMode ? "bg-black/20" : "bg-white"
                  }`}
                >
                  <img
                    src={preview}
                    alt="Uploaded screenshot preview"
                    className="max-h-80 max-w-full rounded-xl object-contain"
                  />
                </div>
              </div>
            )}

            {/* TEXT */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t.placeholder}
                rows={6}
                className={`w-full resize-none rounded-2xl border px-4 py-4 pr-16 text-sm leading-6 outline-none transition placeholder:text-slate-500 focus:border-[#FF9933] ${
                  darkMode
                    ? "border-slate-700 bg-[#071630] text-white"
                    : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />

              <button
                type="button"
                onClick={startVoice}
                className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  isRecording
                    ? "bg-red-500 text-white"
                    : darkMode
                    ? "bg-[#10284d] text-slate-300 hover:bg-[#173762]"
                    : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                }`}
                title={isRecording ? t.stopVoice : t.voice}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
                {error}
              </div>
            )}

            {/* ANALYZE */}
            <button
              type="button"
              disabled={loading}
              onClick={() => analyze()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF9933] px-5 py-4 text-sm font-black text-[#071630] transition hover:bg-[#ffac55] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  {image ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                  {t.analyze}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div
              className={`mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] ${smallMutedClass}`}
            >
              <span>{t.secureNote}</span>
              <span>{t.safeNote}</span>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="space-y-5">

            {result ? (
              <section
                className={`rounded-3xl border p-6 shadow-2xl transition-colors duration-300 ${cardClass}`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF9933]">
                      {t.resultTitle}
                    </div>

                    <div className="mt-2 text-lg font-black">
                      {result.detectedType}
                    </div>
                  </div>

                  {result.riskScore >= 71 ? (
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  ) : result.riskScore >= 41 ? (
                    <AlertTriangle className="h-7 w-7 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  )}
                </div>

                {/* SCORE */}
                <div
                  className={`rounded-2xl border p-5 ${innerClass}`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-[0.12em] ${smallMutedClass}`}
                      >
                        {t.score}
                      </div>

                      <div
                        className={`mt-1 text-5xl font-black ${scoreColor(
                          result.riskScore
                        )}`}
                      >
                        {Math.round(result.riskScore)}
                      </div>
                    </div>

                    <div
                      className={`text-sm font-black ${scoreColor(
                        result.riskScore
                      )}`}
                    >
                      {verdictLabel(result.verdict)}
                    </div>
                  </div>

                  <div
                    className={`mt-5 h-3 overflow-hidden rounded-full ${
                      darkMode ? "bg-slate-800" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${scoreBar(
                        result.riskScore
                      )}`}
                      style={{
                        width: `${Math.min(
                          Math.max(result.riskScore, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="mt-5">
                  <div className="mb-2 text-sm font-extrabold">
                    {t.detected}
                  </div>

                  <p
                    className={`text-sm leading-6 ${mutedClass}`}
                  >
                    {result.summary}
                  </p>
                </div>

                {/* FLAGS */}
                {result.redFlags.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 text-sm font-extrabold">
                      {t.redFlags}
                    </div>

                    <div className="space-y-2">
                      {result.redFlags.map((flag, index) => (
                        <div
                          key={`${flag}-${index}`}
                          className={`flex gap-2 rounded-xl border p-3 text-xs leading-5 ${
                            darkMode
                              ? "border-red-500/20 bg-red-500/5 text-slate-300"
                              : "border-red-200 bg-red-50 text-slate-700"
                          }`}
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADVICE */}
                {result.advice.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 text-sm font-extrabold">
                      {t.whatNow}
                    </div>

                    <div className="space-y-2">
                      {result.advice.slice(0, 4).map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className={`flex gap-2 rounded-xl border p-3 text-xs leading-5 ${
                            darkMode
                              ? "border-emerald-500/20 bg-emerald-500/5 text-slate-300"
                              : "border-emerald-200 bg-emerald-50 text-slate-700"
                          }`}
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EMERGENCY / REPORT */}
                <div
                  className={`mt-6 rounded-2xl border p-4 ${
                    result.riskScore >= 41
                      ? darkMode
                        ? "border-[#FF9933]/40 bg-[#FF9933]/10"
                        : "border-orange-200 bg-orange-50"
                      : darkMode
                      ? "border-slate-700 bg-[#071630]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF9933] text-[#071630]">
                      <PhoneCall className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-black">
                        {t.report}
                      </div>

                      <div
                        className={`mt-1 text-xs leading-5 ${mutedClass}`}
                      >
                        If you have already transferred money or shared
                        sensitive information, contact the cyber-fraud
                        helpline immediately and file an official report.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {/* CALL 1930 */}
                    <a
                      href="tel:1930"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#FF9933] px-4 py-3 text-xs font-black text-[#071630] transition hover:bg-[#ffac55]"
                    >
                      <PhoneCall className="h-4 w-4" />
                      {t.helpline}
                    </a>

                    {/* OFFICIAL PORTAL */}
                    <a
                      href="https://cybercrime.gov.in/"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black transition ${
                        darkMode
                          ? "border-slate-600 bg-[#10284d] text-white hover:border-[#FF9933]"
                          : "border-slate-300 bg-white text-slate-800 hover:border-[#FF9933]"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t.portal}
                    </a>
                  </div>

                  {/* LOCAL REPORT */}
                  <button
                    type="button"
                    onClick={reportScam}
                    disabled={reported}
                    className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black transition ${
                      reported
                        ? darkMode
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : darkMode
                        ? "border-slate-600 bg-transparent text-slate-200 hover:border-[#FF9933]"
                        : "border-slate-300 bg-white text-slate-700 hover:border-[#FF9933]"
                    }`}
                  >
                    {reported ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Scam report saved
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Save this scan as a report
                      </>
                    )}
                  </button>

                  <div
                    className={`mt-3 text-center text-[10px] ${smallMutedClass}`}
                  >
                    Official reporting: cybercrime.gov.in • Helpline: 1930
                  </div>
                </div>
              </section>
            ) : (
              <>
                {/* HOW IT WORKS */}
                <section
                  className={`rounded-3xl border p-6 transition-colors duration-300 ${cardClass}`}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                      darkMode
                        ? "bg-[#FF9933]/10"
                        : "bg-orange-50"
                    }`}
                  >
                    <Shield className="h-6 w-6 text-[#FF9933]" />
                  </div>

                  <h2 className="text-lg font-black">
                    {t.howWorks}
                  </h2>

                  <div className="mt-5 space-y-4">
                    {[
                      [
                        "01",
                        "Extract",
                        "AI identifies suspicious signals.",
                      ],
                      [
                        "02",
                        "Score",
                        "Deterministic rules produce the 0–100 score.",
                      ],
                      [
                        "03",
                        "Explain",
                        "Reasons and uncertainty remain visible.",
                      ],
                      [
                        "04",
                        "Escalate",
                        "Users can reach official reporting channels.",
                      ],
                    ].map(([number, title, description]) => (
                      <div key={number} className="flex gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            darkMode
                              ? "bg-[#10284d] text-[#FF9933]"
                              : "bg-orange-50 text-[#FF9933]"
                          }`}
                        >
                          {number}
                        </div>

                        <div>
                          <div className="text-sm font-extrabold">
                            {title}
                          </div>

                          <div
                            className={`mt-1 text-xs leading-5 ${smallMutedClass}`}
                          >
                            {description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* BHARAT */}
                <section
                  className={`rounded-3xl border p-6 transition-colors duration-300 ${cardClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇮🇳</span>

                    <div>
                      <div className="text-sm font-black">
                        {t.builtFor}
                      </div>

                      <div
                        className={`mt-1 text-xs ${smallMutedClass}`}
                      >
                        Hindi + English • Voice • Lite Mode
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </aside>
        </div>

        {/* FOOTER */}
        <footer
          className={`mt-12 border-t pt-5 ${
            darkMode
              ? "border-slate-800"
              : "border-slate-200"
          }`}
        >
          <div
            className={`flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between ${smallMutedClass}`}
          >
            <div>
              Rakshak AI • Team CodeByte | Abhas
            </div>

            <div>
              Guarding Bharat&apos;s Retail Investors in Real Time
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

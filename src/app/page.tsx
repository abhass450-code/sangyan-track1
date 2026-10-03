"use client";

import { FormEvent, useMemo, useState } from "react";
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
  Moon,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  X,
} from "lucide-react";

type Verdict = "Safe" | "Suspicious" | "High Risk Scam";

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
  result: AnalysisResult;
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

const EXAMPLE_MESSAGE =
  "URGENT: Guaranteed 30% return in 7 days! Invest ₹5,000 today through this exclusive link. Limited slots available. Send payment through UPI immediately. https://example-investment.com";

function getScoreColor(score: number, darkMode: boolean) {
  if (score > 70) return darkMode ? "text-red-400" : "text-red-600";
  if (score > 40) return darkMode ? "text-amber-400" : "text-amber-600";
  return darkMode ? "text-emerald-400" : "text-emerald-600";
}

function getVerdictStyles(
  verdict: Verdict,
  darkMode: boolean
): string {
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

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] =
    useState<AnalysisResult>(INITIAL_RESULT);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const hasResult = result.summary.length > 0;

  const scoreRing = useMemo(() => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    return {
      circumference,
      offset:
        circumference -
        (result.riskScore / 100) * circumference,
    };
  }, [result.riskScore]);

  async function analyzeContent(event?: FormEvent) {
    event?.preventDefault();

    const cleaned = input.trim();

    if (!cleaned) {
      setError(
        "Please paste a WhatsApp message, Telegram tip, URL, or investment claim."
      );
      return;
    }

    if (cleaned.length < 8) {
      setError("Please provide a little more content to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setReported(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: cleaned,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || "Invalid analysis response");
      }

      setResult(data.result);
    } catch {
      /*
       * Development fallback.
       *
       * In production, /api/analyze should always be connected
       * to Gemini + the deterministic server-side rule engine.
       */
      setError(
        "Rakshak AI could not reach the analysis service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function useExample() {
    setInput(EXAMPLE_MESSAGE);
    setResult(INITIAL_RESULT);
    setError("");
    setReported(false);
  }

  function clearInput() {
    setInput("");
    setResult(INITIAL_RESULT);
    setError("");
    setReported(false);
  }

  async function reportScam() {
    if (!hasResult || result.riskScore <= 40) return;

    setReporting(true);

    try {
      /*
       * Local fraud registry simulation.
       *
       * This intentionally does not claim to submit a real
       * government complaint. Replace this with your backend
       * registry endpoint when implementing the real system.
       */

      const report = {
        reportId: `RAK-${Date.now()}`,
        createdAt: new Date().toISOString(),
        riskScore: result.riskScore,
        verdict: result.verdict,
        detectedType: result.detectedType,
        content: input.slice(0, 1000),
      };

      const existing = JSON.parse(
        localStorage.getItem("rakshak-fraud-registry") || "[]"
      );

      existing.push(report);

      localStorage.setItem(
        "rakshak-fraud-registry",
        JSON.stringify(existing)
      );

      await new Promise((resolve) => setTimeout(resolve, 700));

      setReported(true);
    } catch {
      setError(
        "The local report could not be saved. Please try again."
      );
    } finally {
      setReporting(false);
    }
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1
                className={`text-[17px] font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-slate-950"
                }`}
              >
                Rakshak AI
              </h1>

              <p
                className={`hidden text-[11px] font-medium sm:block ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Financial Scam Safety Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:flex ${
                darkMode
                  ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Safety first
            </div>

            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                darkMode
                  ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
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
            Check before you invest
          </div>

          <h2
            className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${
              darkMode ? "text-white" : "text-slate-950"
            }`}
          >
            Not sure if that investment message is real?
          </h2>

          <p
            className={`mx-auto mt-4 max-w-2xl text-sm leading-6 sm:text-base ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Paste a forwarded WhatsApp message, Telegram tip,
            financial link, or investment claim. Rakshak AI checks
            for scam signals and explains what you should do next.
          </p>
        </div>

        {/* INPUT */}
        <div className="mx-auto mt-8 max-w-4xl">
          <div
            className={`overflow-hidden rounded-2xl border shadow-sm transition ${
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
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />

                <h3
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Paste suspicious content
                </h3>
              </div>

              <p
                className={`mt-1 text-xs ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                WhatsApp • Telegram • SMS • URL • investment claim
              </p>
            </div>

            <form onSubmit={analyzeContent} className="p-5 sm:p-6">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setError("");
                  }}
                  maxLength={5000}
                  placeholder="Example: “Guaranteed 30% return in 7 days. Invest now…”"
                  className={`min-h-[180px] w-full resize-y rounded-xl border px-4 py-4 pr-12 text-sm leading-6 outline-none transition focus:ring-4 ${
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-950/50"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-50"
                  }`}
                  aria-label="Suspicious message or financial claim"
                />

                {input && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className={`absolute right-3 top-3 rounded-lg p-1.5 ${
                      darkMode
                        ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                        : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    }`}
                    aria-label="Clear input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div
                className={`mt-2 flex items-center justify-between text-[11px] ${
                  darkMode ? "text-slate-600" : "text-slate-400"
                }`}
              >
                <span>{input.length}/5000</span>

                <button
                  type="button"
                  onClick={useExample}
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-500 hover:text-blue-400"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Try an example
                </button>
              </div>

              {error && (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                    darkMode
                      ? "border-red-900 bg-red-950/40 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gemini is checking the message…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Check with Rakshak AI
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div
                className={`mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Never share OTPs or passwords
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Verify before investing
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
            className={`rounded-2xl border p-6 ${
              darkMode
                ? "border-slate-700 bg-[#111827]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  darkMode ? "bg-blue-950/60" : "bg-blue-50"
                }`}
              >
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>

              <div>
                <p
                  className={`text-sm font-semibold ${
                    darkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Analyzing suspicious signals…
                </p>

                <p
                  className={`mt-1 text-xs ${
                    darkMode ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Gemini is extracting signals before Rakshak calculates
                  the final risk score.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {hasResult && !loading && (
        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* RESULT HEADER */}
          <div
            className={`overflow-hidden rounded-2xl border shadow-sm ${
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
                      darkMode ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    Analysis result
                  </p>

                  <h3
                    className={`mt-1 text-lg font-bold ${
                      darkMode ? "text-white" : "text-slate-950"
                    }`}
                  >
                    Here&apos;s what Rakshak found
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => analyzeContent()}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    darkMode
                      ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-check
                </button>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr]">
              {/* RISK SCORE */}
              <div
                className={`flex flex-col items-center justify-center rounded-2xl p-5 ${
                  darkMode ? "bg-slate-900" : "bg-slate-50"
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
                      strokeDasharray={scoreRing.circumference}
                      strokeDashoffset={scoreRing.offset}
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
                      {result.riskScore}
                    </span>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        darkMode
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      risk / 100
                    </span>
                  </div>
                </div>

                <div
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${getVerdictStyles(
                    result.verdict,
                    darkMode
                  )}`}
                >
                  {result.verdict === "Safe" && (
                    <ShieldCheck className="h-4 w-4" />
                  )}

                  {result.verdict === "Suspicious" && (
                    <TriangleAlert className="h-4 w-4" />
                  )}

                  {result.verdict === "High Risk Scam" && (
                    <ShieldAlert className="h-4 w-4" />
                  )}

                  {result.verdict}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="flex flex-col justify-center">
                <div
                  className={`flex items-center gap-2 text-xs font-semibold ${
                    darkMode ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  <FileWarning className="h-4 w-4" />
                  Detected content
                </div>

                <p
                  className={`mt-1 font-semibold ${
                    darkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {result.detectedType}
                </p>

                <p
                  className={`mt-5 text-sm leading-6 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {result.summary}
                </p>
              </div>
            </div>
          </div>

          {/* RED FLAGS + ADVICE */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div
              className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
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
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Key red flags
                  </h3>

                  <p
                    className={`text-[11px] ${
                      darkMode ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    Signals detected in the content
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {result.redFlags.map((flag, index) => (
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
                      {index + 1}
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
                ))}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
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
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    What you should do
                  </h3>

                  <p
                    className={`text-[11px] ${
                      darkMode ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    Simple next steps
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {result.advice.map((advice, index) => (
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
                ))}
              </div>
            </div>
          </div>

          {/* EMERGENCY ACTION */}
          {result.riskScore > 40 && (
            <div
              className={`mt-5 overflow-hidden rounded-2xl border-2 shadow-sm ${
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
                        darkMode ? "text-red-300" : "text-red-800"
                      }`}
                    >
                      Emergency Action
                    </h3>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        darkMode
                          ? "text-red-300/70"
                          : "text-red-700"
                      }`}
                    >
                      This content has crossed Rakshak&apos;s
                      intervention threshold. If you have already
                      transferred money or shared sensitive information,
                      act immediately.
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
                        Cyber fraud helpline
                      </p>

                      <a
                        href="tel:1930"
                        className="text-2xl font-extrabold text-red-600 hover:text-red-700"
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
                    If money has already been lost, report the financial
                    cyber fraud as quickly as possible.
                  </p>

                  <a
                    href="tel:1930"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-red-700"
                  >
                    <Phone className="h-4 w-4" />
                    Call 1930
                  </a>
                </div>

                {/* CYBERCRIME */}
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
                        Official reporting portal
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
                    Use the official National Cyber Crime Reporting
                    Portal for online cybercrime reporting.
                  </p>

                  <a
                    href="https://cybercrime.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-3 text-xs font-bold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    Open Cyber Crime Portal
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* LOCAL REGISTRY */}
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                {!reported ? (
                  <button
                    type="button"
                    onClick={reportScam}
                    disabled={reporting}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      darkMode
                        ? "border-red-800 text-red-300 hover:bg-red-950/40"
                        : "border-red-200 text-red-700 hover:bg-red-50"
                    }`}
                  >
                    {reporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Logging report…
                      </>
                    ) : (
                      <>
                        <FileWarning className="h-4 w-4" />
                        Report Scam Link
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
                        Scam report logged
                      </p>

                      <p
                        className={`mt-0.5 text-xs ${
                          darkMode
                            ? "text-emerald-300/70"
                            : "text-emerald-700"
                        }`}
                      >
                        This demo report has been added to Rakshak&apos;s
                        local fraud registry.
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
                    darkMode ? "text-blue-300" : "text-blue-900"
                  }`}
                >
                  Rakshak AI is a safety assistant
                </p>

                <p
                  className={`mt-1 text-xs leading-5 ${
                    darkMode
                      ? "text-blue-300/70"
                      : "text-blue-800/80"
                  }`}
                >
                  A risk score is an automated warning signal, not proof
                  that a person or organisation is fraudulent. Always
                  verify financial claims through trusted official sources.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EMPTY FEATURE CARDS */}
      {!hasResult && !loading && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              darkMode={darkMode}
              icon={<MessageCircle className="h-5 w-5" />}
              title="Forwarded messages"
              description="Check suspicious WhatsApp, Telegram, SMS, and social media claims."
            />

            <FeatureCard
              darkMode={darkMode}
              icon={<Link2 className="h-5 w-5" />}
              title="Financial links"
              description="Identify warning signs before trusting an investment link."
            />

            <FeatureCard
              darkMode={darkMode}
              icon={<IndianRupee className="h-5 w-5" />}
              title="Investment claims"
              description="Understand red flags like guaranteed returns and pressure tactics."
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
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Abhas
            </span>
          </p>

          <div className="flex items-center justify-center gap-4 text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5" />
              Safety focused
            </span>

            <span className="inline-flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Verify independently
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  darkMode,
  icon,
  title,
  description,
}: {
  darkMode: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        darkMode
          ? "border-slate-700 bg-[#111827] hover:border-slate-600"
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
          darkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1.5 text-xs leading-5 ${
          darkMode ? "text-slate-500" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
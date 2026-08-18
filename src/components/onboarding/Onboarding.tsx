import { useState, useCallback } from "react";
import { Key, Cpu, Check, Loader2 } from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";
import { testConnection } from "../../services/openrouter";

const MODELS = [
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (Free)" },
  { id: "openrouter/free", label: "Auto (Free)" },
];

export default function Onboarding() {
  const { updateApiConfig, updateSettings } = useSettingsStore();
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleTestKey = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection({ apiKey: apiKey.trim(), model: selectedModel });
    setTestResult({ ok: result.success, msg: result.message });
    setTesting(false);
  }, [apiKey, selectedModel]);

  const handleFinish = useCallback(() => {
    updateApiConfig({ apiKey: apiKey.trim(), model: selectedModel });
    updateSettings({ hasCompletedOnboarding: true });
  }, [apiKey, selectedModel, updateApiConfig, updateSettings]);

  const handleSkip = useCallback(() => {
    updateSettings({ hasCompletedOnboarding: true });
  }, [updateSettings]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0B10] p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-indigo-500" : i < step ? "w-1.5 bg-indigo-500/50" : "w-1.5 bg-white/[0.08]"}`} />
          ))}
        </div>

        <div className="bg-[#14151C] rounded-2xl border border-white/[0.06] shadow-2xl p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#F5F7FA] mb-3">Welcome to DEVChat</h1>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
                An AI-powered coding assistant. Connect your OpenRouter account to start chatting with leading language models.
              </p>
              <button onClick={() => setStep(1)} className="w-full h-11 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                Get Started
              </button>
              <button onClick={handleSkip} className="mt-3 w-full h-11 rounded-xl text-sm text-[#4B5563] hover:text-[#6B7280] transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {/* Step 1: API Key */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#F5F7FA]">API Key</h2>
                  <p className="text-xs text-[#4B5563]">Required to chat with AI models</p>
                </div>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
                placeholder="sk-or-..."
                className="w-full h-11 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#F5F7FA] text-sm placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono mb-3"
              />
              {testResult && (
                <p className={`text-xs mb-3 ${testResult.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {testResult.msg}
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={handleTestKey} disabled={!apiKey.trim() || testing} className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#D1D5DB] hover:bg-white/[0.06] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center gap-2">
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Test
                </button>
                <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  Continue
                </button>
              </div>
              <button onClick={handleSkip} className="mt-3 w-full h-11 rounded-xl text-sm text-[#4B5563] hover:text-[#6B7280] transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {/* Step 2: Model + Done */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#F5F7FA]">Choose Model</h2>
                  <p className="text-xs text-[#4B5563]">Select your default AI model</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-6">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      selectedModel === m.id
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                        : "text-[#D1D5DB] hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span className="flex-1 text-left">{m.label}</span>
                    {selectedModel === m.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
              <button onClick={handleFinish} className="w-full h-11 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

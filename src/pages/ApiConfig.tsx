import { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
  Key,
  Settings2,
  ArrowLeft,
  Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../store/settingsStore";
import Button from "../components/ui/Button";
import { testConnection } from "../services/openrouter";
import { validateApiKey, validateModel } from "../lib/validation";
import { copyToClipboard } from "../lib/utils";

export default function ApiConfig() {
  const navigate = useNavigate();
  const { apiConfig, updateApiConfig } = useSettingsStore();
  const [key, setKey] = useState(apiConfig.apiKey);
  const [model, setModel] = useState(apiConfig.model);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  const keyError = validateApiKey(key);
  const modelError = validateModel(model);
  const canSave = !keyError && !modelError;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    updateApiConfig({ apiKey: key.trim(), model: model.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [canSave, key, model, updateApiConfig]);

  const handleTest = useCallback(async () => {
    if (!canSave) return;
    setTesting(true);
    setTestResult(null);
    const result = await testConnection({ apiKey: key.trim(), model: model.trim() });
    setTestResult(result);
    setTesting(false);
  }, [canSave, key, model]);

  const handleCopyKey = useCallback(async () => {
    const ok = await copyToClipboard(key);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [key]);

  const handleClear = useCallback(() => {
    setKey("");
    setModel("openrouter/free");
    updateApiConfig({ apiKey: "", model: "openrouter/free" });
    setTestResult(null);
  }, [updateApiConfig]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/[0.04] text-[#6B7280] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">Configuration</h1>
            <p className="text-sm text-[#4B5563]">Set up your API key and model to start chatting.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Provider */}
          <section className="rounded-2xl bg-[#14151C]/60 border border-white/[0.04] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center"><Settings2 className="w-4 h-4 text-[#6B7280]" /></div>
              <div>
                <h2 className="text-sm font-semibold text-[#F5F7FA]">Provider</h2>
                <p className="text-[11px] text-[#4B5563]">API gateway service</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="h-11 px-3 rounded-xl bg-[#1A1B26] border border-white/[0.06] flex items-center text-sm text-[#D1D5DB]">OpenRouter</div>
            </div>
          </section>

          {/* API Key */}
          <section className="rounded-2xl bg-[#14151C]/60 border border-white/[0.04] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center"><Key className="w-4 h-4 text-[#6B7280]" /></div>
              <div>
                <h2 className="text-sm font-semibold text-[#F5F7FA]">API Key</h2>
                <p className="text-[11px] text-[#4B5563]">Your OpenRouter API key</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="relative flex-1 min-w-0">
                <input type={showKey ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-or-..."
                  className="w-full h-11 px-3 pr-[120px] rounded-xl bg-[#1A1B26] border border-white/[0.08] text-[#F5F7FA] text-sm placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors font-mono" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button onClick={() => setShowKey(!showKey)} className="p-2 rounded-lg hover:bg-white/[0.06] text-[#4B5563] hover:text-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label={showKey ? "Hide key" : "Show key"}>
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={handleCopyKey} className="p-2 rounded-lg hover:bg-white/[0.06] text-[#4B5563] hover:text-[#F5F7FA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Copy key">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setKey(""); setTestResult(null); }} className="p-2 rounded-lg hover:bg-white/[0.06] text-[#4B5563] hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Clear key">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {keyError && key.length > 0 && <p className="mt-1.5 text-xs text-red-400">{keyError}</p>}
            </div>
          </section>

          {/* Model */}
          <section className="rounded-2xl bg-[#14151C]/60 border border-white/[0.04] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center"><Cpu className="w-4 h-4 text-[#6B7280]" /></div>
              <div>
                <h2 className="text-sm font-semibold text-[#F5F7FA]">Model</h2>
                <p className="text-[11px] text-[#4B5563]">Choose which AI model to use</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="openrouter/free"
                className="w-full h-11 px-3 rounded-xl bg-[#1A1B26] border border-white/[0.08] text-[#F5F7FA] text-sm placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors font-mono" />
              {modelError && model.length > 0 && <p className="mt-1.5 text-xs text-red-400">{modelError}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["openrouter/free", "openai/gpt-4o", "anthropic/claude-sonnet-4", "google/gemini-2.0-flash-001", "meta-llama/llama-4-maverick"].map((m) => (
                  <button key={m} onClick={() => setModel(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${model === m ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/[0.03] text-[#4B5563] hover:text-[#6B7280] hover:bg-white/[0.05] border border-transparent"}`}>
                    {m.split("/").pop()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            <Button onClick={handleSave} disabled={!canSave}>
              {saved ? <><Check className="w-4 h-4" />Saved</> : "Save Configuration"}
            </Button>
            <Button variant="secondary" onClick={handleTest} disabled={!canSave || testing}>
              {testing ? <><Loader2 className="w-4 h-4 animate-spin" />Testing...</> : "Test Connection"}
            </Button>
            <Button variant="ghost" onClick={handleClear}>Reset</Button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl border ${testResult.success ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}>
              <p className="text-sm leading-relaxed">{testResult.message}</p>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#14151C]/40 border border-white/[0.04]">
            <AlertTriangle className="w-4 h-4 text-[#4B5563] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Your API key is stored locally in this browser. DEVChat does not send your key to any DEVChat server. Do not use browser-stored API keys for public production deployments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ApiKeyStatus, ApiKeySwapResult } from '../types';
import {
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const FloatingApiHUD: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

  // Form input state
  const [newKey, setNewKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ApiKeySwapResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.getApiKeyStatus();
      setStatus(res);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTestResult(null);
    setErrorMessage(null);
    fetchStatus();
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      setErrorMessage('Please enter an API key to test.');
      return;
    }

    setTesting(true);
    setErrorMessage(null);
    setTestResult(null);

    try {
      const result: ApiKeySwapResult = await api.testAndSaveApiKey(newKey.trim());
      setTestResult(result);
      // Refresh status to reflect the new masked key
      await fetchStatus();
      setNewKey('');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to verify API key with Google Gemini. Check your key and try again.'
      );
    } finally {
      setTesting(false);
    }
  };

  const isConnected = Boolean(status?.configured && status?.connected);

  return (
    <>
      {/* ── FLOATING HUD PILL (Bottom-Left) ── */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={handleOpen}
          className="group flex items-center gap-2.5 rounded-full border border-black/10 bg-white/95 px-4 py-2 text-xs font-semibold text-gray-800 shadow-[0_8px_25px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all hover:scale-[1.03] hover:border-black/20 hover:bg-white hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.25)] cursor-pointer select-none"
          title="Click to view status or swap Gemini API key"
        >
          {/* Status Indicator Dot */}
          <span className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>

          <span className="flex items-center gap-1.5 font-medium text-gray-900">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 group-hover:rotate-12 transition-transform" />
            <span>Gemini AI</span>
          </span>

          <span className="text-[11px] text-gray-400">|</span>

          <span className="text-[11px] font-mono text-gray-500">
            {status?.masked_key ? status.masked_key : isConnected ? 'Active' : 'Configure Key'}
          </span>
        </button>
      </div>

      {/* ── SWAP API KEY DIALOG MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-black/10 overflow-hidden">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dialog Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-xs">
                <KeyRound className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  Gemini API Connection
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Hot-swap your Google Gemini API key for instant CV parsing
                </p>
              </div>
            </div>

            {/* Current Active Key Status Card */}
            <div className="mb-5 rounded-2xl border border-black/[0.08] bg-[#f9fafb] p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Connection Status</span>
                {loadingStatus ? (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : isConnected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Live & Connected
                  </span>
                ) : status?.configured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3 h-3" /> Key Configured (Check Quota)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                    Not Configured
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Active Model</span>
                <span className="font-semibold text-gray-900 font-mono text-[11px]">
                  {status?.model || 'gemini-2.5-flash'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Active Key (Masked)</span>
                <span className="font-mono text-[11px] font-semibold text-gray-800 bg-black/5 px-2 py-0.5 rounded">
                  {status?.masked_key || 'None configured'}
                </span>
              </div>

              <div className="pt-1 text-[11px] text-gray-500 leading-snug">
                CV documents, PDFs, and PNG/JPG images are automatically recognized and parsed using multimodal vision.
              </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Connection Verified!</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {testResult.message} Latency: <strong>{testResult.latency_ms}ms</strong>. Key safely saved and ready for CV & image parsing.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Verification Failed</span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Form to Swap API Key */}
            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Enter New API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Your key is validated immediately with a test call before updating.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-full border border-black/15 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={testing || !newKey.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition shadow-xs cursor-pointer"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Test & Connect</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Helper link to Google AI Studio */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Don't have a key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-black hover:underline"
              >
                <span>Get key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

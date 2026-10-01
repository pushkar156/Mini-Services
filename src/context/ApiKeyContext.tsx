"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ApiKeyContextType {
  geminiKey: string;
  provider: "gemini" | "ollama";
  ollamaEndpoint: string;
  ollamaModel: string;
  ollamaModels: string[];
  isConfigured: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  saveGeminiKey: (key: string) => void;
  clearGeminiKey: () => void;
  setProvider: (provider: "gemini" | "ollama") => void;
  setOllamaConfig: (endpoint: string, model: string) => void;
  validateGeminiKey: (key: string) => Promise<{ valid: boolean; error?: string }>;
  fetchOllamaModels: (endpoint?: string) => Promise<string[]>;
}

const STORAGE_KEY = "OVI_HUB_GEMINI_KEY";
const LEGACY_STORAGE_KEY = "GEMINI_API_KEY";
const PROVIDER_KEY = "OVI_HUB_PROVIDER";
const OLLAMA_ENDPOINT_KEY = "OVI_HUB_OLLAMA_ENDPOINT";
const OLLAMA_MODEL_KEY = "OVI_HUB_OLLAMA_MODEL";

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [provider, setProviderState] = useState<"gemini" | "ollama">("gemini");
  const [ollamaEndpoint, setOllamaEndpointState] = useState<string>("http://localhost:11434");
  const [ollamaModel, setOllamaModelState] = useState<string>("llama3:latest");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "";
      const storedProvider = (localStorage.getItem(PROVIDER_KEY) as "gemini" | "ollama") || "gemini";
      const storedEndpoint = localStorage.getItem(OLLAMA_ENDPOINT_KEY) || "http://localhost:11434";
      const storedModel = localStorage.getItem(OLLAMA_MODEL_KEY) || "llama3:latest";

      setGeminiKey(storedKey);
      setProviderState(storedProvider);
      setOllamaEndpointState(storedEndpoint);
      setOllamaModelState(storedModel);
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
  }, []);

  const saveGeminiKey = (key: string) => {
    const trimmed = key.trim();
    setGeminiKey(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      localStorage.setItem(LEGACY_STORAGE_KEY, trimmed);
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  };

  const clearGeminiKey = () => {
    setGeminiKey("");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not remove from localStorage:", e);
    }
  };

  const setProvider = (newProvider: "gemini" | "ollama") => {
    setProviderState(newProvider);
    try {
      localStorage.setItem(PROVIDER_KEY, newProvider);
    } catch (e) {
      console.warn("Could not write provider to localStorage:", e);
    }
  };

  const setOllamaConfig = (endpoint: string, model: string) => {
    const cleanEndpoint = endpoint.trim().replace(/\/$/, "");
    const cleanModel = model.trim();
    setOllamaEndpointState(cleanEndpoint);
    setOllamaModelState(cleanModel);
    try {
      localStorage.setItem(OLLAMA_ENDPOINT_KEY, cleanEndpoint);
      localStorage.setItem(OLLAMA_MODEL_KEY, cleanModel);
    } catch (e) {
      console.warn("Could not write Ollama config to localStorage:", e);
    }
  };

  const validateGeminiKey = async (key: string) => {
    if (!key || key.trim().length === 0) {
      return { valid: false, error: "Please enter a key" };
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key.trim())}`);
      if (res.ok) {
        return { valid: true };
      } else {
        const err = await res.json().catch(() => ({}));
        return { valid: false, error: err.error?.message || `HTTP ${res.status}` };
      }
    } catch (err: any) {
      return { valid: false, error: err.message || "Network error" };
    }
  };

  const fetchOllamaModels = async (endpoint?: string) => {
    const ep = (endpoint || ollamaEndpoint).trim().replace(/\/$/, "");
    try {
      const res = await fetch(`${ep}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name);
        setOllamaModels(models);
        return models;
      }
      return [];
    } catch {
      return [];
    }
  };

  const isConfigured = provider === "ollama" ? true : Boolean(geminiKey && geminiKey.length > 5);

  return (
    <ApiKeyContext.Provider
      value={{
        geminiKey,
        provider,
        ollamaEndpoint,
        ollamaModel,
        ollamaModels,
        isConfigured,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        saveGeminiKey,
        clearGeminiKey,
        setProvider,
        setOllamaConfig,
        validateGeminiKey,
        fetchOllamaModels,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
}

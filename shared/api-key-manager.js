/**
 * OVI Hub - API Key & Provider Manager
 * Shared key management across all OVI Hub microservices using localStorage.
 */

(function (global) {
  const STORAGE_KEYS = {
    GEMINI_KEY: 'OVI_HUB_GEMINI_KEY',
    LEGACY_GEMINI_KEY: 'GEMINI_API_KEY',
    ACTIVE_PROVIDER: 'OVI_HUB_ACTIVE_PROVIDER', // 'gemini' | 'ollama'
    OLLAMA_URL: 'OVI_HUB_OLLAMA_URL',
    OLLAMA_MODEL: 'OVI_HUB_OLLAMA_MODEL',
    THEME: 'OVI_HUB_THEME' // 'dark' | 'light'
  };

  const DEFAULT_CONFIG = {
    provider: 'gemini',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3:latest'
  };

  const ApiKeyManager = {
    /**
     * Get configured Gemini API key (BYOK)
     * Checks OVI_HUB_GEMINI_KEY first, then legacy fallback.
     */
    getGeminiKey() {
      try {
        const key = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || localStorage.getItem(STORAGE_KEYS.LEGACY_GEMINI_KEY) || '';
        return key.trim();
      } catch (e) {
        console.warn('[ApiKeyManager] Unable to access localStorage', e);
        return '';
      }
    },

    /**
     * Save Gemini API key
     */
    setGeminiKey(key) {
      try {
        const trimmed = (key || '').trim();
        if (trimmed) {
          localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, trimmed);
          // Sync to legacy key as well for compatibility
          localStorage.setItem(STORAGE_KEYS.LEGACY_GEMINI_KEY, trimmed);
        } else {
          localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
          localStorage.removeItem(STORAGE_KEYS.LEGACY_GEMINI_KEY);
        }
        this._dispatchChange();
        return true;
      } catch (e) {
        console.error('[ApiKeyManager] Failed to save Gemini key', e);
        return false;
      }
    },

    /**
     * Clear Gemini API key
     */
    clearGeminiKey() {
      return this.setGeminiKey('');
    },

    /**
     * Returns true if Gemini key exists
     */
    hasGeminiKey() {
      return Boolean(this.getGeminiKey());
    },

    /**
     * Get masked representation of key (e.g. AIzaSy...9k)
     */
    getMaskedGeminiKey() {
      const key = this.getGeminiKey();
      if (!key) return '';
      if (key.length <= 10) return '••••••••';
      return `${key.slice(0, 6)}...${key.slice(-4)}`;
    },

    /**
     * Active provider ('gemini' or 'ollama')
     */
    getActiveProvider() {
      try {
        return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER) || DEFAULT_CONFIG.provider;
      } catch (e) {
        return DEFAULT_CONFIG.provider;
      }
    },

    setActiveProvider(provider) {
      try {
        const valid = provider === 'ollama' ? 'ollama' : 'gemini';
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER, valid);
        this._dispatchChange();
      } catch (e) {
        console.error('[ApiKeyManager] Failed to set provider', e);
      }
    },

    /**
     * Ollama API endpoint URL
     */
    getOllamaUrl() {
      try {
        return localStorage.getItem(STORAGE_KEYS.OLLAMA_URL) || DEFAULT_CONFIG.ollamaUrl;
      } catch (e) {
        return DEFAULT_CONFIG.ollamaUrl;
      }
    },

    setOllamaUrl(url) {
      try {
        let clean = (url || '').trim();
        if (clean.endsWith('/')) clean = clean.slice(0, -1);
        localStorage.setItem(STORAGE_KEYS.OLLAMA_URL, clean || DEFAULT_CONFIG.ollamaUrl);
        this._dispatchChange();
      } catch (e) {
        console.error('[ApiKeyManager] Failed to save Ollama URL', e);
      }
    },

    /**
     * Ollama active model name
     */
    getOllamaModel() {
      try {
        return localStorage.getItem(STORAGE_KEYS.OLLAMA_MODEL) || DEFAULT_CONFIG.ollamaModel;
      } catch (e) {
        return DEFAULT_CONFIG.ollamaModel;
      }
    },

    setOllamaModel(model) {
      try {
        localStorage.setItem(STORAGE_KEYS.OLLAMA_MODEL, (model || '').trim() || DEFAULT_CONFIG.ollamaModel);
        this._dispatchChange();
      } catch (e) {
        console.error('[ApiKeyManager] Failed to save Ollama model', e);
      }
    },

    /**
     * Test Gemini API key validity by making a lightweight model call
     */
    async validateGeminiKey(candidateKey) {
      const key = candidateKey || this.getGeminiKey();
      if (!key) {
        return { valid: false, error: 'No API key provided.' };
      }

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
          return { valid: false, error: errMsg };
        }
        return { valid: true };
      } catch (err) {
        return { valid: false, error: err.message || 'Network connection failed' };
      }
    },

    /**
     * Test Ollama connection & retrieve list of available models
     */
    async testOllamaConnection(endpoint) {
      const url = endpoint || this.getOllamaUrl();
      try {
        const res = await fetch(`${url}/api/tags`, { method: 'GET' });
        if (!res.ok) {
          return { connected: false, models: [], error: `HTTP ${res.status}` };
        }
        const data = await res.json();
        const models = (data.models || []).map(m => m.name);
        return { connected: true, models };
      } catch (err) {
        return { connected: false, models: [], error: 'Could not connect to Ollama. Make sure Ollama is running and CORS is enabled if using a browser.' };
      }
    },

    /**
     * Open global settings modal if loaded
     */
    openSettings(tab) {
      if (typeof global.OviSettingsModal !== 'undefined' && global.OviSettingsModal.open) {
        global.OviSettingsModal.open(tab);
      } else {
        const evt = new CustomEvent('ovi:open-settings', { detail: { tab } });
        window.dispatchEvent(evt);
      }
    },

    /**
     * Subscribe to key and provider changes
     */
    onChange(callback) {
      window.addEventListener('ovi:config-changed', callback);
      window.addEventListener('storage', (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key)) {
          callback(e);
        }
      });
      return () => {
        window.removeEventListener('ovi:config-changed', callback);
      };
    },

    _dispatchChange() {
      const evt = new CustomEvent('ovi:config-changed', {
        detail: {
          hasGeminiKey: this.hasGeminiKey(),
          geminiKeyMasked: this.getMaskedGeminiKey(),
          provider: this.getActiveProvider(),
          ollamaUrl: this.getOllamaUrl(),
          ollamaModel: this.getOllamaModel()
        }
      });
      window.dispatchEvent(evt);
    }
  };

  // Expose to window / global scope & ES module export
  global.ApiKeyManager = ApiKeyManager;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiKeyManager;
  }
})(typeof window !== 'undefined' ? window : globalThis);

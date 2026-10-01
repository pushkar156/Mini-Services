/**
 * OVI Hub - Ollama Client
 * Direct client-side interface to local Ollama instance for text-based microservices.
 */

(function (global) {
  const OllamaClient = {
    /**
     * Generate completion text from Ollama
     */
    async generate({ prompt, system = '', model, temperature = 0.7, format = '' }) {
      const manager = global.ApiKeyManager;
      const baseUrl = manager ? manager.getOllamaUrl() : 'http://localhost:11434';
      const activeModel = model || (manager ? manager.getOllamaModel() : 'llama3:latest');

      const payload = {
        model: activeModel,
        prompt: prompt,
        system: system,
        stream: false,
        options: {
          temperature: temperature
        }
      };

      if (format === 'json') {
        payload.format = 'json';
      }

      try {
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama error (${response.status}): ${errText || response.statusText}`);
        }

        const data = await response.json();
        return {
          text: data.response || '',
          model: data.model || activeModel,
          totalDuration: data.total_duration,
          evalCount: data.eval_count
        };
      } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          throw new Error(
            `Unable to connect to Ollama at ${baseUrl}.\n` +
            `1. Make sure Ollama is running ('ollama serve').\n` +
            `2. If accessing from browser, ensure OLLAMA_ORIGINS="*" is set on Ollama to allow CORS.`
          );
        }
        throw err;
      }
    },

    /**
     * Check if Ollama is accessible
     */
    async isAvailable() {
      const manager = global.ApiKeyManager;
      const baseUrl = manager ? manager.getOllamaUrl() : 'http://localhost:11434';
      try {
        const res = await fetch(`${baseUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
        return res.ok;
      } catch {
        return false;
      }
    }
  };

  global.OllamaClient = OllamaClient;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaClient;
  }
})(typeof window !== 'undefined' ? window : globalThis);

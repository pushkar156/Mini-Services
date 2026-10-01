/**
 * OVI Hub - Root Homepage Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const geminiDot = document.getElementById('geminiDot');
  const geminiStatusText = document.getElementById('geminiStatusText');
  const ollamaDot = document.getElementById('ollamaDot');
  const ollamaStatusText = document.getElementById('ollamaStatusText');
  const btnConfigureAi = document.getElementById('btnConfigureAi');

  function updateGeminiStatus() {
    const hasKey = window.ApiKeyManager ? window.ApiKeyManager.hasGeminiKey() : false;
    if (geminiDot && geminiStatusText) {
      if (hasKey) {
        geminiDot.className = 'status-dot-sm dot-green';
        geminiStatusText.textContent = `Gemini Key: Active (${window.ApiKeyManager.getMaskedGeminiKey()})`;
      } else {
        geminiDot.className = 'status-dot-sm dot-amber';
        geminiStatusText.textContent = 'Gemini Key: Not Configured (Click to set)';
      }
    }
  }

  async function checkOllamaStatus() {
    if (!window.OllamaClient) return;
    if (ollamaDot && ollamaStatusText) {
      ollamaStatusText.textContent = 'Ollama: Checking...';
      const available = await window.OllamaClient.isAvailable();
      if (available) {
        const model = window.ApiKeyManager ? window.ApiKeyManager.getOllamaModel() : 'local';
        ollamaDot.className = 'status-dot-sm dot-green';
        ollamaStatusText.textContent = `Ollama: Connected (${model})`;
      } else {
        ollamaDot.className = 'status-dot-sm dot-amber';
        ollamaStatusText.textContent = 'Ollama: Offline (Optional)';
      }
    }
  }

  // Open settings modal on button click
  if (btnConfigureAi) {
    btnConfigureAi.addEventListener('click', () => {
      if (window.ApiKeyManager) {
        window.ApiKeyManager.openSettings('gemini');
      }
    });
  }

  // Also make status pills clickable to open settings
  const geminiPill = document.getElementById('geminiStatusPill');
  if (geminiPill) {
    geminiPill.style.cursor = 'pointer';
    geminiPill.addEventListener('click', () => {
      if (window.ApiKeyManager) window.ApiKeyManager.openSettings('gemini');
    });
  }

  const ollamaPill = document.getElementById('ollamaStatusPill');
  if (ollamaPill) {
    ollamaPill.style.cursor = 'pointer';
    ollamaPill.addEventListener('click', () => {
      if (window.ApiKeyManager) window.ApiKeyManager.openSettings('ollama');
    });
  }

  // Listen for config changes
  if (window.ApiKeyManager) {
    window.ApiKeyManager.onChange(() => {
      updateGeminiStatus();
      checkOllamaStatus();
    });
  }

  // Initial checks
  updateGeminiStatus();
  checkOllamaStatus();
});

/**
 * OVI Hub - BYOK & Ollama Settings Modal
 * Interactive modal for configuring Google Gemini API Key and Ollama endpoint.
 */

(function (global) {
  let modalInitialized = false;

  const OviSettingsModal = {
    init() {
      if (modalInitialized || typeof document === 'undefined') return;
      modalInitialized = true;

      // Ensure CSS is loaded
      this._ensureStyles();

      // Inject Modal HTML
      const backdrop = document.createElement('div');
      backdrop.className = 'ovi-modal-backdrop';
      backdrop.id = 'oviSettingsModal';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-labelledby', 'oviModalTitle');

      backdrop.innerHTML = `
        <div class="ovi-modal-card">
          <!-- Header -->
          <div class="ovi-modal-header">
            <div class="ovi-modal-title-group">
              <div class="ovi-modal-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div>
                <h3 class="ovi-modal-title" id="oviModalTitle">AI Engine Settings</h3>
                <p class="ovi-modal-subtitle">Configure Gemini BYOK &amp; Local Ollama Models</p>
              </div>
            </div>
            <button type="button" class="ovi-modal-close-btn" id="oviModalClose" aria-label="Close modal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Provider Tabs -->
          <div class="ovi-provider-tabs">
            <button type="button" class="ovi-tab-btn active" data-tab="gemini" id="oviTabGemini">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              <span>Google Gemini</span>
              <span class="ovi-tab-badge">Cloud</span>
            </button>
            <button type="button" class="ovi-tab-btn" data-tab="ollama" id="oviTabOllama">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 3 3-3 3"/><path d="M14 14h2"/></svg>
              <span>Ollama</span>
              <span class="ovi-tab-badge">Local LLM</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="ovi-modal-body">
            
            <!-- TAB 1: GEMINI BYOK -->
            <div class="ovi-tab-pane active" id="oviPaneGemini">
              <div class="ovi-form-group">
                <label class="ovi-label" for="oviGeminiInput">
                  <span>Gemini API Key</span>
                  <span id="oviKeyBadge" style="font-size: 0.72rem; color: #94a3b8;">Not Configured</span>
                </label>
                <div class="ovi-input-wrapper">
                  <input type="password" class="ovi-input" id="oviGeminiInput" placeholder="AIzaSy..." spellcheck="false" autocomplete="off" />
                  <button type="button" class="ovi-input-action-btn" id="oviToggleEye" title="Show / Hide key">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>

                <div class="ovi-btn-row">
                  <button type="button" class="ovi-btn ovi-btn-primary" id="oviSaveGeminiBtn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Save Key</span>
                  </button>
                  <button type="button" class="ovi-btn ovi-btn-secondary" id="oviTestGeminiBtn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>Test Connection</span>
                  </button>
                  <button type="button" class="ovi-btn ovi-btn-danger" id="oviClearGeminiBtn" style="margin-left: auto;">
                    <span>Clear</span>
                  </button>
                </div>

                <!-- Status Feedback -->
                <div class="ovi-status-banner" id="oviGeminiStatus"></div>
              </div>

              <!-- Gemini Instruction Guide Box -->
              <div class="ovi-guide-box">
                <div class="ovi-guide-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  <span>How to get your free Gemini API Key</span>
                </div>
                <ol class="ovi-guide-steps">
                  <li>
                    <span class="ovi-step-num">1</span>
                    <span>Sign in to Google AI Studio with your Google account.</span>
                  </li>
                  <li>
                    <span class="ovi-step-num">2</span>
                    <span>Click <strong>&quot;Get API key&quot;</strong> and create a key in a new or existing Google Cloud project.</span>
                  </li>
                  <li>
                    <span class="ovi-step-num">3</span>
                    <span>Copy the key, paste it in the box above, and click <strong>&quot;Save Key&quot;</strong>.</span>
                  </li>
                </ol>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="ovi-guide-link">
                  <span>Open Google AI Studio</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>

              <div class="ovi-callout-warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div>
                  <strong>Voice Studio Requirement:</strong> Gemini Voice Studio utilizes 24kHz Google TTS and strictly requires a Gemini API key. Text-based services (Humanizer, Flowcharts, Brand Studio) can use either Gemini or Ollama.
                </div>
              </div>
            </div>

            <!-- TAB 2: OLLAMA LOCAL LLM -->
            <div class="ovi-tab-pane" id="oviPaneOllama">
              <div class="ovi-form-group">
                <label class="ovi-label" for="oviOllamaUrlInput">Ollama Endpoint URL</label>
                <div class="ovi-input-wrapper">
                  <input type="text" class="ovi-input" id="oviOllamaUrlInput" placeholder="http://localhost:11434" />
                </div>
              </div>

              <div class="ovi-form-group">
                <label class="ovi-label" for="oviOllamaModelInput">
                  <span>Model Name</span>
                  <button type="button" id="oviRefreshModelsBtn" class="ovi-guide-link" style="border:none;background:transparent;cursor:pointer;">
                    <span>Fetch Installed Models</span>
                  </button>
                </label>
                <div class="ovi-input-wrapper" id="oviModelInputContainer">
                  <input type="text" class="ovi-input" id="oviOllamaModelInput" placeholder="llama3:latest" />
                </div>
              </div>

              <div class="ovi-btn-row">
                <button type="button" class="ovi-btn ovi-btn-primary" id="oviSaveOllamaBtn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Save &amp; Use Ollama for Text Services</span>
                </button>
                <button type="button" class="ovi-btn ovi-btn-secondary" id="oviTestOllamaBtn">
                  <span>Test Connection</span>
                </button>
              </div>

              <!-- Ollama Status Banner -->
              <div class="ovi-status-banner" id="oviOllamaStatus"></div>

              <div class="ovi-guide-box">
                <div class="ovi-guide-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 3 3-3 3"/></svg>
                  <span>Local LLM Setup Tips</span>
                </div>
                <p style="font-size: 0.8rem; color: #94a3b8; margin: 0 0 0.5rem 0;">
                  If connecting directly from the browser, make sure Ollama is launched with CORS enabled:
                </p>
                <code style="display:block; padding: 0.4rem 0.6rem; background: rgba(0,0,0,0.4); border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#38bdf8; margin-bottom: 0.5rem;">
                  set OLLAMA_ORIGINS="*" && ollama serve
                </code>
                <p style="font-size: 0.75rem; color: #64748b; margin: 0;">
                  Recommended models: <code>llama3:latest</code>, <code>mistral:latest</code>, <code>gemma2:9b</code>, or <code>qwen2.5:7b</code>.
                </p>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="ovi-modal-footer">
            <div class="ovi-security-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Saved locally in browser localStorage only. Never transmitted elsewhere.</span>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      this._bindEvents();
      this._syncValues();
    },

    open(initialTab = 'gemini') {
      this.init();
      const backdrop = document.getElementById('oviSettingsModal');
      if (backdrop) {
        backdrop.classList.add('open');
        this.switchTab(initialTab);
        this._syncValues();
      }
    },

    close() {
      const backdrop = document.getElementById('oviSettingsModal');
      if (backdrop) {
        backdrop.classList.remove('open');
      }
    },

    switchTab(tab) {
      const isGemini = tab === 'gemini';
      const tabGemini = document.getElementById('oviTabGemini');
      const tabOllama = document.getElementById('oviTabOllama');
      const paneGemini = document.getElementById('oviPaneGemini');
      const paneOllama = document.getElementById('oviPaneOllama');

      if (tabGemini && tabOllama && paneGemini && paneOllama) {
        tabGemini.classList.toggle('active', isGemini);
        tabOllama.classList.toggle('active', !isGemini);
        paneGemini.classList.toggle('active', isGemini);
        paneOllama.classList.toggle('active', !isGemini);
      }
    },

    _syncValues() {
      const manager = global.ApiKeyManager;
      if (!manager) return;

      const geminiInput = document.getElementById('oviGeminiInput');
      const keyBadge = document.getElementById('oviKeyBadge');
      const ollamaUrlInput = document.getElementById('oviOllamaUrlInput');
      const ollamaModelInput = document.getElementById('oviOllamaModelInput');

      if (geminiInput) {
        const key = manager.getGeminiKey();
        geminiInput.value = key;
        if (keyBadge) {
          if (key) {
            keyBadge.textContent = `Configured (${manager.getMaskedGeminiKey()})`;
            keyBadge.style.color = '#34d399';
          } else {
            keyBadge.textContent = 'Not Configured';
            keyBadge.style.color = '#94a3b8';
          }
        }
      }

      if (ollamaUrlInput) {
        ollamaUrlInput.value = manager.getOllamaUrl();
      }

      if (ollamaModelInput) {
        ollamaModelInput.value = manager.getOllamaModel();
      }
    },

    _bindEvents() {
      const backdrop = document.getElementById('oviSettingsModal');
      const closeBtn = document.getElementById('oviModalClose');
      const tabGemini = document.getElementById('oviTabGemini');
      const tabOllama = document.getElementById('oviTabOllama');
      const toggleEye = document.getElementById('oviToggleEye');
      const geminiInput = document.getElementById('oviGeminiInput');
      const saveGeminiBtn = document.getElementById('oviSaveGeminiBtn');
      const testGeminiBtn = document.getElementById('oviTestGeminiBtn');
      const clearGeminiBtn = document.getElementById('oviClearGeminiBtn');
      const geminiStatus = document.getElementById('oviGeminiStatus');

      const ollamaUrlInput = document.getElementById('oviOllamaUrlInput');
      const ollamaModelInput = document.getElementById('oviOllamaModelInput');
      const saveOllamaBtn = document.getElementById('oviSaveOllamaBtn');
      const testOllamaBtn = document.getElementById('oviTestOllamaBtn');
      const refreshModelsBtn = document.getElementById('oviRefreshModelsBtn');
      const ollamaStatus = document.getElementById('oviOllamaStatus');

      // Backdrop & close click
      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) this.close();
        });
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      // Escape key to close
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) {
          this.close();
        }
      });

      // Tab switcher
      if (tabGemini) tabGemini.addEventListener('click', () => this.switchTab('gemini'));
      if (tabOllama) tabOllama.addEventListener('click', () => this.switchTab('ollama'));

      // Eye toggle
      if (toggleEye && geminiInput) {
        toggleEye.addEventListener('click', () => {
          const isPass = geminiInput.type === 'password';
          geminiInput.type = isPass ? 'text' : 'password';
        });
      }

      // Save Gemini Key
      if (saveGeminiBtn && geminiInput) {
        saveGeminiBtn.addEventListener('click', () => {
          const val = geminiInput.value.trim();
          global.ApiKeyManager.setGeminiKey(val);
          global.ApiKeyManager.setActiveProvider('gemini');
          this._showStatus(geminiStatus, 'Gemini API key saved successfully! Active provider set to Gemini.', 'success');
          this._syncValues();
        });
      }

      // Clear Gemini Key
      if (clearGeminiBtn && geminiInput) {
        clearGeminiBtn.addEventListener('click', () => {
          global.ApiKeyManager.clearGeminiKey();
          geminiInput.value = '';
          this._showStatus(geminiStatus, 'Gemini API key cleared from browser storage.', 'info');
          this._syncValues();
        });
      }

      // Test Gemini Key
      if (testGeminiBtn && geminiInput) {
        testGeminiBtn.addEventListener('click', async () => {
          const key = geminiInput.value.trim();
          if (!key) {
            this._showStatus(geminiStatus, 'Please enter a key to test.', 'error');
            return;
          }
          this._showStatus(geminiStatus, 'Testing key with Google Gemini API...', 'info');
          const res = await global.ApiKeyManager.validateGeminiKey(key);
          if (res.valid) {
            this._showStatus(geminiStatus, 'Success! Gemini API key is valid and working.', 'success');
          } else {
            this._showStatus(geminiStatus, `Failed: ${res.error}`, 'error');
          }
        });
      }

      // Save Ollama
      if (saveOllamaBtn && ollamaUrlInput && ollamaModelInput) {
        saveOllamaBtn.addEventListener('click', () => {
          global.ApiKeyManager.setOllamaUrl(ollamaUrlInput.value.trim());
          global.ApiKeyManager.setOllamaModel(ollamaModelInput.value.trim());
          global.ApiKeyManager.setActiveProvider('ollama');
          this._showStatus(ollamaStatus, 'Ollama settings saved! Active text provider set to Ollama.', 'success');
        });
      }

      // Test Ollama Connection
      const testOllama = async () => {
        const url = (ollamaUrlInput ? ollamaUrlInput.value : '').trim() || 'http://localhost:11434';
        this._showStatus(ollamaStatus, 'Connecting to Ollama...', 'info');
        const res = await global.ApiKeyManager.testOllamaConnection(url);
        if (res.connected) {
          const modelList = res.models.length > 0 ? `Installed models: ${res.models.join(', ')}` : 'Connected, but no models found (run `ollama pull llama3`).';
          this._showStatus(ollamaStatus, `Ollama connected! ${modelList}`, 'success');

          // If models available, turn model input into a select dropdown or update options
          if (res.models.length > 0) {
            this._populateModelDropdown(res.models);
          }
        } else {
          this._showStatus(ollamaStatus, res.error, 'error');
        }
      };

      if (testOllamaBtn) testOllamaBtn.addEventListener('click', testOllama);
      if (refreshModelsBtn) refreshModelsBtn.addEventListener('click', testOllama);

      // Listen for custom open event
      window.addEventListener('ovi:open-settings', (e) => {
        this.open(e.detail && e.detail.tab ? e.detail.tab : 'gemini');
      });
    },

    _populateModelDropdown(models) {
      const container = document.getElementById('oviModelInputContainer');
      const currentInput = document.getElementById('oviOllamaModelInput');
      if (!container || !currentInput) return;

      const currentVal = currentInput.value || models[0];
      const select = document.createElement('select');
      select.className = 'ovi-select';
      select.id = 'oviOllamaModelInput';

      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        if (m === currentVal) opt.selected = true;
        select.appendChild(opt);
      });

      container.innerHTML = '';
      container.appendChild(select);
    },

    _showStatus(el, msg, type = 'info') {
      if (!el) return;
      el.className = `ovi-status-banner show ovi-status-${type}`;
      el.textContent = msg;
    },

    _ensureStyles() {
      if (!document.querySelector('link[href*="api-key-modal.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/shared/api-key-modal.css';
        document.head.appendChild(link);
      }
    }
  };

  global.OviSettingsModal = OviSettingsModal;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => OviSettingsModal.init());
    } else {
      OviSettingsModal.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);

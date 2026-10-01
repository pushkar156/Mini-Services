/**
 * OVI Hub - Unified Navbar Component
 * Provides smooth navigation and settings trigger across all microservices.
 */

(function (global) {
  const SERVICES = [
    { id: 'home', name: 'Hub', badge: '', port: 3000, path: '/' },
    { id: 'voice', name: 'Voice Studio', badge: 'TTS', port: 3000, path: '/VoiceStudio/' },
    { id: 'humanizer', name: 'Humanizer', badge: 'Anti-AI', port: 3001, path: '/TextHumanizer/' },
    { id: 'ductus', name: 'Ductus', badge: 'Flows', port: 3002, path: '/Ductus/' },
    { id: 'ident', name: 'Ident', badge: 'Brand', port: 3003, path: '/Ident/' },
    { id: 'mediadrop', name: 'MediaDrop', badge: 'Media', port: 3004, path: '/MediaDrop/' },
    { id: 'photonarrator', name: 'PhotoNarrator', badge: 'Art', port: 9002, path: '/PhotoNarrator/' }
  ];

  function getServiceUrl(service) {
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // If running on local development with specific ports
    if (isLocalhost && window.location.port) {
      if (service.id === 'home' && window.location.port === '3000' && window.location.pathname === '/') {
        return '#';
      }
      return `http://${window.location.hostname}:${service.port}`;
    }

    // Relative path fallback
    return service.path;
  }

  class OviNavbarElement extends HTMLElement {
    connectedCallback() {
      const currentServiceId = (this.getAttribute('current') || 'home').toLowerCase();
      this.render(currentServiceId);
      this.bindEvents();
    }

    render(currentId) {
      const isConfigured = global.ApiKeyManager ? global.ApiKeyManager.hasGeminiKey() : false;
      const provider = global.ApiKeyManager ? global.ApiKeyManager.getActiveProvider() : 'gemini';

      const linksHtml = SERVICES.map(s => {
        const isActive = s.id === currentId;
        const badge = s.badge ? `<span class="ovi-service-badge">${s.badge}</span>` : '';
        const href = getServiceUrl(s);
        return `
          <a href="${href}" class="ovi-service-link ${isActive ? 'active' : ''}" data-service="${s.id}">
            <span>${s.name}</span>
            ${badge}
          </a>
        `;
      }).join('');

      const mobileLinksHtml = SERVICES.map(s => {
        const isActive = s.id === currentId;
        const href = getServiceUrl(s);
        return `
          <a href="${href}" class="ovi-mobile-dropdown-item ${isActive ? 'active' : ''}">
            <span>${s.name}</span>
            ${s.badge ? `<span class="ovi-service-badge">${s.badge}</span>` : ''}
          </a>
        `;
      }).join('');

      this.innerHTML = `
        <div class="ovi-navbar-host">
          <nav class="ovi-nav-bar" aria-label="OVI Hub Services Navigation">
            <!-- Brand -->
            <a href="/" class="ovi-nav-brand">
              <div class="ovi-brand-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="ovi-brand-titles">
                <span class="ovi-brand-name">OVI HUB</span>
                <span class="ovi-brand-sub">Micro-Services</span>
              </div>
            </a>

            <!-- Service Navigation Tabs -->
            <div class="ovi-nav-services">
              ${linksHtml}
            </div>

            <!-- Mobile Services Toggle -->
            <button type="button" class="ovi-mobile-services-toggle" id="oviMobToggle" aria-label="Toggle services list">
              <span>Services</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <!-- Actions Right -->
            <div class="ovi-nav-actions">
              <button type="button" class="ovi-nav-key-btn" id="oviOpenSettingsBtn" title="Configure Gemini API Key &amp; Ollama">
                <span class="ovi-status-dot ${isConfigured ? 'configured' : ''}" id="oviNavStatusDot"></span>
                <span id="oviNavKeyLabel">${isConfigured ? (provider === 'ollama' ? 'Ollama' : 'Gemini Active') : 'Set API Key'}</span>
              </button>

              <button type="button" class="ovi-theme-btn" id="oviThemeToggleBtn" title="Toggle Theme" aria-label="Toggle Theme">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </button>
            </div>

            <!-- Mobile Dropdown -->
            <div class="ovi-mobile-services-dropdown" id="oviMobDropdown">
              ${mobileLinksHtml}
            </div>
          </nav>
        </div>
      `;
    }

    bindEvents() {
      const settingsBtn = this.querySelector('#oviOpenSettingsBtn');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          if (global.ApiKeyManager) {
            global.ApiKeyManager.openSettings();
          }
        });
      }

      const mobToggle = this.querySelector('#oviMobToggle');
      const mobDropdown = this.querySelector('#oviMobDropdown');
      if (mobToggle && mobDropdown) {
        mobToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          mobDropdown.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
          if (!this.contains(e.target)) {
            mobDropdown.classList.remove('open');
          }
        });
      }

      const themeBtn = this.querySelector('#oviThemeToggleBtn');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          const body = document.body;
          const isLight = body.classList.contains('theme-light') || body.classList.contains('light');
          if (isLight) {
            body.classList.remove('theme-light', 'light');
            body.classList.add('theme-dark', 'dark');
            try { localStorage.setItem('OVI_HUB_THEME', 'dark'); } catch (e) {}
          } else {
            body.classList.remove('theme-dark', 'dark');
            body.classList.add('theme-light', 'light');
            try { localStorage.setItem('OVI_HUB_THEME', 'light'); } catch (e) {}
          }
        });
      }

      // Listen to config changes to update key status
      if (global.ApiKeyManager) {
        global.ApiKeyManager.onChange(() => {
          const isConfigured = global.ApiKeyManager.hasGeminiKey();
          const provider = global.ApiKeyManager.getActiveProvider();
          const dot = this.querySelector('#oviNavStatusDot');
          const label = this.querySelector('#oviNavKeyLabel');
          if (dot) dot.classList.toggle('configured', isConfigured);
          if (label) {
            label.textContent = isConfigured ? (provider === 'ollama' ? 'Ollama' : 'Gemini Active') : 'Set API Key';
          }
        });
      }
    }
  }

  // Register Web Component if customElements is available
  if (typeof customElements !== 'undefined' && !customElements.get('ovi-navbar')) {
    customElements.define('ovi-navbar', OviNavbarElement);
  }

  // Auto-inject navbar if an explicit container exists or helper called
  global.initOviNavbar = function (currentService = 'home') {
    if (document.querySelector('ovi-navbar')) return;
    const nav = document.createElement('ovi-navbar');
    nav.setAttribute('current', currentService);
    document.body.prepend(nav);
  };
})(typeof window !== 'undefined' ? window : globalThis);

/**
 * MediaDrop - Frontend Controller
 * Handles client-side URL validation, platform auto-detection,
 * asynchronous API requests to Flask backend, direct media downloads,
 * theme toggling, and local drop history.
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements - Inputs & Forms
  const urlInput = document.getElementById('url-input');
  const extractForm = document.getElementById('extract-form');
  const btnExtract = document.getElementById('btn-extract');
  const btnPaste = document.getElementById('btn-paste');
  const btnClear = document.getElementById('btn-clear');
  const platformIndicator = document.getElementById('platform-indicator');
  const platformNameText = document.getElementById('platform-name-text');

  // UI Elements - Sections
  const loadingSection = document.getElementById('loading-section');
  const resultSection = document.getElementById('result-section');
  const errorSection = document.getElementById('error-section');
  const errorMessage = document.getElementById('error-message');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // UI Elements - Result Card
  const resultPlatformBadge = document.getElementById('result-platform-badge');
  const resultTypeBadge = document.getElementById('result-type-badge');
  const resultTitle = document.getElementById('result-title');
  const previewImage = document.getElementById('preview-image');
  const previewVideo = document.getElementById('preview-video');
  const fileNameDisplay = document.getElementById('file-name-display');
  const btnDownloadFile = document.getElementById('btn-download-file');
  const btnOpenOriginal = document.getElementById('btn-open-original');
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const copyText = document.getElementById('copy-text');
  const btnReset = document.getElementById('btn-reset');
  const btnErrorDismiss = document.getElementById('btn-error-dismiss');

  // UI Elements - Carousel Grid
  const carouselSection = document.getElementById('carousel-section');
  const carouselGrid = document.getElementById('carousel-grid');
  const carouselInfoText = document.getElementById('carousel-info-text');
  const btnBulkDownload = document.getElementById('btn-bulk-download');
  const btnSelectAll = document.getElementById('btn-select-all');
  const bulkDownloadLabel = document.getElementById('bulk-download-label');
  const zipProgressText = document.getElementById('zip-progress-text');
  const mediaPreviewContainer = document.getElementById('media-preview-container');
  const downloadPanel = document.querySelector('.download-panel');

  // UI Elements - Partial result warning
  const partialWarning = document.getElementById('partial-warning');
  const partialWarningText = document.getElementById('partial-warning-text');

  // UI Elements - Theme Toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  let currentExtractedData = null;

  /**
   * Initialize Theme
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('mediadrop_theme') || 'emerald';
    applyTheme(savedTheme);
  }

  function applyTheme(themeName) {
    const finalTheme = themeName === 'light' ? 'light' : 'emerald';
    document.documentElement.setAttribute('data-theme', finalTheme);
    localStorage.setItem('mediadrop_theme', finalTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
      const newTheme = currentTheme === 'light' ? 'emerald' : 'light';
      applyTheme(newTheme);
    });
  }

  initTheme();

  /**
   * Detects platform from URL string
   */
  function detectPlatform(url) {
    if (!url) return null;
    const lower = url.toLowerCase().trim();
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      return 'instagram';
    }
    if (lower.includes('pinterest.') || lower.includes('pin.it')) {
      return 'pinterest';
    }
    return null;
  }

  /**
   * Updates platform indicator badge UI
   */
  function updatePlatformUI(url) {
    const platform = detectPlatform(url);
    
    // Toggle clear button
    if (url && url.length > 0) {
      btnClear.classList.remove('hidden');
    } else {
      btnClear.classList.add('hidden');
    }

    platformIndicator.classList.remove('is-instagram', 'is-pinterest');

    if (platform === 'instagram') {
      platformIndicator.classList.add('is-instagram');
      platformNameText.textContent = 'Instagram';
    } else if (platform === 'pinterest') {
      platformIndicator.classList.add('is-pinterest');
      platformNameText.textContent = 'Pinterest';
    } else {
      platformNameText.textContent = 'Auto';
    }
  }

  // URL input change listener
  urlInput.addEventListener('input', (e) => {
    updatePlatformUI(e.target.value);
  });

  // Paste button
  btnPaste.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
        updatePlatformUI(text);
        urlInput.focus();
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable:', err);
    }
  });

  // Clear button
  btnClear.addEventListener('click', () => {
    urlInput.value = '';
    updatePlatformUI('');
    urlInput.focus();
  });

  // Reset UI views
  function resetViews() {
    loadingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    
    // Stop video playback if playing
    previewVideo.pause();
    previewVideo.removeAttribute('src');
    previewImage.removeAttribute('src');
    
    // Reset carousel elements
    if (carouselSection) carouselSection.classList.add('hidden');
    if (carouselGrid) carouselGrid.innerHTML = '';
    if (mediaPreviewContainer) mediaPreviewContainer.classList.remove('hidden');
    if (downloadPanel) downloadPanel.classList.remove('hidden');
    if (partialWarning) partialWarning.classList.add('hidden');

    currentExtractedData = null;
  }

  btnReset.addEventListener('click', resetViews);
  btnErrorDismiss.addEventListener('click', resetViews);

  // Copy Direct URL button
  btnCopyUrl.addEventListener('click', async () => {
    if (!currentExtractedData || !currentExtractedData.media_url) return;
    try {
      await navigator.clipboard.writeText(currentExtractedData.media_url);
      copyText.textContent = 'Copied!';
      setTimeout(() => {
        copyText.textContent = 'Copy URL';
      }, 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  });

  /**
   * Main Extraction Handler
   */
  async function handleExtract(targetUrl) {
    const url = targetUrl || urlInput.value.trim();

    if (!url) {
      showError('Please paste an Instagram or Pinterest link first.');
      urlInput.focus();
      return;
    }

    // Set loading state
    resetViews();
    loadingSection.classList.remove('hidden');
    btnExtract.disabled = true;
    btnExtract.querySelector('.btn-text').classList.add('hidden');
    btnExtract.querySelector('.btn-loading').classList.remove('hidden');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract media from this URL.');
      }

      // Render success state
      renderResult(data);
      saveToHistory(data);

    } catch (err) {
      showError(err.message || 'An unexpected error occurred during extraction.');
    } finally {
      loadingSection.classList.add('hidden');
      btnExtract.disabled = false;
      btnExtract.querySelector('.btn-text').classList.remove('hidden');
      btnExtract.querySelector('.btn-loading').classList.add('hidden');
    }
  }

  /**
   * Renders the extracted media result
   */
  function renderResult(data) {
    resetViews();
    currentExtractedData = data;

    // Badges & Title
    const isInstagram = data.platform === 'instagram';
    resultPlatformBadge.textContent = isInstagram ? 'Instagram' : 'Pinterest';
    resultPlatformBadge.className = `badge badge-platform ${isInstagram ? 'instagram-tag' : 'pinterest-tag'}`;
    
    const isVideo = data.media_type === 'video';
    resultTitle.textContent = data.title || `${data.platform.toUpperCase()} Media`;

    // A partial result means only the cover image could be recovered - say so rather than
    // presenting one image as if it were the whole post.
    if (partialWarning && partialWarningText) {
      if (data.partial) {
        partialWarningText.textContent = data.note
          || 'Only the cover image could be recovered from this post. Retry in a moment to get every slide.';
        partialWarning.classList.remove('hidden');
      } else {
        partialWarning.classList.add('hidden');
      }
    }

    if (data.media_type === 'carousel' && data.carousel_items && data.carousel_items.length > 0) {
      resultTypeBadge.textContent = `Album (${data.carousel_items.length} Files)`;
      if (bulkDownloadLabel) {
        bulkDownloadLabel.textContent = `Download all as ZIP (${data.carousel_items.length})`;
      }

      // Hide standard previews and metadata panel
      if (mediaPreviewContainer) mediaPreviewContainer.classList.add('hidden');
      if (downloadPanel) downloadPanel.classList.add('hidden');

      // Show carousel grid section
      if (carouselSection) carouselSection.classList.remove('hidden');

      // Populates the grid
      if (carouselGrid) {
        carouselGrid.innerHTML = '';
        data.carousel_items.forEach((item, index) => {
          const card = document.createElement('div');
          card.className = 'carousel-item-card is-selected';
          card.setAttribute('data-index', index);

          const isVideoItem = item.media_type === 'video';
          // Load through the local proxy: the raw CDN URL is resolved server-side and
          // often refuses to load directly in the browser, which used to leave the grid
          // full of fallback icons.
          const thumbSrc = item.thumb_url || item.thumbnail_url;

          card.innerHTML = `
            <div class="carousel-thumb-wrapper">
              <img src="${thumbSrc}" alt="slide ${index + 1}" class="carousel-item-thumb" loading="lazy" onerror="this.src='/static/images/icon-192.png'" />
              <div class="carousel-checkbox-container">
                <input type="checkbox" class="carousel-checkbox" checked id="checkbox-${index}" />
              </div>
              <div class="carousel-type-badge">
                ${isVideoItem ? '📹 Video' : '🖼️ Image'}
              </div>
              <a href="${item.stream_url}" download="${item.filename}" class="carousel-item-download-btn" title="Download this item only" onclick="event.stopPropagation();">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </a>
            </div>
          `;
          
          // Toggle selection when card is clicked
          card.addEventListener('click', () => {
            const checkbox = card.querySelector('.carousel-checkbox');
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('is-selected', checkbox.checked);
            updateCarouselSelectionCount();
          });
          
          // Stop propagation for checkbox click
          const checkboxEl = card.querySelector('.carousel-checkbox');
          checkboxEl.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('is-selected', checkboxEl.checked);
            updateCarouselSelectionCount();
          });
          
          carouselGrid.appendChild(card);
        });
      }
      
      updateCarouselSelectionCount();
    } else {
      // Normal single preview
      resultTypeBadge.textContent = isVideo ? 'MP4 Video' : 'HD Image';
      if (mediaPreviewContainer) mediaPreviewContainer.classList.remove('hidden');
      if (downloadPanel) downloadPanel.classList.remove('hidden');
      if (carouselSection) carouselSection.classList.add('hidden');
      
      if (isVideo) {
        previewImage.classList.add('hidden');
        previewVideo.classList.remove('hidden');
        previewVideo.src = data.inline_url || data.media_url;
        previewVideo.load();
      } else {
        previewVideo.classList.add('hidden');
        previewImage.classList.remove('hidden');
        // Proxied through this origin so the preview does not depend on the browser being
        // able to reach the CDN node the URL was resolved against.
        previewImage.src = data.thumb_url || data.thumbnail_url || data.media_url;
      }

      // Download Links
      fileNameDisplay.textContent = data.filename;
      btnDownloadFile.href = data.stream_url;
      btnDownloadFile.setAttribute('download', data.filename);
      btnOpenOriginal.href = data.media_url;
    }

    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Updates the selected count in the carousel header
   */
  function updateCarouselSelectionCount() {
    if (!currentExtractedData || !currentExtractedData.carousel_items) return;
    const checkboxes = document.querySelectorAll('.carousel-checkbox');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;

    if (carouselInfoText) {
      carouselInfoText.textContent = `Selected ${checkedCount} of ${totalCount} items`;
    }

    if (bulkDownloadLabel) {
      bulkDownloadLabel.textContent = `Download all as ZIP (${checkedCount})`;
    }

    if (btnSelectAll) {
      btnSelectAll.textContent = checkedCount === totalCount ? 'Select none' : 'Select all';
    }

    if (btnBulkDownload) {
      btnBulkDownload.disabled = (checkedCount === 0);
    }
  }

  /**
   * Renders error state
   */
  function showError(msg) {
    resetViews();
    errorMessage.textContent = msg;
    errorSection.classList.remove('hidden');
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Local History Management
   */
  function loadHistory() {
    try {
      const stored = localStorage.getItem('mediadrop_history');
      const items = stored ? JSON.parse(stored) : [];
      if (items.length === 0) {
        historySection.classList.add('hidden');
        return;
      }

      historyList.innerHTML = '';
      items.forEach((item, historyIndex) => {
        const row = document.createElement('div');
        row.className = 'history-item';

        const isVideo = item.media_type === 'video';
        const albumItems = Array.isArray(item.carousel_items) ? item.carousel_items : [];
        const isAlbum = albumItems.length > 1;
        const thumbSrc = item.thumb_url || item.thumbnail_url || item.media_url;

        let kindLabel;
        if (isAlbum) {
          kindLabel = `Album &bull; ${albumItems.length} files`;
        } else {
          kindLabel = isVideo ? 'Video' : 'Image';
        }

        // Albums re-download as a single ZIP, so the whole post comes back rather than
        // just the cover that the top-level stream_url points at.
        const actionHtml = isAlbum
          ? `<button type="button" class="btn-secondary" data-history-zip="${historyIndex}" title="Re-download all ${albumItems.length} files">Download all</button>`
          : `<a href="${item.stream_url}" download="${item.filename}" class="btn-secondary" title="Re-download">Download</a>`;

        row.innerHTML = `
          <div class="history-info">
            <img src="${thumbSrc}" alt="thumb" class="history-thumb" loading="lazy" onerror="this.style.display='none'" />
            <div class="history-details">
              <span class="history-filename">${item.filename}</span>
              <span class="history-meta">${item.platform.toUpperCase()} &bull; ${kindLabel}</span>
            </div>
          </div>
          <div class="history-actions">
            ${actionHtml}
          </div>
        `;
        historyList.appendChild(row);
      });

      historyList.querySelectorAll('[data-history-zip]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const entry = items[Number(btn.dataset.historyZip)];
          if (!entry || !entry.carousel_items) return;

          const originalLabel = btn.textContent;
          btn.disabled = true;
          btn.textContent = 'Zipping...';
          try {
            if (typeof JSZip !== 'undefined') {
              await downloadAllAsZip(entry.carousel_items, entry.shortcode);
            } else {
              await downloadItemsIndividually(entry.carousel_items);
            }
          } catch (err) {
            console.error('History re-download failed:', err);
            showError(err.message || 'Could not re-download this album.');
          } finally {
            btn.disabled = false;
            btn.textContent = originalLabel;
          }
        });
      });

      historySection.classList.remove('hidden');
    } catch (e) {
      console.warn('Could not load history:', e);
    }
  }

  function saveToHistory(item) {
    try {
      const stored = localStorage.getItem('mediadrop_history');
      let items = stored ? JSON.parse(stored) : [];
      // Remove duplicate filename
      items = items.filter(x => x.filename !== item.filename);

      const entry = {
        filename: item.filename,
        platform: item.platform,
        media_type: item.media_type,
        media_url: item.media_url,
        stream_url: item.stream_url,
        thumbnail_url: item.thumbnail_url,
        thumb_url: item.thumb_url,
        shortcode: item.shortcode,
        timestamp: Date.now()
      };

      // Keep the whole album, not just the cover, so "Download all" still works from history.
      if (Array.isArray(item.carousel_items) && item.carousel_items.length > 0) {
        entry.carousel_items = item.carousel_items.map(c => ({
          media_type: c.media_type,
          filename: c.filename,
          stream_url: c.stream_url,
          thumb_url: c.thumb_url,
        }));
      }

      items.unshift(entry);
      // Keep only top 6
      items = items.slice(0, 6);
      localStorage.setItem('mediadrop_history', JSON.stringify(items));
      loadHistory();
    } catch (e) {
      console.warn('Could not save to history:', e);
    }
  }

  btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem('mediadrop_history');
    historySection.classList.add('hidden');
  });

  /**
   * Returns the currently selected carousel items, in slide order.
   */
  function getSelectedCarouselItems() {
    if (!currentExtractedData || !currentExtractedData.carousel_items) return [];
    const checkboxes = Array.from(document.querySelectorAll('.carousel-checkbox'));
    return currentExtractedData.carousel_items.filter((item, idx) => {
      const cb = checkboxes[idx];
      return cb ? cb.checked : false;
    });
  }

  /**
   * Derives a zip entry name like "03.jpg", preserving the item's real extension.
   */
  function zipEntryName(item, index) {
    const match = /\.([a-z0-9]{3,4})(?:\?|$)/i.exec(item.filename || '');
    const ext = match ? match[1] : (item.media_type === 'video' ? 'mp4' : 'jpg');
    return `${String(index + 1).padStart(2, '0')}.${ext}`;
  }

  function setBulkBusy(isBusy) {
    if (!btnBulkDownload) return;
    const btnText = btnBulkDownload.querySelector('.btn-text');
    const btnLoading = btnBulkDownload.querySelector('.btn-loading');
    if (btnText && btnLoading) {
      btnText.classList.toggle('hidden', isBusy);
      btnLoading.classList.toggle('hidden', !isBusy);
    }
    btnBulkDownload.disabled = isBusy;
  }

  function saveBlob(blob, filename) {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke a tick later so the browser has picked the download up
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  }

  /**
   * Fetches every selected slide through the local stream endpoint and saves them as a
   * single ZIP. Bundling avoids the browser's multiple-automatic-download throttling that
   * previously caused most of an album to silently never arrive.
   */
  async function downloadAllAsZip(items, shortcode) {
    const zip = new JSZip();

    for (let i = 0; i < items.length; i++) {
      if (zipProgressText) {
        zipProgressText.textContent = `Zipping ${i + 1} / ${items.length}...`;
      }
      const response = await fetch(items[i].stream_url);
      if (!response.ok) {
        throw new Error(`Slide ${i + 1} could not be downloaded (HTTP ${response.status}).`);
      }
      zip.file(zipEntryName(items[i], i), await response.blob());
    }

    if (zipProgressText) zipProgressText.textContent = 'Building ZIP...';
    const blob = await zip.generateAsync({ type: 'blob' });

    saveBlob(blob, `mediadrop_${shortcode || 'album'}.zip`);
  }

  /**
   * Fallback when JSZip is unavailable: save each file in turn, awaiting every fetch so
   * the downloads are sequential rather than a burst the browser will throttle.
   */
  async function downloadItemsIndividually(items) {
    for (let i = 0; i < items.length; i++) {
      if (zipProgressText) {
        zipProgressText.textContent = `Saving ${i + 1} / ${items.length}...`;
      }
      const response = await fetch(items[i].stream_url);
      if (!response.ok) continue;
      saveBlob(await response.blob(), items[i].filename);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  // Select all / none toggle
  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      const checkboxes = Array.from(document.querySelectorAll('.carousel-checkbox'));
      if (checkboxes.length === 0) return;
      const shouldSelectAll = checkboxes.some(cb => !cb.checked);

      checkboxes.forEach((cb) => {
        cb.checked = shouldSelectAll;
        const card = cb.closest('.carousel-item-card');
        if (card) card.classList.toggle('is-selected', shouldSelectAll);
      });
      updateCarouselSelectionCount();
    });
  }

  // Bulk Download Selected Button - bundles the album into one ZIP
  if (btnBulkDownload) {
    btnBulkDownload.addEventListener('click', async () => {
      const items = getSelectedCarouselItems();
      if (items.length === 0) return;

      setBulkBusy(true);
      try {
        if (typeof JSZip !== 'undefined') {
          await downloadAllAsZip(items, currentExtractedData.shortcode);
        } else {
          await downloadItemsIndividually(items);
        }
      } catch (err) {
        console.error('Bulk download failed:', err);
        try {
          await downloadItemsIndividually(items);
        } catch (fallbackErr) {
          showError(err.message || 'Could not download the selected items. Please try again.');
        }
      } finally {
        if (zipProgressText) zipProgressText.textContent = 'Zipping...';
        setBulkBusy(false);
        updateCarouselSelectionCount();
      }
    });
  }

  /**
   * Checks the backend status and updates the badge dynamically
   */
  async function checkBackendStatus() {
    const statusBadge = document.getElementById('backend-status-badge');
    if (!statusBadge) return;

    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const isVercel = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('now.sh');
        statusBadge.innerHTML = `<span class="status-dot"></span> ${isVercel ? 'Vercel Online' : 'Flask Local'}`;
        statusBadge.classList.add('is-online');
      } else {
        throw new Error('Offline');
      }
    } catch (e) {
      statusBadge.innerHTML = `<span class="status-dot" style="background-color: #f43f5e;"></span> Offline`;
      statusBadge.classList.remove('is-online');
    }
  }

  checkBackendStatus();
  loadHistory();

  // Form submission
  extractForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleExtract();
  });

  // --- PWA Installation Custom Banner ---
  let deferredPrompt = null;
  const pwaInstallBanner = document.getElementById('pwa-install-banner');
  const btnPwaInstall = document.getElementById('btn-pwa-install');
  const btnPwaDismiss = document.getElementById('btn-pwa-dismiss');

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Check if the user has already dismissed this banner in the current session
    const isDismissedThisSession = sessionStorage.getItem('mediadrop_install_dismissed') === 'true';
    const isAlreadyStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

    if (!isDismissedThisSession && !isAlreadyStandalone && pwaInstallBanner) {
      pwaInstallBanner.classList.remove('hidden');
    }
  });

  if (btnPwaInstall) {
    btnPwaInstall.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      // We've used the prompt, and can't use it again, discard it
      deferredPrompt = null;
      
      // Hide our custom install banner
      if (pwaInstallBanner) {
        pwaInstallBanner.classList.add('hidden');
      }
    });
  }

  if (btnPwaDismiss) {
    btnPwaDismiss.addEventListener('click', () => {
      // Record dismissal in sessionStorage so it doesn't prompt again in this session
      sessionStorage.setItem('mediadrop_install_dismissed', 'true');
      if (pwaInstallBanner) {
        pwaInstallBanner.classList.add('hidden');
      }
    });
  }

  // Hide the banner if the app is successfully installed
  window.addEventListener('appinstalled', (e) => {
    console.log('MediaDrop was successfully installed!');
    deferredPrompt = null;
    if (pwaInstallBanner) {
      pwaInstallBanner.classList.add('hidden');
    }
  });
});

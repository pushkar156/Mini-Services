// OVI Prompt Enhancer — Popup Controller

document.addEventListener("DOMContentLoaded", async () => {
  const promptInput = document.getElementById("prompt-input");
  const promptOutput = document.getElementById("prompt-output");
  const charCount = document.getElementById("char-count");
  const styleSelect = document.getElementById("style-select");
  const modelSelect = document.getElementById("model-select");
  const enhanceBtn = document.getElementById("enhance-btn");
  const btnText = document.getElementById("btn-text");
  const btnSpinner = document.getElementById("btn-spinner");
  const outputSection = document.getElementById("output-section");
  const ratioBadge = document.getElementById("ratio-badge");
  const copyBtn = document.getElementById("copy-btn");
  const insertBtn = document.getElementById("insert-btn");
  const statusText = document.getElementById("status-text");

  // Settings elements
  const toggleSettingsBtn = document.getElementById("toggle-settings");
  const settingsPanel = document.getElementById("settings-panel");
  const apiUrlInput = document.getElementById("api-url");
  const apiKeyInput = document.getElementById("api-key");
  const saveSettingsBtn = document.getElementById("save-settings");
  const settingsSavedMsg = document.getElementById("settings-saved-msg");

  // 1. Load saved settings
  chrome.storage.local.get(
    {
      apiUrl: "http://localhost:3000/api/enhance",
      defaultStyle: "coding",
      defaultModel: "claude",
      apiKey: "",
    },
    (settings) => {
      apiUrlInput.value = settings.apiUrl;
      apiKeyInput.value = settings.apiKey;
      styleSelect.value = settings.defaultStyle || "coding";
      modelSelect.value = settings.defaultModel || "claude";
    }
  );

  // 2. Prepopulate with selected text from active tab if available
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => window.getSelection().toString(),
        },
        (results) => {
          if (results && results[0] && results[0].result && results[0].result.trim()) {
            promptInput.value = results[0].result.trim();
            updateWordCount();
          }
        }
      );
    }
  } catch (e) {
    // Ignore active tab scripting permission error on restricted chrome:// pages
  }

  // 3. Update word/token count on type
  promptInput.addEventListener("input", updateWordCount);

  function updateWordCount() {
    const text = promptInput.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const tokens = Math.round(words * 1.33);
    charCount.textContent = `${words} words (~${tokens}t)`;
  }

  // 4. Toggle & Save settings
  toggleSettingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });

  saveSettingsBtn.addEventListener("click", () => {
    const newSettings = {
      apiUrl: apiUrlInput.value.trim() || "http://localhost:3000/api/enhance",
      apiKey: apiKeyInput.value.trim(),
      defaultStyle: styleSelect.value,
      defaultModel: modelSelect.value,
    };

    chrome.storage.local.set(newSettings, () => {
      settingsSavedMsg.classList.remove("hidden");
      setTimeout(() => {
        settingsSavedMsg.classList.add("hidden");
        settingsPanel.classList.add("hidden");
      }, 1200);
    });
  });

  // 5. Enhance action
  enhanceBtn.addEventListener("click", async () => {
    const text = promptInput.value.trim();
    if (!text) {
      promptInput.focus();
      return;
    }

    setLoading(true);
    statusText.textContent = "Synthesizing master-grade prompt...";

    chrome.runtime.sendMessage(
      {
        action: "CALL_ENHANCE_API",
        payload: {
          prompt: text,
          style: styleSelect.value,
          targetModel: modelSelect.value,
        },
      },
      (response) => {
        setLoading(false);

        if (!response || !response.success) {
          statusText.textContent = `Error: ${response?.error || "Could not reach API"}`;
          return;
        }

        const data = response.data;
        promptOutput.value = data.enhancedPrompt;
        ratioBadge.textContent = data.metrics?.expansionRatio || "+100%";
        outputSection.classList.remove("hidden");
        statusText.textContent = `Fortified for ${data.metrics?.targetModel || "LLM"} (${data.metrics?.enhancedTokens || 0} tokens in ${data.metrics?.latencyMs || 0}ms)`;
      }
    );
  });

  function setLoading(isLoading) {
    enhanceBtn.disabled = isLoading;
    if (isLoading) {
      btnText.textContent = "Fortifying...";
      btnSpinner.classList.remove("hidden");
    } else {
      btnText.textContent = "Fortify Prompt";
      btnSpinner.classList.add("hidden");
    }
  }

  // 6. Copy action
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(promptOutput.value);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1500);
  });

  // 7. Insert into Active Tab action
  insertBtn.addEventListener("click", async () => {
    const textToInsert = promptOutput.value;
    if (!textToInsert) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "ENHANCE_IN_PLACE",
          style: styleSelect.value,
          selectedText: textToInsert,
        });
        insertBtn.textContent = "Inserted!";
        setTimeout(() => {
          insertBtn.textContent = "Insert in Page";
          window.close(); // Close popup after insertion
        }, 800);
      }
    } catch (err) {
      statusText.textContent = "Could not insert automatically. Copied instead!";
      navigator.clipboard.writeText(textToInsert);
    }
  });
});


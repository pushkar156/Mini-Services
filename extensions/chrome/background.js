// OVI Prompt Enhancer — Background Service Worker (Manifest V3)

const DEFAULT_SETTINGS = {
  apiUrl: "http://localhost:3000/api/enhance",
  defaultStyle: "coding",
  defaultModel: "claude",
  apiKey: "",
};

// Initialize context menus on install
chrome.runtime.onInstalled.addListener(() => {
  // Ensure default storage settings
  chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
    chrome.storage.local.set(stored);
  });

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "ovi-enhance-root",
      title: "OVI: Enhance Prompt",
      contexts: ["selection", "editable"],
    });

    const archetypes = [
      { id: "coding", title: "Coding & Technical Specs" },
      { id: "agentic", title: "Autonomous Agent Protocol" },
      { id: "reasoning", title: "Chain-of-Thought Reasoning" },
      { id: "concise", title: "Concise & Direct" },
      { id: "creative", title: "Creative Nuance" },
    ];

    archetypes.forEach((arch) => {
      chrome.contextMenus.create({
        id: `ovi-enhance-${arch.id}`,
        parentId: "ovi-enhance-root",
        title: arch.title,
        contexts: ["selection", "editable"],
      });
    });
  });
});

// Context Menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  let style = "coding";
  if (info.menuItemId.startsWith("ovi-enhance-")) {
    const parsed = info.menuItemId.replace("ovi-enhance-", "");
    if (parsed !== "root") {
      style = parsed;
    }
  }

  chrome.tabs.sendMessage(tab.id, {
    action: "ENHANCE_IN_PLACE",
    style,
    selectedText: info.selectionText || "",
  });
});

// Keyboard command handler (Alt+Shift+E)
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "enhance-prompt" && tab && tab.id) {
    chrome.storage.local.get(["defaultStyle"], (settings) => {
      chrome.tabs.sendMessage(tab.id, {
        action: "ENHANCE_IN_PLACE",
        style: settings.defaultStyle || "coding",
      });
    });
  }
});

// Proxy enhancement API requests via background worker to bypass any page CSP or CORS limits
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CALL_ENHANCE_API") {
    handleEnhanceApi(request.payload)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleEnhanceApi(payload) {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const targetUrl = settings.apiUrl || DEFAULT_SETTINGS.apiUrl;

  const headers = {
    "Content-Type": "application/json",
  };

  if (settings.apiKey && settings.apiKey.trim()) {
    headers["x-gemini-api-key"] = settings.apiKey.trim();
  }

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: payload.prompt,
      style: payload.style || settings.defaultStyle || "coding",
      targetModel: payload.targetModel || settings.defaultModel || "claude",
      outputFormat: payload.outputFormat || (payload.targetModel === "claude" ? "xml" : "markdown"),
      includeNegative: payload.includeNegative !== false,
      apiKey: settings.apiKey || undefined,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}


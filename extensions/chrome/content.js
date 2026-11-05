// OVI Prompt Enhancer — Content Script (In-Place Enhancement)

(() => {
  // Listen for background requests
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ENHANCE_IN_PLACE") {
      executeInPlaceEnhancement(request.style, request.selectedText);
    }
  });

  async function executeInPlaceEnhancement(style = "coding", passedText = "") {
    const activeEl = document.activeElement;
    let targetText = passedText ? passedText.trim() : "";
    let replaceFn = null;

    // Detect target input or selection
    if (!targetText) {
      if (activeEl && (activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT")) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;

        if (start !== null && end !== null && start !== end) {
          targetText = activeEl.value.substring(start, end).trim();
          replaceFn = (newText) => {
            const before = activeEl.value.substring(0, start);
            const after = activeEl.value.substring(end);
            activeEl.value = before + newText + after;
            activeEl.selectionStart = start;
            activeEl.selectionEnd = start + newText.length;
            dispatchInputEvents(activeEl);
          };
        } else {
          targetText = activeEl.value.trim();
          replaceFn = (newText) => {
            activeEl.value = newText;
            dispatchInputEvents(activeEl);
          };
        }
      } else if (activeEl && activeEl.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.toString().trim()) {
          targetText = sel.toString().trim();
          replaceFn = (newText) => {
            document.execCommand("insertText", false, newText);
            dispatchInputEvents(activeEl);
          };
        } else {
          targetText = activeEl.innerText.trim();
          replaceFn = (newText) => {
            activeEl.innerText = newText;
            dispatchInputEvents(activeEl);
          };
        }
      } else {
        const sel = window.getSelection();
        if (sel && sel.toString().trim()) {
          targetText = sel.toString().trim();
          replaceFn = (newText) => {
            navigator.clipboard.writeText(newText);
          };
        }
      }
    }

    if (!targetText) {
      showToast("OVI: Please highlight or select a prompt first", "warning");
      return;
    }

    showToast(`OVI: Fortifying prompt (${style})...`, "loading");

    chrome.runtime.sendMessage(
      {
        action: "CALL_ENHANCE_API",
        payload: {
          prompt: targetText,
          style,
        },
      },
      (response) => {
        if (!response || !response.success) {
          showToast(`OVI Error: ${response?.error || "Failed to reach enhancer API"}`, "error");
          return;
        }

        const enhanced = response.data.enhancedPrompt;

        if (replaceFn) {
          try {
            replaceFn(enhanced);
            showToast(`OVI: Prompt Fortified (${response.data.metrics?.expansionRatio || "+100%"})`, "success");
          } catch (e) {
            navigator.clipboard.writeText(enhanced);
            showToast("OVI: Prompt enhanced & copied to clipboard!", "success");
          }
        } else {
          navigator.clipboard.writeText(enhanced);
          showToast("OVI: Prompt enhanced & copied to clipboard!", "success");
        }
      }
    );
  }

  function dispatchInputEvents(element) {
    element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  // Minimalist Quiet Luxury Toast Indicator
  function showToast(message, type = "info") {
    let toast = document.getElementById("ovi-enhancer-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ovi-enhancer-toast";
      document.body.appendChild(toast);
    }

    toast.className = `ovi-toast ovi-toast-${type}`;
    toast.innerHTML = `
      <div class="ovi-toast-inner">
        <span class="ovi-toast-dot"></span>
        <span class="ovi-toast-msg">${message}</span>
      </div>
    `;

    toast.style.display = "block";

    if (type !== "loading") {
      setTimeout(() => {
        if (toast) toast.style.opacity = "0";
        setTimeout(() => {
          if (toast) toast.style.display = "none";
          if (toast) toast.style.opacity = "1";
        }, 300);
      }, 3500);
    }
  }
})();


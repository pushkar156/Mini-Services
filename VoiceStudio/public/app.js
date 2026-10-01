/**
 * Gemini Voice Studio - Frontend Application
 * Vanilla JavaScript implementation for Gemini TTS
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const textInput = document.getElementById("textInput");
  const charCount = document.getElementById("charCount");
  const wordCount = document.getElementById("wordCount");
  const readTime = document.getElementById("readTime");
  const btnClear = document.getElementById("btnClear");
  const btnPaste = document.getElementById("btnPaste");
  const dialogueNotice = document.getElementById("dialogueNotice");

  // Presets
  const sampleButtons = document.querySelectorAll(".btn-sample");

  // Speaker Mode
  const btnSingleSpeaker = document.getElementById("btnSingleSpeaker");
  const btnDialogueMode = document.getElementById("btnDialogueMode");
  const singleVoicePanel = document.getElementById("singleVoicePanel");
  const dialoguePanel = document.getElementById("dialoguePanel");
  const voiceSelect = document.getElementById("voiceSelect");
  const selectedVoicePill = document.getElementById("selectedVoicePill");
  const voiceDescription = document.getElementById("voiceDescription");

  // Dialogue speakers
  const speaker1Name = document.getElementById("speaker1Name");
  const speaker1Voice = document.getElementById("speaker1Voice");
  const speaker2Name = document.getElementById("speaker2Name");
  const speaker2Voice = document.getElementById("speaker2Voice");
  const tokenChips = document.querySelectorAll(".chip-token");

  // Module & Style controls
  const moduleSelect = document.getElementById("moduleSelect");
  const moduleDescription = document.getElementById("moduleDescription");
  const styleSelect = document.getElementById("styleSelect");
  const langSelect = document.getElementById("langSelect");
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  const pitchSlider = document.getElementById("pitchSlider");
  const pitchValue = document.getElementById("pitchValue");
  const customDirection = document.getElementById("customDirection");
  const emotionalIntensity = document.getElementById("emotionalIntensity");
  const intensityLabel = document.getElementById("intensityLabel");

  // Generator & Status
  const btnGenerate = document.getElementById("btnGenerate");
  const btnGenText = document.getElementById("btnGenText");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnGenIcon = document.getElementById("btnGenIcon");
  const statusMessage = document.getElementById("statusMessage");

  // Audio Engine & Player
  const audioElement = document.getElementById("audioElement");
  const btnPlayPause = document.getElementById("btnPlayPause");
  const iconPlay = document.getElementById("iconPlay");
  const iconPause = document.getElementById("iconPause");
  const btnStop = document.getElementById("btnStop");
  const currentTime = document.getElementById("currentTime");
  const totalDuration = document.getElementById("totalDuration");
  const seekSlider = document.getElementById("seekSlider");
  const scrubberProgress = document.getElementById("scrubberProgress");
  const visualizerBars = document.getElementById("visualizerBars");
  const btnMute = document.getElementById("btnMute");
  const iconVolHigh = document.getElementById("iconVolHigh");
  const iconVolMuted = document.getElementById("iconVolMuted");
  const volumeSlider = document.getElementById("volumeSlider");
  const playbackRateSelect = document.getElementById("playbackRateSelect");
  const formatSelect = document.getElementById("formatSelect");
  const btnDownloadMp3 = document.getElementById("btnDownloadMp3");
  const btnDownloadWav = document.getElementById("btnDownloadWav");
  const toast = document.getElementById("toast");

  // --- State Variables ---
  let isDialogueMode = false;
  let currentMp3Blob = null;
  let currentWavBlob = null;
  let currentMp3Url = null;
  let currentWavUrl = null;
  let currentAudioBlob = null;
  let currentAudioUrl = null;
  let isGenerating = false;
  let isDraggingScrubber = false;
  let previousVolume = 1;

  // Module descriptions mapping
  const moduleDescriptions = {
    general: "Speak naturally and clearly with a balanced, pleasant conversational tone.",
    narration: "Speak clearly and naturally with a steady, professional narration style.",
    storytelling: "Use expressive storytelling, natural dramatic pauses, emotional variation, and engaging narrative delivery.",
    podcast: "Use a natural conversational podcast delivery with expressive but relaxed pacing and authentic warmth.",
    educational: "Speak clearly and patiently, emphasizing important concepts and maintaining an easy-to-follow rhythm.",
    news: "Speak clearly, confidently, neutrally, and professionally like a television news presenter.",
    advertisement: "Speak with high energy, charismatic enthusiasm, and persuasive warmth.",
    conversational: "Speak casually, naturally, and warmly as if talking directly to a friend.",
    audiobook: "Deliver rich, nuanced storytelling with clear character pacing and immersive acoustic presence.",
    character: "Use dramatic, character-driven expressive delivery with heightened emotional emphasis."
  };

  // Sample texts
  const sampleTexts = {
    narration: {
      text: "In the quiet depths of the ancient mountain range, pristine pine forests stood as silent guardians beneath the first snowfall of winter. The cool evening wind carried whispers of forgotten seasons across the frozen ridge.",
      mode: "single",
      voice: "Charon",
      module: "narration",
      style: "serious"
    },
    podcast: {
      text: "Welcome back to The Daily Pulse! |yeah| Today we are diving into a major breakthrough in real-time generative speech. Honestly, the vocal nuances and conversational backchanneling are mind-blowing.",
      mode: "single",
      voice: "Puck",
      module: "podcast",
      style: "energetic"
    },
    story: {
      text: "The antique clock in the grandfather's study began to tick backward. <gasp> Julian rubbed his eyes, but the ornate golden hands were undeniably spinning counterclockwise, slowly rewinding time itself.",
      mode: "single",
      voice: "Aoede",
      module: "storytelling",
      style: "dramatic"
    },
    dialogue: {
      text: "Alex: Hey Sarah, did you get a chance to review the keynote slides? <breath>\nSarah: Absolutely! |yeah| The audio quality and speaker consistency sound remarkably lifelike.\nAlex: Perfect, let's take this straight to the live demo stage.",
      mode: "dialogue",
      speaker1Name: "Alex",
      speaker1Voice: "Puck",
      speaker2Name: "Sarah",
      speaker2Voice: "Kore",
      module: "conversational",
      style: "friendly"
    }
  };

  // --- Dynamic Voice Fetching ---
  async function loadVoices() {
    try {
      const response = await fetch("/api/voices");
      if (response.ok) {
        const data = await response.json();
        if (data.voices && data.voices.length > 0) {
          populateVoiceDropdowns(data.voices);
        }
      }
    } catch (err) {
      console.warn("Using default prebuilt voice catalogue:", err);
    }
  }

  function populateVoiceDropdowns(voices) {
    const previousVoice = voiceSelect.value;
    voiceSelect.innerHTML = "";

    voices.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.name;
      option.textContent = `${v.name} — ${v.style} (${v.gender})`;
      option.dataset.gender = v.gender;
      option.dataset.style = v.style;
      option.dataset.desc = v.description;
      if (v.name === previousVoice) option.selected = true;
      voiceSelect.appendChild(option);
    });

    updateVoiceInfo();
  }

  function updateVoiceInfo() {
    const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
    if (selectedOption) {
      const style = selectedOption.dataset.style || "Natural / Balanced";
      const desc = selectedOption.dataset.desc || "Gemini natural prebuilt voice.";
      selectedVoicePill.textContent = style;
      voiceDescription.textContent = desc;
    }
  }

  // --- Text Statistics & Handling ---
  function updateTextStats() {
    const text = textInput.value;
    const chars = text.length;
    charCount.textContent = chars.toLocaleString();

    // Word count calculation
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCount.textContent = `${words} word${words === 1 ? "" : "s"}`;

    // Estimated speech duration: ~150 words per minute = 2.5 words per sec
    const estimatedSeconds = Math.round(words / 2.5);
    readTime.textContent = `Est. ${estimatedSeconds}s speech`;
  }

  textInput.addEventListener("input", updateTextStats);

  btnClear.addEventListener("click", () => {
    textInput.value = "";
    updateTextStats();
    textInput.focus();
  });

  btnPaste.addEventListener("click", async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        textInput.value = clipText;
        updateTextStats();
        showToast("Text pasted from clipboard", "success");
      }
    } catch (err) {
      textInput.focus();
      showToast("Clipboard access denied. Please paste manually.", "error");
    }
  });

  // --- Mode Switching (Single Speaker vs Dialogue) ---
  function setSpeakerMode(mode) {
    if (mode === "dialogue") {
      isDialogueMode = true;
      btnDialogueMode.classList.add("active");
      btnSingleSpeaker.classList.remove("active");
      singleVoicePanel.style.display = "none";
      dialoguePanel.style.display = "flex";
      dialogueNotice.style.display = "flex";
    } else {
      isDialogueMode = false;
      btnSingleSpeaker.classList.add("active");
      btnDialogueMode.classList.remove("active");
      singleVoicePanel.style.display = "flex";
      dialoguePanel.style.display = "none";
      dialogueNotice.style.display = "none";
    }
  }

  btnSingleSpeaker.addEventListener("click", () => setSpeakerMode("single"));
  btnDialogueMode.addEventListener("click", () => setSpeakerMode("dialogue"));

  // Voice Select listener
  voiceSelect.addEventListener("change", updateVoiceInfo);

  // Module Select listener
  moduleSelect.addEventListener("change", () => {
    const selected = moduleSelect.value;
    moduleDescription.textContent = moduleDescriptions[selected] || "";
  });

  // Sliders listeners
  speedSlider.addEventListener("input", () => {
    speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(2)}x`;
  });

  pitchSlider.addEventListener("input", () => {
    const val = parseFloat(pitchSlider.value);
    if (val < -0.1) pitchValue.textContent = "Lower";
    else if (val > 0.1) pitchValue.textContent = "Higher";
    else pitchValue.textContent = "Normal";
  });

  emotionalIntensity.addEventListener("input", () => {
    const val = parseInt(emotionalIntensity.value, 10);
    const labels = ["Subtle", "Gentle", "Moderate", "Expressive", "Maximum"];
    intensityLabel.textContent = labels[val - 1] || "Moderate";
  });

  // Token Chips click: insert into textarea at cursor
  tokenChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const token = chip.dataset.token;
      insertAtCursor(textInput, ` ${token} `);
      updateTextStats();
    });
  });

  function insertAtCursor(input, textToInsert) {
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    input.value =
      input.value.substring(0, startPos) +
      textToInsert +
      input.value.substring(endPos, input.value.length);
    input.selectionStart = startPos + textToInsert.length;
    input.selectionEnd = startPos + textToInsert.length;
    input.focus();
  }

  // --- Presets Handler ---
  sampleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.dataset.preset;
      const preset = sampleTexts[presetKey];
      if (!preset) return;

      textInput.value = preset.text;
      updateTextStats();

      if (preset.mode === "dialogue") {
        setSpeakerMode("dialogue");
        if (preset.speaker1Name) speaker1Name.value = preset.speaker1Name;
        if (preset.speaker1Voice) speaker1Voice.value = preset.speaker1Voice;
        if (preset.speaker2Name) speaker2Name.value = preset.speaker2Name;
        if (preset.speaker2Voice) speaker2Voice.value = preset.speaker2Voice;
      } else {
        setSpeakerMode("single");
        if (preset.voice) {
          voiceSelect.value = preset.voice;
          updateVoiceInfo();
        }
      }

      if (preset.module) {
        moduleSelect.value = preset.module;
        moduleDescription.textContent = moduleDescriptions[preset.module] || "";
      }
      if (preset.style) {
        styleSelect.value = preset.style;
      }

      showToast(`Loaded ${btn.textContent.trim()} sample`, "success");
    });
  });

  // --- Audio Generation Request ---
  btnGenerate.addEventListener("click", generateSpeech);

  async function generateSpeech() {
    const text = textInput.value.trim();

    if (!text) {
      showToast("Please enter or paste some text first.", "error");
      textInput.focus();
      return;
    }

    if (text.length > 10000) {
      showToast("Text exceeds 10,000 characters limit.", "error");
      return;
    }

    // Set Loading State
    setGeneratingState(true);
    statusMessage.textContent = "Synthesizing voice with Google Gemini TTS...";

    // Pause any currently playing audio
    audioElement.pause();

    const payload = {
      text: text,
      voice: voiceSelect.value,
      module: moduleSelect.value,
      style: styleSelect.value,
      speed: parseFloat(speedSlider.value),
      pitch: parseFloat(pitchSlider.value),
      customInstruction: customDirection.value.trim(),
      dialogueMode: isDialogueMode,
      speaker1: {
        name: speaker1Name.value.trim() || "Alex",
        voice: speaker1Voice.value
      },
      speaker2: {
        name: speaker2Name.value.trim() || "Sarah",
        voice: speaker2Voice.value
      }
    };

    try {
      const geminiKey = window.ApiKeyManager ? window.ApiKeyManager.getGeminiKey() : "";
      const headers = {
        "Content-Type": "application/json"
      };
      if (geminiKey) {
        headers["X-Gemini-Api-Key"] = geminiKey;
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error || "Voice generation failed. Please try again.";
        if (response.status === 401 || errorMsg.toLowerCase().includes("key")) {
          if (window.ApiKeyManager) window.ApiKeyManager.openSettings("gemini");
        }
        throw new Error(errorMsg);
      }

      // Convert Base64 audio to Blobs (both MP3 and WAV supported)
      if (data.mp3Audio) {
        if (currentMp3Url) URL.revokeObjectURL(currentMp3Url);
        currentMp3Blob = base64ToBlob(data.mp3Audio, "audio/mp3");
        currentMp3Url = URL.createObjectURL(currentMp3Blob);
      }

      if (data.wavAudio || data.audio) {
        if (currentWavUrl) URL.revokeObjectURL(currentWavUrl);
        const wavBase64 = data.wavAudio || data.audio;
        currentWavBlob = base64ToBlob(wavBase64, "audio/wav");
        currentWavUrl = URL.createObjectURL(currentWavBlob);
      }

      // Choose active audio URL based on user's default format preference
      const preferredFormat = formatSelect ? formatSelect.value : "mp3";
      currentAudioUrl = (preferredFormat === "wav" && currentWavUrl) ? currentWavUrl : (currentMp3Url || currentWavUrl);
      currentAudioBlob = (preferredFormat === "wav" && currentWavBlob) ? currentWavBlob : (currentMp3Blob || currentWavBlob);

      // Load into audio element
      audioElement.src = currentAudioUrl;
      audioElement.playbackRate = parseFloat(playbackRateSelect.value) || 1.0;

      // Enable Player Controls
      enablePlayerControls(true);

      statusMessage.textContent = "Speech generated successfully! Ready to play & download (.mp3 / .wav).";
      showToast("Audio generated successfully!", "success");

      // Auto play generated speech if allowed by browser
      audioElement.play().then(() => {
        statusMessage.textContent = "Playing speech...";
      }).catch((playErr) => {
        console.log("Auto-play prevented by browser policy:", playErr);
        statusMessage.textContent = "Speech ready! Click Play ▶ below to listen.";
      });
    } catch (err) {
      console.error("[Generation Failure]", err);
      statusMessage.textContent = "Voice generation failed. Please try again.";
      showToast(err.message || "Voice generation failed. Please try again.", "error");
    } finally {
      setGeneratingState(false);
    }
  }

  // Audio error fallback
  audioElement.addEventListener("error", () => {
    console.warn("Audio element error, falling back to WAV if available");
    if (currentWavUrl && audioElement.src !== currentWavUrl) {
      audioElement.src = currentWavUrl;
      audioElement.play().catch(() => {});
    }
  });

  function base64ToBlob(base64Data, mimeType) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  function setGeneratingState(generating) {
    isGenerating = generating;
    btnGenerate.disabled = generating;
    if (generating) {
      btnSpinner.style.display = "inline-block";
      btnGenIcon.style.display = "none";
      btnGenText.textContent = "Generating...";
    } else {
      btnSpinner.style.display = "none";
      btnGenIcon.style.display = "inline-block";
      btnGenText.textContent = currentAudioUrl ? "Regenerate Voice" : "Generate Voice";
    }
  }

  function enablePlayerControls(enabled) {
    btnPlayPause.disabled = !enabled;
    btnStop.disabled = !enabled;
    seekSlider.disabled = !enabled;
    btnMute.disabled = !enabled;
    volumeSlider.disabled = !enabled;
    playbackRateSelect.disabled = !enabled;
    if (btnDownloadMp3) btnDownloadMp3.disabled = !enabled || !currentMp3Blob;
    if (btnDownloadWav) btnDownloadWav.disabled = !enabled || !currentWavBlob;
  }

  // --- Custom Audio Player Event Handlers ---
  btnPlayPause.addEventListener("click", () => {
    if (!audioElement.src) return;
    if (audioElement.paused || audioElement.ended) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  });

  btnStop.addEventListener("click", () => {
    if (!audioElement.src) return;
    audioElement.pause();
    audioElement.currentTime = 0;
    updateTimelineDisplay();
  });

  audioElement.addEventListener("play", () => {
    iconPlay.style.display = "none";
    iconPause.style.display = "inline-block";
    visualizerBars.classList.add("active");
  });

  audioElement.addEventListener("pause", () => {
    iconPlay.style.display = "inline-block";
    iconPause.style.display = "none";
    visualizerBars.classList.remove("active");
  });

  audioElement.addEventListener("ended", () => {
    iconPlay.style.display = "inline-block";
    iconPause.style.display = "none";
    visualizerBars.classList.remove("active");
    scrubberProgress.style.width = "0%";
    seekSlider.value = 0;
    currentTime.textContent = "00:00";
  });

  audioElement.addEventListener("timeupdate", () => {
    if (!isDraggingScrubber) {
      updateTimelineDisplay();
    }
  });

  audioElement.addEventListener("loadedmetadata", () => {
    totalDuration.textContent = formatTime(audioElement.duration || 0);
  });

  function updateTimelineDisplay() {
    const cur = audioElement.currentTime || 0;
    const dur = audioElement.duration || 0;
    currentTime.textContent = formatTime(cur);

    if (dur > 0) {
      const percentage = (cur / dur) * 100;
      scrubberProgress.style.width = `${percentage}%`;
      seekSlider.value = percentage;
    } else {
      scrubberProgress.style.width = "0%";
      seekSlider.value = 0;
    }
  }

  // Scrubber / Seek Input
  seekSlider.addEventListener("input", () => {
    isDraggingScrubber = true;
    const percentage = seekSlider.value;
    scrubberProgress.style.width = `${percentage}%`;
    const dur = audioElement.duration || 0;
    currentTime.textContent = formatTime((percentage / 100) * dur);
  });

  seekSlider.addEventListener("change", () => {
    const percentage = seekSlider.value;
    const dur = audioElement.duration || 0;
    if (dur > 0) {
      audioElement.currentTime = (percentage / 100) * dur;
    }
    isDraggingScrubber = false;
  });

  // Volume & Mute Controls
  volumeSlider.addEventListener("input", () => {
    const vol = parseFloat(volumeSlider.value);
    audioElement.volume = vol;
    updateVolumeIcon(vol);
  });

  btnMute.addEventListener("click", () => {
    if (audioElement.volume > 0) {
      previousVolume = audioElement.volume;
      audioElement.volume = 0;
      volumeSlider.value = 0;
    } else {
      audioElement.volume = previousVolume || 1;
      volumeSlider.value = audioElement.volume;
    }
    updateVolumeIcon(audioElement.volume);
  });

  function updateVolumeIcon(vol) {
    if (vol === 0) {
      iconVolHigh.style.display = "none";
      iconVolMuted.style.display = "inline-block";
    } else {
      iconVolHigh.style.display = "inline-block";
      iconVolMuted.style.display = "none";
    }
  }

  // Playback Rate
  playbackRateSelect.addEventListener("change", () => {
    const rate = parseFloat(playbackRateSelect.value) || 1.0;
    audioElement.playbackRate = rate;
  });

  // Download Audio in MP3 Format
  if (btnDownloadMp3) {
    btnDownloadMp3.addEventListener("click", () => {
      const url = currentMp3Url || currentAudioUrl;
      if (!url) return;

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "gemini-tts-output.mp3";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast("Downloaded gemini-tts-output.mp3", "success");
    });
  }

  // Download Audio in WAV Format
  if (btnDownloadWav) {
    btnDownloadWav.addEventListener("click", () => {
      const url = currentWavUrl || currentAudioUrl;
      if (!url) return;

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "gemini-tts-output.wav";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast("Downloaded gemini-tts-output.wav", "success");
    });
  }

  // --- Helper Functions ---
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function showToast(message, type = "info") {
    toast.textContent = message;
    toast.className = `toast ${type === "error" ? "toast-error" : type === "success" ? "toast-success" : ""}`;
    toast.style.display = "block";

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = "none";
    }, 4000);
  }

  // --- Keyboard Shortcuts ---
  document.addEventListener("keydown", (e) => {
    // Ctrl+Enter or Cmd+Enter to generate voice
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isGenerating) {
        generateSpeech();
      }
    }
  });

  // --- Light & Dark Theme Manager with Crazy Ripple Transition ---
  const btnThemeToggle = document.getElementById("btnThemeToggle");
  const iconSun = document.getElementById("iconSun");
  const iconMoon = document.getElementById("iconMoon");
  const themeModeText = document.getElementById("themeModeText");
  const themeWaveOverlay = document.getElementById("themeWaveOverlay");

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("theme-light", isLight);
    document.body.classList.toggle("theme-dark", !isLight);
    
    if (iconSun && iconMoon) {
      iconSun.style.display = isLight ? "none" : "inline-block";
      iconMoon.style.display = isLight ? "inline-block" : "none";
    }
    if (themeModeText) {
      themeModeText.textContent = isLight ? "Dark" : "Light";
    }

    try {
      localStorage.setItem("gemini_studio_theme", theme);
    } catch (e) {}
  }

  // Detect stored theme or system preference (default to dark)
  const savedTheme = localStorage.getItem("gemini_studio_theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
  } else {
    applyTheme("dark");
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", (e) => {
      const currentIsLight = document.body.classList.contains("theme-light");
      const nextTheme = currentIsLight ? "dark" : "light";

      // Calculate origin coordinates for ripple wave
      const rect = btnThemeToggle.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);

      if (themeWaveOverlay) {
        themeWaveOverlay.style.setProperty("--wave-x", `${clickX}px`);
        themeWaveOverlay.style.setProperty("--wave-y", `${clickY}px`);
        themeWaveOverlay.classList.remove("animating");
        void themeWaveOverlay.offsetWidth; // Force CSS reflow
        themeWaveOverlay.classList.add("animating");
      }

      document.body.classList.add("theme-switching");

      // Use native View Transitions API if supported for cinematic root cross-fade
      if (typeof document.startViewTransition === "function") {
        document.startViewTransition(() => {
          applyTheme(nextTheme);
        });
      } else {
        applyTheme(nextTheme);
      }

      setTimeout(() => {
        document.body.classList.remove("theme-switching");
        if (themeWaveOverlay) {
          themeWaveOverlay.classList.remove("animating");
        }
      }, 750);

      showToast(`Switched to ${nextTheme === "dark" ? "Dark" : "Light"} mode`, "info");
    });
  }

  // --- Multi-Page Router & Magnetic Sliding Nav Pill ---
  const pageHome = document.getElementById("pageHome");
  const pageVoice = document.getElementById("pageVoice");
  const pageHumanizer = document.getElementById("pageHumanizer");

  const navLinksContainer = document.getElementById("navLinksContainer");
  const navSlidingPill = document.getElementById("navSlidingPill");

  const navHome = document.getElementById("navHome");
  const navVoice = document.getElementById("navVoice");
  const navHumanizer = document.getElementById("navHumanizer");

  // Mobile drawer links
  const mobNavHome = document.getElementById("mobNavHome");
  const mobNavVoice = document.getElementById("mobNavVoice");
  const mobNavHumanizer = document.getElementById("mobNavHumanizer");

  // Mobile Hamburger Toggle
  const btnHamburger = document.getElementById("btnHamburger");
  const mobileMenuDrawer = document.getElementById("mobileMenuDrawer");

  function toggleMobileMenu(force) {
    if (!btnHamburger || !mobileMenuDrawer) return;
    const isOpen = force !== undefined ? force : !mobileMenuDrawer.classList.contains("open");
    btnHamburger.classList.toggle("active", isOpen);
    btnHamburger.setAttribute("aria-expanded", String(isOpen));
    mobileMenuDrawer.classList.toggle("open", isOpen);
    mobileMenuDrawer.setAttribute("aria-hidden", String(!isOpen));
  }

  if (btnHamburger) {
    btnHamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close mobile drawer on outside click
  document.addEventListener("click", (e) => {
    if (mobileMenuDrawer && mobileMenuDrawer.classList.contains("open")) {
      if (!mobileMenuDrawer.contains(e.target) && !btnHamburger.contains(e.target)) {
        toggleMobileMenu(false);
      }
    }
  });

  // Close mobile drawer on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenuDrawer && mobileMenuDrawer.classList.contains("open")) {
      toggleMobileMenu(false);
    }
  });

  let currentPage = "home";

  function updateNavSlidingPill(activeBtn) {
    if (!navLinksContainer || !navSlidingPill || !activeBtn) return;
    const containerRect = navLinksContainer.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const left = btnRect.left - containerRect.left;
    const width = btnRect.width;

    navSlidingPill.style.transform = `translateX(${left}px)`;
    navSlidingPill.style.width = `${width}px`;
    navSlidingPill.style.opacity = "1";
  }

  function navigateTo(route, updateHash = true) {
    const validRoutes = ["home", "voice", "humanizer"];
    const target = validRoutes.includes(route) ? route : "home";
    currentPage = target;

    // Toggle pages
    if (pageHome) pageHome.style.display = target === "home" ? "flex" : "none";
    if (pageVoice) pageVoice.style.display = target === "voice" ? "flex" : "none";
    if (pageHumanizer) pageHumanizer.style.display = target === "humanizer" ? "flex" : "none";

    // Toggle navigation link active states (Desktop)
    if (navHome) navHome.classList.toggle("active", target === "home");
    if (navVoice) navVoice.classList.toggle("active", target === "voice");
    if (navHumanizer) navHumanizer.classList.toggle("active", target === "humanizer");

    // Toggle navigation link active states (Mobile Drawer)
    if (mobNavHome) mobNavHome.classList.toggle("active", target === "home");
    if (mobNavVoice) mobNavVoice.classList.toggle("active", target === "voice");
    if (mobNavHumanizer) mobNavHumanizer.classList.toggle("active", target === "humanizer");

    // Auto-close mobile drawer when a link is clicked
    toggleMobileMenu(false);

    // Smoothly slide magnetic pill
    const activeBtn = target === "voice" ? navVoice : target === "humanizer" ? navHumanizer : navHome;
    if (activeBtn) {
      // Small timeout allows layout compute if hidden
      requestAnimationFrame(() => updateNavSlidingPill(activeBtn));
    }

    // Dynamic document title
    if (target === "voice") {
      document.title = "Voice Studio — OVI Hub";
    } else if (target === "humanizer") {
      document.title = "Text Humanizer — OVI Hub";
    } else {
      document.title = "OVI Hub — Multi-service suite";
    }

    if (updateHash) {
      if (target === "home") {
        history.pushState(null, "", " ");
      } else {
        window.location.hash = target;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Window resize repositions sliding pill
  window.addEventListener("resize", () => {
    const activeBtn = currentPage === "voice" ? navVoice : currentPage === "humanizer" ? navHumanizer : navHome;
    if (activeBtn) updateNavSlidingPill(activeBtn);
  });

  // Bind all clickable elements with data-route
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const route = el.dataset.route || "home";
      navigateTo(route);
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    navigateTo(hash, false);
  });

    // --- Check for Transferred Text from Text Humanizer or Hub ---
  try {
    const transferred = localStorage.getItem("OVI_TRANSFER_TEXT");
    if (transferred && textInput) {
      textInput.value = transferred;
      localStorage.removeItem("OVI_TRANSFER_TEXT");
      updateTextStats();
      showToast("Loaded text transferred from Text Humanizer!", "success");
    }
  } catch (e) {}

  updateTextStats();
  updateVoiceInfo();
  loadVoices();
});

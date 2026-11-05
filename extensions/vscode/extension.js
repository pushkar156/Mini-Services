// OVI Prompt Enhancer — VS Code & Antigravity Extension
const vscode = require("vscode");

function activate(context) {
  // Command 1: Interactive Archetype Selector
  const disposableMain = vscode.commands.registerCommand("ovi.enhancePrompt", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("OVI: Open a file or focus an editor to enhance a prompt.");
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection).trim();

    if (!selectedText) {
      vscode.window.showInformationMessage("OVI: Please highlight or select a prompt to fortify.");
      return;
    }

    const config = vscode.workspace.getConfiguration("ovi.promptEnhancer");
    const defaultStyle = config.get("defaultStyle") || "coding";

    // QuickPick for Archetype
    const items = [
      {
        label: "$(code) Coding & Technical Specs",
        description: "Edge cases, type safety, error boundaries & clean code constraints",
        style: "coding",
      },
      {
        label: "$(hubot) Autonomous Agent Protocol",
        description: "Tool calling guidance, 4-step execution flow & stopping criteria",
        style: "agentic",
      },
      {
        label: "$(symbol-structure) Chain-of-Thought (Reasoning)",
        description: "Multi-stage cognitive scratchpad, step validation & counter-checks",
        style: "reasoning",
      },
      {
        label: "$(zap) Concise & Dense",
        description: "Zero token waste, high information density & direct imperatives",
        style: "concise",
      },
      {
        label: "$(paintcan) Creative Nuance",
        description: "Atmospheric worldbuilding, tonal voice & narrative richness",
        style: "creative",
      },
    ];

    const chosen = await vscode.window.showQuickPick(items, {
      placeHolder: "Select prompt enhancement archetype",
      title: "OVI // Prompt Engineering Atelier",
    });

    if (!chosen) return;

    await executeEnhancement(editor, selection, selectedText, chosen.style, config);
  });

  // Direct Shortcut Commands for Specific Styles
  const registerStyleCommand = (cmdId, style) => {
    return vscode.commands.registerCommand(cmdId, async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.selection;
      const text = editor.document.getText(selection).trim();
      if (!text) {
        vscode.window.showInformationMessage("OVI: Select a prompt to enhance.");
        return;
      }
      const config = vscode.workspace.getConfiguration("ovi.promptEnhancer");
      await executeEnhancement(editor, selection, text, style, config);
    });
  };

  const disposableCode = registerStyleCommand("ovi.enhancePromptCode", "coding");
  const disposableAgent = registerStyleCommand("ovi.enhancePromptAgent", "agentic");
  const disposableCoT = registerStyleCommand("ovi.enhancePromptCoT", "reasoning");
  const disposableConcise = registerStyleCommand("ovi.enhancePromptConcise", "concise");

  // Settings Configuration Helper
  const disposableSettings = vscode.commands.registerCommand("ovi.configureSettings", async () => {
    await vscode.commands.executeCommand("workbench.action.openSettings", "ovi.promptEnhancer");
  });

  context.subscriptions.push(
    disposableMain,
    disposableCode,
    disposableAgent,
    disposableCoT,
    disposableConcise,
    disposableSettings
  );
}

async function executeEnhancement(editor, selection, originalText, style, config) {
  const apiUrl = config.get("apiUrl") || "http://localhost:3000/api/enhance";
  const apiKey = config.get("apiKey") || "";
  const targetModel = config.get("targetModel") || "claude";
  const actionOnEnhance = config.get("actionOnEnhance") || "replace";

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `OVI: Fortifying prompt (${style})...`,
      cancellable: false,
    },
    async (progress) => {
      try {
        const headers = {
          "Content-Type": "application/json",
        };
        if (apiKey && apiKey.trim()) {
          headers["x-gemini-api-key"] = apiKey.trim();
        }

        const res = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            prompt: originalText,
            style,
            targetModel,
            outputFormat: targetModel === "claude" ? "xml" : "markdown",
            includeNegative: true,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const enhanced = data.enhancedPrompt;
        const expansion = data.metrics?.expansionRatio || "+100%";

        if (actionOnEnhance === "replace") {
          await editor.edit((editBuilder) => {
            editBuilder.replace(selection, enhanced);
          });
          vscode.window.showInformationMessage(
            `OVI: Prompt Fortified (${expansion} density) for ${targetModel.toUpperCase()}`
          );
        } else if (actionOnEnhance === "insertBelow") {
          await editor.edit((editBuilder) => {
            editBuilder.insert(selection.end, "\n\n" + enhanced);
          });
          vscode.window.showInformationMessage(`OVI: Fortified prompt inserted below.`);
        } else if (actionOnEnhance === "diffView") {
          const docOriginal = await vscode.workspace.openTextDocument({
            content: originalText,
            language: "markdown",
          });
          const docEnhanced = await vscode.workspace.openTextDocument({
            content: enhanced,
            language: "markdown",
          });
          await vscode.commands.executeCommand(
            "vscode.diff",
            docOriginal.uri,
            docEnhanced.uri,
            `Original Draft ↔ OVI Fortified Prompt (${data.title || "Enhanced"})`
          );
        } else if (actionOnEnhance === "clipboard") {
          await vscode.env.clipboard.writeText(enhanced);
          vscode.window.showInformationMessage("OVI: Enhanced prompt copied to clipboard!");
        }
      } catch (err) {
        vscode.window.showErrorMessage(
          `OVI Prompt Enhancer Error: ${err.message}. (Ensure Next.js is running at ${apiUrl} or update Settings)`
        );
      }
    }
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};


"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var docFileName = "codeDocs.json";
function getDocFilePath() {
  const workspace2 = vscode.workspace.workspaceFolders?.[0];
  return workspace2 ? path.join(workspace2.uri.fsPath, docFileName) : "";
}
function loadDocs() {
  const filePath = getDocFilePath();
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  }
  return {};
}
function saveDocs(docs) {
  const filePath = getDocFilePath();
  fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
}
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-doc-helper.viewAllDocumentation",
      () => {
        const docs = loadDocs();
        if (Object.keys(docs).length === 0) {
          vscode.window.showInformationMessage("No documentation available.");
          return;
        }
        const panel = vscode.window.createWebviewPanel(
          "viewAllDocs",
          "All Code Documentation",
          vscode.ViewColumn.One,
          {
            enableScripts: true
          }
        );
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>All Documentation</title>
          <link rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
          <script>hljs.highlightAll();</script>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 2rem;
              background: #1e1e1e;
              color: #d4d4d4;
            }
            h1 {
              color: #569cd6;
            }
            .entry {
              background: #252526;
              padding: 1.5rem;
              margin-bottom: 2rem;
              border-left: 5px solid #007acc;
              border-radius: 6px;
            }
            pre {
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              font-family: Consolas, monospace;
              font-size: 14px;
            }
            .filename {
              font-weight: bold;
              color: #9cdcfe;
            }
            .line-number {
              font-style: italic;
              color: #ce9178;
            }
            strong {
              color: #c586c0;
            }
          </style>
        </head>
        <body>
          <h1>All Documented Code Snippets</h1>
        `;
        for (const [filePath, entries] of Object.entries(docs)) {
          for (const entry of entries) {
            html += `
          <div class="entry">
            <div class="filename">File: <code>${filePath}</code></div>
            <div class="line-number">Start Line: ${entry.startLine + 1}</div>
            <strong>Code:</strong>
            <pre><code class="language-javascript">${entry.code}</code></pre>
            <strong>Documentation:</strong>
            <pre>${entry.doc}</pre>
          </div>
        `;
          }
        }
        html += `</body></html>`;
        panel.webview.html = html;
      }
    ),
    vscode.commands.registerCommand(
      "code-doc-helper.addDocumentation",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText.trim()) {
          vscode.window.showWarningMessage(
            "Please select some code to document."
          );
          return;
        }
        const startLine = editor.selection.start.line;
        const filePath = editor.document.uri.fsPath;
        const docs = loadDocs();
        const entries = docs[filePath] || [];
        const existing = entries.find(
          (entry) => entry.code.trim() === selectedText.trim()
        );
        const panel = vscode.window.createWebviewPanel(
          "addDocPanel",
          existing ? "Edit Documentation" : "Add Documentation",
          vscode.ViewColumn.Beside,
          {
            enableScripts: true,
            retainContextWhenHidden: true
          }
        );
        panel.webview.html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Documentation Input</title>
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1e1e1e;
      color: #d4d4d4;
      margin: 2rem;
    }
    textarea {
      width: 100%;
      height: 200px;
      margin-top: 10px;
      padding: 10px;
      font-family: Consolas, monospace;
      font-size: 14px;
      background-color: #252526;
      color: #d4d4d4;
      border: 1px solid #333;
      border-radius: 4px;
    }
    pre {
      background: #2d2d2d;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      font-family: Consolas, monospace;
      font-size: 14px;
    }
    button {
      margin-top: 10px;
      padding: 0.5rem 1.2rem;
      background-color: #007acc;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }
    button:hover {
      background-color: #005f9e;
    }
  </style>
</head>
<body>
  <h2>Selected Code:</h2>
  <pre><code class="language-javascript">${selectedText}</code></pre>
  <h2>${existing ? "Edit" : "Add"} Documentation:</h2>
  <textarea id="docInput">${existing?.doc || ""}</textarea>
  <br>
  <button onclick="saveDoc()">Save</button>

  <script>
    const vscode = acquireVsCodeApi();
    function saveDoc() {
      const input = document.getElementById('docInput').value;
      vscode.postMessage({ type: 'save', doc: input });
    }
  </script>
</body>
</html>
`;
        panel.webview.onDidReceiveMessage(
          (message) => {
            if (message.type === "save") {
              const docText = message.doc;
              if (existing) {
                existing.doc = docText;
              } else {
                entries.push({ code: selectedText, doc: docText, startLine });
              }
              docs[filePath] = entries;
              saveDocs(docs);
              vscode.window.showInformationMessage("Documentation saved.");
              panel.dispose();
            }
          },
          void 0,
          context.subscriptions
        );
      }
    ),
    vscode.commands.registerCommand(
      "code-doc-helper.viewDocumentation",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const selectedText = editor.document.getText(editor.selection);
        const filePath = editor.document.uri.fsPath;
        const docs = loadDocs();
        const entries = docs[filePath] || [];
        const matchIndex = entries.findIndex(
          (entry) => entry.code.trim() === selectedText.trim()
        );
        const match = entries[matchIndex];
        if (match) {
          const choice = await vscode.window.showQuickPick(
            ["View", "Edit", "Delete"],
            {
              placeHolder: "Documentation found. Choose an action:"
            }
          );
          if (choice === "View") {
            const panel = vscode.window.createWebviewPanel(
              "viewDocPanel",
              "View Documentation",
              vscode.ViewColumn.Beside,
              {
                enableScripts: true
              }
            );
            panel.webview.html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>View Documentation</title>
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    hljs.highlightAll();
  });
</script>

  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 2rem;
    }
    pre {
      background: #2d2d2d;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      font-family: Consolas, monospace;
      font-size: 14px;
    }
    h2 {
      color: #569cd6;
    }
  </style>
</head>
<body>
  <h2>Selected Code:</h2>
  <pre><code class="language-javascript">${match.code}</code></pre>
  <h2>Documentation:</h2>
  <pre>${match.doc}</pre>
</body>
</html>`;
          } else if (choice === "Edit") {
            vscode.commands.executeCommand("code-doc-helper.addDocumentation");
          } else if (choice === "Delete") {
            entries.splice(matchIndex, 1);
            docs[filePath] = entries;
            saveDocs(docs);
            vscode.window.showInformationMessage("Documentation deleted.");
          }
        } else {
          vscode.window.showInformationMessage(
            "No documentation found for selected code."
          );
        }
      }
    )
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map

"use strict";var y=Object.create;var m=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,C=Object.prototype.hasOwnProperty;var k=(o,e)=>{for(var n in e)m(o,n,{get:e[n],enumerable:!0})},g=(o,e,n,c)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of D(e))!C.call(o,s)&&s!==n&&m(o,s,{get:()=>e[s],enumerable:!(c=x(e,s))||c.enumerable});return o};var p=(o,e,n)=>(n=o!=null?y(j(o)):{},g(e||!o||!o.__esModule?m(n,"default",{value:o,enumerable:!0}):n,o)),P=o=>g(m({},"__esModule",{value:!0}),o);var A={};k(A,{activate:()=>T,deactivate:()=>E});module.exports=P(A);var t=p(require("vscode")),h=p(require("fs")),b=p(require("path")),S="codeDocs.json";function w(){let o=t.workspace.workspaceFolders?.[0];return o?b.join(o.uri.fsPath,S):""}function u(){let o=w();if(h.existsSync(o)){let e=h.readFileSync(o,"utf8");return JSON.parse(e)}return{}}function v(o){let e=w();h.writeFileSync(e,JSON.stringify(o,null,2))}function T(o){o.subscriptions.push(t.commands.registerCommand("code-doc-helper.viewAllDocumentation",()=>{let e=u();if(Object.keys(e).length===0){t.window.showInformationMessage("No documentation available.");return}let n=t.window.createWebviewPanel("viewAllDocs","All Code Documentation",t.ViewColumn.One,{enableScripts:!0}),c=`
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
        `;for(let[s,i]of Object.entries(e))for(let d of i)c+=`
          <div class="entry">
            <div class="filename">File: <code>${s}</code></div>
            <div class="line-number">Start Line: ${d.startLine+1}</div>
            <strong>Code:</strong>
            <pre><code class="language-javascript">${d.code}</code></pre>
            <strong>Documentation:</strong>
            <pre>${d.doc}</pre>
          </div>
        `;c+="</body></html>",n.webview.html=c}),t.commands.registerCommand("code-doc-helper.addDocumentation",async()=>{let e=t.window.activeTextEditor;if(!e)return;let n=e.document.getText(e.selection);if(!n.trim()){t.window.showWarningMessage("Please select some code to document.");return}let c=e.selection.start.line,s=e.document.uri.fsPath,i=u(),d=i[s]||[],a=d.find(l=>l.code.trim()===n.trim()),r=t.window.createWebviewPanel("addDocPanel",a?"Edit Documentation":"Add Documentation",t.ViewColumn.Beside,{enableScripts:!0,retainContextWhenHidden:!0});r.webview.html=`
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
  <pre><code class="language-javascript">${n}</code></pre>
  <h2>${a?"Edit":"Add"} Documentation:</h2>
  <textarea id="docInput">${a?.doc||""}</textarea>
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
`,r.webview.onDidReceiveMessage(l=>{if(l.type==="save"){let f=l.doc;a?a.doc=f:d.push({code:n,doc:f,startLine:c}),i[s]=d,v(i),t.window.showInformationMessage("Documentation saved."),r.dispose()}},void 0,o.subscriptions)}),t.commands.registerCommand("code-doc-helper.viewDocumentation",async()=>{let e=t.window.activeTextEditor;if(!e)return;let n=e.document.getText(e.selection),c=e.document.uri.fsPath,s=u(),i=s[c]||[],d=i.findIndex(r=>r.code.trim()===n.trim()),a=i[d];if(a){let r=await t.window.showQuickPick(["View","Edit","Delete"],{placeHolder:"Documentation found. Choose an action:"});if(r==="View"){let l=t.window.createWebviewPanel("viewDocPanel","View Documentation",t.ViewColumn.Beside,{enableScripts:!0});l.webview.html=`
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
  <pre><code class="language-javascript">${a.code}</code></pre>
  <h2>Documentation:</h2>
  <pre>${a.doc}</pre>
</body>
</html>`}else r==="Edit"?t.commands.executeCommand("code-doc-helper.addDocumentation"):r==="Delete"&&(i.splice(d,1),s[c]=i,v(s),t.window.showInformationMessage("Documentation deleted."))}else t.window.showInformationMessage("No documentation found for selected code.")}))}function E(){}0&&(module.exports={activate,deactivate});

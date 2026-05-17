# 🌐 ncexs.github.io [![License](https://img.shields.io/github/license/ncexs/ncexs.github.io?color=f43f5e)](https://github.com/ncexs/ncexs.github.io/blob/main/LICENSE) [![GitHub Stars](https://img.shields.io/github/stars/ncexs/ncexs.github.io?color=10b981)](https://github.com/ncexs/ncexs.github.io/stargazers)

Official landing page for **ncexs Toolkit** and other projects.
<br>
**Live Site:** [https://ncexs.github.io](https://ncexs.github.io)

---

### 🚀 About
This repository hosts the static landing page for my software projects. It is designed to be lightweight, fast, and low-maintenance. The website automatically fetches and displays real-time data from other repositories using the GitHub API and GitHub Actions.

### ✨ Features
* **🔄 Auto-Update Menu:** Uses GitHub Actions to automatically sync the interactive menu translations directly from the PowerShell source code.
* **📜 Changelog Sync:** Fetches the `CHANGELOG.md` file dynamically to display the version history.
* **📱 Responsive Design:** Optimized for Desktop and Mobile with a modern glassmorphism interface.
* **🛣️ Smart SPA Routing:** Implements History API for clean, shareable URLs without needing a backend server.
* **⚡ Pure Performance:** Built with Vanilla HTML, CSS, and JavaScript. No heavy frameworks.

### 🛠️ How It Works
1.  **Visitor opens the site.**
2.  **JavaScript triggers:** The script calls the GitHub API to fetch the raw `CHANGELOG.md` file dynamically from the respective repositories (`ncexs-toolkit`, `ncexs-AutoTask`, and `ncexs-junkcleaner`).
3.  **Rendering:** The markdown content is dynamically parsed and injected into the HTML interface depending on which project the user selects.

### 📦 Projects Included
*   [ncexs-toolkit](https://github.com/ncexs/ncexs-toolkit) — All-in-One PowerShell console suite.
*   [ncexs-AutoTask](https://github.com/ncexs/ncexs-AutoTask) — Silent background scheduled Windows maintenance script.
*   [ncexs-junkcleaner](https://github.com/ncexs/ncexs-junkcleaner) — Classic one-click batch script.

---
&copy; 2025 - 2026 ncexs. All rights reserved.

# ncexs.github.io

Official landing page for **ncexs Toolkit** and other projects.
<br>
**Live Site:** [https://ncexs.github.io](https://ncexs.github.io)

---

### 🚀 About
This repository hosts the static landing page for my software projects. It is designed to be lightweight, fast, and low-maintenance. The website automatically fetches the latest release data from my other repositories using the GitHub API.

### ✨ Features
* **Auto-Update:** No manual HTML editing required. The site fetches the latest version, download links, and changelogs directly from the `ncexs-toolkit` and `ncexs-junkcleaner` repositories.
* **Markdown Support:** Automatically converts GitHub Release descriptions (Markdown) into clean HTML.
* **Test Build Detection:** Automatically checks for experimental builds in the repository and displays a warning banner if found.
* **Responsive Design:** Optimized for Desktop and Mobile.
* **Pure Performance:** Built with Vanilla HTML, CSS, and JavaScript. No heavy frameworks.

### 🛠️ How It Works
1.  **Visitor opens the site.**
2.  **JavaScript triggers:** The script calls the GitHub REST API.
3.  **Data Fetching:** It retrieves the latest "Releases" and "Test Build" folder contents.
4.  **Rendering:** The content is dynamically injected into the HTML cards.

### 📦 Projects Included
* [ncexs-toolkit](https://github.com/ncexs/ncexs-toolkit)
* [ncexs-junkcleaner](https://github.com/ncexs/ncexs-junkcleaner)

---
&copy; 2025 ncexs. All rights reserved.
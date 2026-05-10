function updateRealTimeClock() {
      const now = new Date();
      const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      document.getElementById('time').textContent = now.toLocaleTimeString('en-US', timeOptions);

      const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      document.getElementById('date').textContent = now.toLocaleDateString('en-GB', dateOptions);
    }

    setInterval(updateRealTimeClock, 1000);
    updateRealTimeClock();

    function parseMarkdown(text) {
      if (!text) return "<em>No description available.</em>";

      let html = text.replace(/\r\n/g, '\n').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
      html = html.replace(/^---$/gim, '<hr>');

      let lines = html.split('\n');
      let newLines = [];
      let inList = false;

      lines.forEach(line => {
        if (/^\s*[-*]\s+(.*)/.test(line)) {
          if (!inList) {
            newLines.push('<ul>');
            inList = true;
          }
          newLines.push(`<li>${line.replace(/^\s*[-*]\s+/, '')}</li>`);
        } else {
          if (inList) {
            newLines.push('</ul>');
            inList = false;
          }
          if (line.match(/^<h/) || line.match(/^<hr/)) newLines.push(line);
          else if (line.trim() !== '') newLines.push(`<p>${line}</p>`);
        }
      });
      if (inList) newLines.push('</ul>');
      return newLines.join('');
    }

    function showTab(id, el) {
      document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
      document.getElementById(id).classList.remove('hidden');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      if (el) el.classList.add('active');
    }

    let allReleases = [];
    let currentPage = 1;
    const itemsPerPage = 3;

    function renderPagination() {
      const totalPages = Math.ceil(allReleases.length / itemsPerPage);
      if (totalPages <= 1) return '';

      let paginationHtml = '<div class="pagination">';

      const prevDisabled = currentPage === 1 ? 'disabled style="opacity:0.5;pointer-events:none;"' : '';
      paginationHtml += `<button class="btn btn-secondary" onclick="changePage(${currentPage - 1})" ${prevDisabled}><i class="fas fa-chevron-left"></i> Prev</button>`;

      paginationHtml += `<span class="page-info">Page ${currentPage} of ${totalPages}</span>`;

      const nextDisabled = currentPage === totalPages ? 'disabled style="opacity:0.5;pointer-events:none;"' : '';
      paginationHtml += `<button class="btn btn-secondary" onclick="changePage(${currentPage + 1})" ${nextDisabled}>Next <i class="fas fa-chevron-right"></i></button>`;

      paginationHtml += '</div>';
      return paginationHtml;
    }

    window.changePage = function (page) {
      const totalPages = Math.ceil(allReleases.length / itemsPerPage);
      if (page < 1 || page > totalPages) return;
      currentPage = page;
      displayCurrentPage();
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    }

    const renderReleaseCard = (release, type) => {
      const body = parseMarkdown(release.body);
      let dlUrl = release.html_url;
      if (release.assets && release.assets.length > 0) dlUrl = release.assets[0].browser_download_url;

      return `
        <div class="card">
          <h3>${release.name || release.tag_name}</h3>
          
          <div class="changelog-box">
            <div class="changelog-content">${body}</div>
          </div>

          <div class="btn-group">
            <a href="${dlUrl}" class="btn btn-primary"><i class="fas fa-download"></i> Download</a>
            <a href="${release.html_url}" target="_blank" class="btn btn-secondary"><i class="fab fa-github"></i> View on GitHub</a>
          </div>
        </div>
      `;
    };

    function displayCurrentPage() {
      const container = document.getElementById('project-list');
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const currentItems = allReleases.slice(start, end);

      let htmlContent = '';
      currentItems.forEach(item => {
        htmlContent += renderReleaseCard(item.release, item.type);
      });

      htmlContent += renderPagination();
      container.innerHTML = htmlContent;
    }

    async function fetchWithCache(url, cacheKey) {
      const durationMs = 1800000; // Cache for 30 minutes
      const cached = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheKey + '_time');

      if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < durationMs) {
        return JSON.parse(cached);
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.message || Array.isArray(data)) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheKey + '_time', Date.now().toString());
      }
      return data;
    }

    async function loadProjects() {
      const container = document.getElementById('project-list');
      const testBuildArea = document.getElementById('test-build-area');

      try {
        const dataTest = await fetchWithCache('https://api.github.com/repos/ncexs/ncexs-toolkit/contents/Test%20Build', 'gh_test_builds');

        if (Array.isArray(dataTest) && dataTest.length > 0) {
          let testHtml = '';
          dataTest.forEach(file => {
            if (file.name.toLowerCase() === 'readme.md') return;

            testHtml += `
          <div class="card test-build">
              <h3><i class="fas fa-flask"></i> Experimental Build: ${file.name}</h3>
              <p><b>⚠️ Experimental Build:</b> This version is for testing purposes only. It may contain bugs or unfinished features. Use at your own risk.</p>
              <div class="btn-group">
                <a href="${file.download_url}" class="btn btn-beta"><i class="fas fa-download"></i> Download Test Build</a>
                <a href="https://github.com/ncexs/ncexs-toolkit/tree/main/Test%20Build" target="_blank" class="btn btn-secondary"><i class="fab fa-github"></i> View Source</a>
              </div>
          </div>
        `;
          });
          testBuildArea.innerHTML = testHtml;
        }

        const [dataTk, dataJc] = await Promise.all([
          fetchWithCache('https://api.github.com/repos/ncexs/ncexs-toolkit/releases', 'gh_tk_releases'),
          fetchWithCache('https://api.github.com/repos/ncexs/ncexs-junkcleaner/releases', 'gh_jc_releases')
        ]);

        if (dataTk.message && !Array.isArray(dataTk)) throw new Error("API Rate Limit Exceeded. " + dataTk.message);
        if (dataJc.message && !Array.isArray(dataJc)) console.warn("JunkCleaner API: " + dataJc.message);

        allReleases = [];
        if (Array.isArray(dataTk)) dataTk.forEach(r => allReleases.push({ release: r, type: 'tk' }));
        if (Array.isArray(dataJc)) dataJc.forEach(r => allReleases.push({ release: r, type: 'jc' }));

        if (allReleases.length === 0) {
           throw new Error("No releases found or API limit reached.");
        }

        allReleases.sort((a, b) => new Date(b.release.published_at) - new Date(a.release.published_at));

        currentPage = 1;
        displayCurrentPage();

      } catch (e) {
        container.innerHTML = `
          <div style="text-align:center; padding: 2rem; background: rgba(255,0,0,0.1); border-radius: 12px; border: 1px solid rgba(255,0,0,0.2);">
            <i class="fas fa-exclamation-triangle fa-2x" style="color: #ef4444; margin-bottom: 15px;"></i>
            <h3 style="margin-top: 0; color: #ef4444;">Oops! Failed to load downloads.</h3>
            <p style="color: var(--text-muted);">${e.message}</p>
            <p style="margin-top: 15px;">This usually happens if you refresh the page too many times (GitHub limits requests to 60 per hour). Please try again later, or visit the releases page directly:</p>
            <div class="btn-group" style="justify-content: center;">
              <a href="https://github.com/ncexs/ncexs-toolkit/releases" target="_blank" class="btn btn-primary"><i class="fab fa-github"></i> Download from GitHub</a>
            </div>
          </div>
        `;
      }
    }

    const translations = {
      en: {
        "txt-lang-label": "Language:",
        "txt-how-title": "How to Use - ncexs Toolkit",
        "txt-m1-title": "Method 1: The Easy Way (Right-Click)",
        "txt-m1-1": "Download the <b>ncexs-Toolkit.ps1</b> file.",
        "txt-m1-2": "<b>Right-click</b> the file.",
        "txt-m1-3": "Select <b>Run with PowerShell</b>.",
        "txt-m1-4": "If a \"Security Warning\" appears, simply type <b>R</b> and press <b>Enter</b>.",
        "txt-m1-5": "The toolkit will launch automatically.",
        "txt-m2-title": "Method 2: Manual (Command Line)",
        "txt-m2-1": "Open Start Menu, type <b>powershell</b>, and press <b>Enter</b>.",
        "txt-m2-2": "Copy and paste the command below into the window, then press <b>Enter</b>:",
        "txt-m2-3": "<b>Drag and drop</b> the .ps1 file directly into the PowerShell window.",
        "txt-m2-4": "Press <b>Enter</b> to run.",
        "txt-menu-title": "Interactive Menu Options",
        /* MENU_TRANS_EN_START */
        "txt-opt-0": "<b>0 → Compact OS (Save Space)</b>",
        "txt-opt-q": "<b>Q → Quick Fix (Recommended)</b>",
        "txt-opt-1": "1 → System Information",
        "txt-opt-2": "2 → Junk Cleaner (All GPU)",
        "txt-opt-3": "3 → Empty Recycle Bin",
        "txt-opt-4": "4 → Open Disk Cleanup",
        "txt-opt-5": "5 → Smart Uninstaller",
        "txt-opt-6": "6 → Network Repair (5-in-1)",
        "txt-opt-7": "7 → Power & Battery Utilities",
        "txt-opt-8": "8 → Memory Optimizer",
        "txt-opt-9": "9 → Defrag & Optimize Drives",
        "txt-opt-10": "10 → System Health (SFC/DISM)",
        "txt-opt-11": "11 → Windows Update Fixer",
        "txt-opt-12": "12 → DNS Changer",
        "txt-opt-13": "13 → Language Settings",
        /* MENU_TRANS_EN_END */
        "txt-tip-title": "Tip:",
        "txt-tip-desc": "Use <b>Menu [0] Compact OS</b> if your C: drive is full. Always backup important data before performing deep system maintenance.",
        "txt-feat-title": "Key Feature Explanation",
        "txt-f-q-t": "Quick Fix (Menu Q):",
        "txt-f-q-d": "The ultimate 'One-Click' maintenance tool. It automatically runs Junk Cleanup, Network Repair, and Memory Optimization in a single sequence.",
        "txt-f1-t": "Compact OS (Menu 0):",
        "txt-f1-d": "A powerful Windows feature that compresses system binaries. It is 100% safe, reversible, and can instantly free up <b>2GB to 5GB</b> of storage space without deleting any files.",
        "txt-f2-t": "Enhanced Junk Cleaner (Menu 2):",
        "txt-f2-d": "Safely removes temporary files and browser caches (Chrome, Edge, Brave). Also cleans shader caches for <b>AMD, NVIDIA, and Intel</b> GPUs to fix stuttering issues.",
        "txt-f3-t": "Smart Uninstaller (Menu 5):",
        "txt-f3-d": "Quickly search and remove installed programs using fuzzy logic search. Just type the app name or initials!",
        "txt-f4-t": "Network Repair (Menu 6):",
        "txt-f4-d": "Runs a complete 5-step network reset: Release/Renew IP, Flush DNS, Reset Winsock, and Reset TCP/IP stack. Useful for fixing connection drops.",
        "txt-f5-t": "Windows Update Fixer (Menu 11):",
        "txt-f5-d": "Fixes stuck or failed Windows Updates by resetting the update services (wuauserv, bits, cryptSvc) and renaming the download cache folder.",
        "txt-f6-t": "SFC & DISM (Menu 10):",
        "txt-f6-d": "The two most powerful \"self-repair\" tools in Windows. Use this if your system feels buggy or crashes often.",
        "txt-jc-title": "How to Use - ncexs JunkCleaner",
        "txt-jc-1": "Extract the ZIP file (right-click → Extract All).",
        "txt-jc-2": "Double-click the <b>.bat</b> file.",
        "txt-jc-3": "If 'Windows protected your PC' appears, click <b>More info</b> → <b>Run anyway</b>.",
        "txt-jc-4": "Allow admin access when prompted.",
        "txt-jc-menu": "Menu Options",
        "txt-jc-m1": "1 → Junk & Cache Cleaner",
        "txt-jc-m2": "2 → Deep Cleanup",
        "txt-jc-m3": "3 → Antivirus Scan",
        "txt-jc-m4": "4 → Clear RAM",
        "txt-jc-note": "After the process finishes, check <b>log_ncexs.txt</b> for the cleanup report."
      },
      id: {
        "txt-lang-label": "Bahasa:",
        "txt-how-title": "Cara Menggunakan - ncexs Toolkit",
        "txt-m1-title": "Metode 1: Cara Mudah (Klik Kanan)",
        "txt-m1-1": "Download file <b>ncexs-Toolkit.ps1</b>.",
        "txt-m1-2": "<b>Klik kanan</b> file tersebut.",
        "txt-m1-3": "Pilih <b>Run with PowerShell</b>.",
        "txt-m1-4": "Jika muncul \"Security Warning\", ketik <b>R</b> lalu tekan <b>Enter</b>.",
        "txt-m1-5": "Toolkit akan terbuka secara otomatis.",
        "txt-m2-title": "Metode 2: Manual (Command Line)",
        "txt-m2-1": "Buka Start Menu, ketik <b>powershell</b>, lalu tekan <b>Enter</b>.",
        "txt-m2-2": "Copy dan paste perintah di bawah ini ke jendela PowerShell, lalu tekan <b>Enter</b>:",
        "txt-m2-3": "<b>Tarik dan lepas</b> file .ps1 langsung ke jendela PowerShell.",
        "txt-m2-4": "Tekan <b>Enter</b> untuk menjalankan.",
        "txt-menu-title": "Pilihan Menu Interaktif",
        /* MENU_TRANS_ID_START */
        "txt-opt-q": "<b>Q → Perbaikan Cepat (Disarankan)</b>",
        "txt-opt-0": "<b>0 → Compact OS (Hemat Penyimpanan)</b>",
        "txt-opt-1": "1 → Informasi Sistem",
        "txt-opt-2": "2 → Pembersih Sampah (Semua GPU)",
        "txt-opt-3": "3 → Kosongkan Recycle Bin",
        "txt-opt-4": "4 → Buka Disk Cleanup",
        "txt-opt-5": "5 → Smart Uninstaller",
        "txt-opt-6": "6 → Perbaikan Jaringan (5-in-1)",
        "txt-opt-7": "7 → Utilitas Daya & Baterai",
        "txt-opt-8": "8 → Pengoptimal Memori (RAM)",
        "txt-opt-9": "9 → Defrag & Optimasi Drive",
        "txt-opt-10": "10 → Kesehatan Sistem (SFC/DISM)",
        "txt-opt-11": "11 → Perbaikan Windows Update",
        "txt-opt-12": "12 → Pengubah DNS",
        "txt-opt-13": "13 → Pengaturan Bahasa",
        /* MENU_TRANS_ID_END */
        "txt-tip-title": "Tips:",
        "txt-tip-desc": "Gunakan <b>Menu [0] Compact OS</b> jika drive C: penuh. Selalu backup data penting sebelum melakukan perawatan sistem mendalam.",
        "txt-feat-title": "Penjelasan Fitur Utama",
        "txt-f-q-t": "Perbaikan Cepat (Menu Q):",
        "txt-f-q-d": "Alat perawatan 'Sekali Klik' yang ampuh. Menjalankan Pembersih Sampah, Perbaikan Jaringan, dan Optimasi RAM secara otomatis dalam satu urutan.",
        "txt-f1-t": "Compact OS (Menu 0):",
        "txt-f1-d": "Fitur Windows yang kuat untuk mengompres file sistem. 100% aman, bisa dibatalkan, dan instan menghemat <b>2GB hingga 5GB</b> ruang penyimpanan tanpa menghapus file pribadi.",
        "txt-f2-t": "Enhanced Junk Cleaner (Menu 2):",
        "txt-f2-d": "Menghapus file sementara dan cache browser (Chrome, Edge, Brave) dengan aman. Juga membersihkan cache shader untuk GPU <b>AMD, NVIDIA, dan Intel</b> guna mengatasi patah-patah (stuttering).",
        "txt-f3-t": "Smart Uninstaller (Menu 5):",
        "txt-f3-d": "Cari dan hapus program terinstall dengan cepat menggunakan pencarian pintar. Cukup ketik nama aplikasi atau inisialnya!",
        "txt-f4-t": "Network Repair (Menu 6):",
        "txt-f4-d": "Menjalankan reset jaringan 5 langkah: Release/Renew IP, Flush DNS, Reset Winsock, dan Reset stack TCP/IP. Berguna untuk memperbaiki koneksi yang sering putus.",
        "txt-f5-t": "Windows Update Fixer (Menu 11):",
        "txt-f5-d": "Memperbaiki Windows Update yang macet atau gagal dengan mereset layanan update (wuauserv, bits, cryptSvc) dan mengganti nama folder cache download.",
        "txt-f6-t": "SFC & DISM (Menu 10):",
        "txt-f6-d": "Dua alat \"perbaikan mandiri\" paling ampuh di Windows. Gunakan ini jika sistem terasa error atau sering crash.",
        "txt-jc-title": "Cara Menggunakan - ncexs JunkCleaner",
        "txt-jc-1": "Ekstrak file ZIP (klik kanan → Extract All).",
        "txt-jc-2": "Klik dua kali file <b>.bat</b>.",
        "txt-jc-3": "Jika muncul 'Windows protected your PC', klik <b>More info</b> → <b>Run anyway</b>.",
        "txt-jc-4": "Izinkan akses admin jika diminta.",
        "txt-jc-menu": "Pilihan Menu",
        "txt-jc-m1": "1 → Pembersih Sampah & Cache",
        "txt-jc-m2": "2 → Pembersihan Mendalam",
        "txt-jc-m3": "3 → Scan Antivirus",
        "txt-jc-m4": "4 → Bersihkan RAM",
        "txt-jc-note": "Setelah proses selesai, cek <b>log_ncexs.txt</b> untuk laporan pembersihan."
      }
    };

    function setLanguage(lang) {
      document.getElementById('btn-en').classList.remove('active');
      document.getElementById('btn-id').classList.remove('active');
      document.getElementById('btn-' + lang).classList.add('active');

      const t = translations[lang];
      for (const key in t) {
        const el = document.getElementById(key);
        if (el) el.innerHTML = t[key];
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      loadProjects();
    });

    window.onload = () => { setLanguage('en'); };

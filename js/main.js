function updateRealTimeClock() {
      const now = new Date();
      const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      document.getElementById('time').textContent = now.toLocaleTimeString('en-US', timeOptions);

      const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      document.getElementById('date').textContent = now.toLocaleDateString('en-GB', dateOptions);
    }

    setInterval(updateRealTimeClock, 1000);
    updateRealTimeClock();


    function showTab(id, el) {
      document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
      document.getElementById(id).classList.remove('hidden');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      if (el) el.classList.add('active');
    }

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

    const translations = {
      en: {
        "txt-lang-label": "Language:",
        "txt-how-title": "How to Use - ncexs Toolkit",
        "txt-quick-title": "Quick Run (No Download Required)",
        "txt-quick-1": "Open your <b>Start Menu</b>, type <b>powershell</b>, right-click it and select <b>Run as Administrator</b>.",
        "txt-quick-2": "Copy and paste the command below, then press <b>Enter</b>:",
        "txt-quick-3": "The toolkit will launch automatically.",
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
        "txt-opt-14": "14 → Visual FX Booster",
        "txt-opt-15": "15 → Optimize WhatsApp",
        "txt-opt-16": "16 → Exit Toolkit",
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
        "txt-cl-title": "Version History / Changelog",
        "txt-cl-desc": "Recent updates and changes to the ncexs Toolkit."
      },
      id: {
        "txt-lang-label": "Bahasa:",
        "txt-how-title": "Cara Menggunakan - ncexs Toolkit",
        "txt-quick-title": "Perintah Cepat (Tanpa Perlu Download)",
        "txt-quick-1": "Buka <b>Start Menu</b>, ketik <b>powershell</b>, klik kanan lalu pilih <b>Run as Administrator</b>.",
        "txt-quick-2": "Copy dan paste perintah di bawah ini, lalu tekan <b>Enter</b>:",
        "txt-quick-3": "Toolkit akan langsung terbuka secara otomatis.",
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
        "txt-opt-14": "14 → Visual FX Booster",
        "txt-opt-15": "15 → Optimasi WhatsApp",
        "txt-opt-16": "16 → Keluar Aplikasi",
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
        "txt-cl-title": "Riwayat Versi / Changelog",
        "txt-cl-desc": "Pembaruan dan perubahan terbaru pada ncexs Toolkit."
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
      loadChangelog();
    });

    window.onload = () => { setLanguage('en'); };

    let allChangelogVersions = [];
    let changelogCurrentPage = 1;
    const changelogItemsPerPage = 3;

    async function loadChangelog() {
      const container = document.getElementById('changelog-list');
      try {
        // Fetch raw CHANGELOG.md from the repository
        const response = await fetch('https://raw.githubusercontent.com/ncexs/ncexs-toolkit/main/CHANGELOG.md', { cache: "no-store" });
        
        if (!response.ok) {
            throw new Error("CHANGELOG.md not found in the repository. Please create one.");
        }
        
        const markdownText = await response.text();
        const rawVersions = markdownText.split(/(?=^# 🚀 ncexs Toolkit v)/m);
        allChangelogVersions = rawVersions.filter(v => v.trim() !== '');
        changelogCurrentPage = 1;
        displayChangelogPage();
      } catch (error) {
        container.innerHTML = `
          <div style="text-align:center; padding: 2rem; background: rgba(255,0,0,0.1); border-radius: 12px; border: 1px solid rgba(255,0,0,0.2);">
            <i class="fas fa-file-alt fa-2x" style="color: #ef4444; margin-bottom: 15px;"></i>
            <h3 style="margin-top: 0; color: #ef4444;">Changelog File Missing</h3>
            <p style="color: var(--text-muted);">${error.message}</p>
            <p style="margin-top: 15px;">To fix this, create a file named <b>CHANGELOG.md</b> in your ncexs-toolkit repository.</p>
          </div>
        `;
      }
    }

    function displayChangelogPage() {
      const container = document.getElementById('changelog-list');
      const start = (changelogCurrentPage - 1) * changelogItemsPerPage;
      const end = start + changelogItemsPerPage;
      const pageVersions = allChangelogVersions.slice(start, end);

      let htmlContent = '';
      pageVersions.forEach(ver => {
          const lines = ver.trim().split('\n');
          let title = "Release Notes";
          if (lines[0].startsWith("# 🚀")) {
              title = lines.shift().replace(/^# /, '').trim();
          }
          
          const htmlBody = parseMarkdown(lines.join('\n'));

          htmlContent += `
            <div class="card" style="margin-bottom: 20px;">
              <h3 style="margin-bottom: 15px; color: var(--primary-color);">${title}</h3>
              <div class="changelog-box" style="padding: 10px 5px;">
                <div class="changelog-content">${htmlBody}</div>
              </div>
            </div>
          `;
      });
      container.innerHTML = htmlContent;
      renderChangelogPagination();
    }

    function renderChangelogPagination() {
      const totalPages = Math.ceil(allChangelogVersions.length / changelogItemsPerPage);
      if (totalPages <= 1) return;

      let paginationHtml = '<div class="pagination" style="display:flex; justify-content:center; gap:10px; margin-top:20px;">';
      
      const prevDisabled = changelogCurrentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
      paginationHtml += `<button class="btn btn-outline" ${prevDisabled} onclick="changeChangelogPage(-1)"><i class="fas fa-chevron-left"></i> Prev</button>`;
      
      paginationHtml += `<span style="display:flex; align-items:center; font-weight:600; color:var(--text-muted);">Page ${changelogCurrentPage} of ${totalPages}</span>`;
      
      const nextDisabled = changelogCurrentPage === totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
      paginationHtml += `<button class="btn btn-outline" ${nextDisabled} onclick="changeChangelogPage(1)">Next <i class="fas fa-chevron-right"></i></button>`;
      
      paginationHtml += '</div>';
      
      document.getElementById('changelog-list').innerHTML += paginationHtml;
    }

    window.changeChangelogPage = function(direction) {
      const totalPages = Math.ceil(allChangelogVersions.length / changelogItemsPerPage);
      const newPage = changelogCurrentPage + direction;
      if (newPage >= 1 && newPage <= totalPages) {
        changelogCurrentPage = newPage;
        displayChangelogPage();
        document.getElementById('changelog').scrollIntoView({ behavior: 'smooth' });
      }
    }

function updateRealTimeClock() {
  const now = new Date();
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  document.getElementById('time').textContent = now.toLocaleTimeString('en-US', timeOptions);

  const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  document.getElementById('date').textContent = now.toLocaleDateString('en-GB', dateOptions);
}

setInterval(updateRealTimeClock, 1000);
updateRealTimeClock();


let activeSubTab = 'guide';

function showSubTab(subTabId) {
  activeSubTab = subTabId;
  
  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.classList.toggle('active', btn.id === `sub-tab-${subTabId}`);
  });
  
  const guideContainer = document.getElementById('guide');
  const changelogContainer = document.getElementById('changelog');
  
  if (subTabId === 'guide') {
    if (guideContainer) guideContainer.classList.remove('hidden');
    if (changelogContainer) changelogContainer.classList.add('hidden');
  } else {
    if (guideContainer) guideContainer.classList.add('hidden');
    if (changelogContainer) changelogContainer.classList.remove('hidden');
  }
}
window.showSubTab = showSubTab;

function showTab(id, el) {
  document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  document.body.setAttribute('data-active-tab', id);
  
  if (id === 'projects') {
    showSubTab(activeSubTab);
  }
}
window.showTab = showTab;

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

let activeProject = 'toolkit';

function setProject(project) {
  activeProject = project;
  
  // Update body classes for CSS targeting
  document.body.className = `project-${project}`;
  
  // Update active states on project buttons
  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-project') === project);
  });
  
  // Update selector container attribute for thumb sliding animation
  const container = document.querySelector('.project-selector-container');
  if (container) {
    container.setAttribute('data-active', project);
  }
  
  // Update theme variables dynamically
  const root = document.documentElement;
  if (project === 'toolkit') {
    root.style.setProperty('--primary-color', '#6366f1');
    root.style.setProperty('--primary-rgb', '99, 102, 241');
    root.style.setProperty('--secondary-color', '#0ea5e9');
    root.style.setProperty('--accent-color', '#8b5cf6');
  } else if (project === 'autotask') {
    root.style.setProperty('--primary-color', '#10b981');
    root.style.setProperty('--primary-rgb', '16, 185, 129');
    root.style.setProperty('--secondary-color', '#0ea5e9');
    root.style.setProperty('--accent-color', '#059669');
  } else if (project === 'junkcleaner') {
    root.style.setProperty('--primary-color', '#f43f5e');
    root.style.setProperty('--primary-rgb', '244, 63, 94');
    root.style.setProperty('--secondary-color', '#d946ef');
    root.style.setProperty('--accent-color', '#be123c');
  }
  
  // Update language content for the active project
  const currentLang = document.getElementById('btn-id')?.classList.contains('active') ? 'id' : 'en';
  setLanguage(currentLang);

  // Clear and reload changelog for the active project
  loadChangelogForProject(project);
}

const translations = {
  en: {
    "txt-lang-label": "Choose Language:",
    "txt-hub-subtitle": "Unleash Your PC's Full Potential",
    "txt-hub-desc": "Explore a curated suite of lightweight, safe, and powerful tools designed to optimize, clean, and automate your Windows experience—pure performance, zero bloat.",
    "txt-tab-intro": "Introduction",
    "txt-tab-projects": "Projects",
    "txt-sub-tab-how": "How to Use",
    "txt-sub-tab-changelog": "Changelog",
    "txt-bio-title": "Hello, I'm ncexs",
    "txt-bio-desc": "I am a developer learning to build lightweight & useful tools for everyone. I created these utilities to help myself and others manage their Windows systems efficiently without \"bloatware\".",
    "txt-sec-title": "Security & Trust",
    "txt-sec-desc": "These utilities are 100% transparent and open-source. They do not collect any personal data. You are free to audit the code at any time.",
    
    // Toolkit Intro
    "txt-tk-intro-desc": "An open-source, interactive, all-in-one PowerShell console suite. Safely clean, optimize system speed, configure DNS, repair network stacks, and manage Windows updates—all from one lightweight interface with zero installations.",
    "txt-tk-btn-guide": "Get Started",
    
    // AutoTask Intro
    "txt-at-intro-desc": "A lightweight background automation script built for silent, scheduled Windows maintenance. It automatically runs in the background via Task Scheduler to clean system caches, browser shader files, and GPU runtimes without interrupting active browser sessions or active processes.",
    "txt-at-btn-guide": "Setup Scheduler",
    "txt-at-feat-1-t": "100% Safe Cleanup",
    "txt-at-feat-1-d": "Targeted strictly at temporary paths and browser/GPU caches. Authentications, cookies, and local files are completely untouched.",
    "txt-at-feat-2-t": "Silent Execution",
    "txt-at-feat-2-d": "Designed with background detection. Automatically runs hidden with zero console popups, preventing desktop interruptions.",
    "txt-at-feat-3-t": "Process-Aware",
    "txt-at-feat-3-d": "Checks active applications before deletion. If a browser is active, it skips cache cleaning to protect open database sessions.",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "A classic, lightweight, and super-fast Batch Script (`.bat`) for one-click Windows optimization. Designed as a straightforward \"run-and-done\" utility, it safely empties temporary directories, Recycle Bins, recent logs, and triggers a lightweight system RAM flush.",
    "txt-jc-btn-guide": "Get Release",

    // Toolkit Guide
    "txt-how-title": "How to Use - ncexs Toolkit",
    "txt-quick-title": "Quick Run (No Download Required)",
    "txt-quick-1": "Open your <b>Start Menu</b>, type <b>powershell</b>, right-click it and select <b>Run as Administrator</b>.",
    "txt-quick-2": "Copy and paste the command below, then press <b>Enter</b>:",
    "txt-quick-3": "The toolkit will launch automatically.",
    "txt-menu-title": "Interactive Menu Options",
    /* MENU_TRANS_EN_START */
    "txt-opt-q": "<b>Q → Quick Fix (Recommended)</b>",
    "txt-opt-0": "<b>0 → Compact OS (Save Space)</b>",
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
    "txt-cl-desc": "Recent updates and changes to the ncexs Utilities.",

    // AutoTask Guide
    "txt-how-at-title": "How to Use - ncexs AutoTask",
    "txt-at-dl-title": "Download Script",
    "txt-at-dl-desc": "Download the official PowerShell automation script from our GitHub repository:",
    "txt-at-dl-btn": "Download ncexs-AutoTask.ps1",
    "txt-at-manual-title": "Manual Run Command",
    "txt-at-manual-1": "Open <b>PowerShell</b> (Administrator recommended).",
    "txt-at-manual-2": "Execute the script locally with this command:",
    "txt-at-sched-title": "Automate with Task Scheduler (Recommended)",
    "txt-at-step-1": "<b>Open Task Scheduler</b><p>Press <b>Win + R</b>, type <code class='code-inline'>taskschd.msc</code>, and press <b>Enter</b>.</p>",
    "txt-at-step-2": "<b>Create a New Task</b><p>Click <b>Create Task</b> on the right sidebar (not Basic Task). In the <b>General</b> tab:</p><ul><li>Name: <code class='code-inline'>ncexs Auto Task</code></li><li>Check: <b>\"Run whether user is logged on or not\"</b></li><li>Check: <b>\"Run with highest privileges\"</b></li></ul>",
    "txt-at-step-3": "<b>Configure Trigger (Schedule)</b><p>Go to the <b>Triggers</b> tab, click <b>New</b>. Set trigger to <b>On a schedule</b>, select <b>Daily</b>. Optionally, check <b>\"Repeat task every:\"</b>, type <code class='code-inline'>6 hours</code>, and set duration to <b>Indefinitely</b>.</p>",
    "txt-at-step-4": "<b>Configure Action</b><p>Go to the <b>Actions</b> tab, click <b>New</b>, set Action to <b>\"Start a program\"</b>:</p><ul><li>Program/script: <code class='code-inline'>powershell.exe</code></li><li>Arguments: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(Change folder path to where you saved the script. Omit -Silent for interactive debugging)</i></li></ul>",
    "txt-at-step-5": "<b>Configure Conditions</b><p>In the <b>Conditions</b> tab, uncheck: <b>\"Start the task only if the computer is on AC power\"</b> (this allows it to run on laptops on battery power).</p>",
    "txt-at-step-6": "<b>Configure Settings & Save</b><p>In the <b>Settings</b> tab, check <b>\"Run task as soon as possible after a scheduled start is missed\"</b>. Click <b>OK</b> and enter your password if prompted.</p>",

    // Junk Cleaner Guide
    "txt-how-jc-title": "How to Use - ncexs Junk Cleaner",
    "txt-jc-run-title": "One-Click Run Instructions",
    "txt-jc-step-1": "Download the latest release ZIP from the <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "Extract the downloaded ZIP package.",
    "txt-jc-step-3": "Double-click the <code class='code-inline'>ncexs-junkcleaner.bat</code> file to launch the script.",
    "txt-jc-step-4": "If SmartScreen blocks execution ('Windows protected your PC'), click <b>More info</b> → <b>Run anyway</b>.",
    "txt-jc-step-5": "Allow Administrator access when prompted by User Account Control (UAC).",
    "txt-jc-step-6": "Follow the on-screen prompts (type <code class='code-inline'>Y</code> or <code class='code-inline'>N</code>) for: Junk Cleaner, Deep Cleanup, Antivirus Quick Scan, or RAM optimization."
  },
  id: {
    "txt-lang-label": "Pilih Bahasa:",
    "txt-hub-subtitle": "Maksimalkan Potensi Penuh PC Anda",
    "txt-hub-desc": "Temukan serangkaian alat utilitas yang ringan, aman, dan kuat yang dirancang untuk mengoptimalkan, membersihkan, dan mengotomatiskan sistem Windows Anda—kinerja murni, tanpa bloatware.",
    "txt-tab-intro": "Pengenalan",
    "txt-tab-projects": "Proyek",
    "txt-sub-tab-how": "Cara Penggunaan",
    "txt-sub-tab-changelog": "Catatan Rilis",
    "txt-bio-title": "Halo, Saya ncexs",
    "txt-bio-desc": "Saya adalah seorang developer yang sedang belajar membangun alat yang ringan & berguna untuk semua orang. Saya membuat utilitas ini untuk membantu diri saya sendiri dan orang lain mengelola sistem Windows secara efisien tanpa \"bloatware\".",
    "txt-sec-title": "Keamanan & Kepercayaan",
    "txt-sec-desc": "Alat utilitas ini 100% transparan dan open-source. Alat-alat ini tidak mengumpulkan data pribadi apa pun. Anda bebas memeriksa kodenya kapan saja.",

    // Toolkit Intro
    "txt-tk-intro-desc": "Konsol utilitas PowerShell interaktif all-in-one yang open-source. Bersihkan dengan aman, optimalkan kecepatan sistem, konfigurasi DNS, perbaiki koneksi jaringan, dan kelola Windows Update—semua dari satu antarmuka ringan tanpa instalasi.",
    "txt-tk-btn-guide": "Mulai Sekarang",
    
    // AutoTask Intro
    "txt-at-intro-desc": "Script otomatisasi latar belakang ringan untuk pemeliharaan Windows harian yang sunyi. Berjalan otomatis via Task Scheduler untuk membersihkan sampah sistem, cache shader browser, dan GPU tanpa mengganggu sesi browser aktif atau proses aplikasi.",
    "txt-at-btn-guide": "Atur Penjadwal",
    "txt-at-feat-1-t": "Pembersihan 100% Aman",
    "txt-at-feat-1-d": "Ditargetkan ketat hanya ke folder temporary dan cache browser/GPU. Data autentikasi, cookies, dan file pribadi Anda aman sepenuhnya.",
    "txt-at-feat-2-t": "Eksekusi Latar Belakang",
    "txt-at-feat-2-d": "Dilengkapi dengan deteksi non-interaktif. Berjalan tersembunyi tanpa memunculkan jendela konsol, menjaga fokus aktivitas Anda.",
    "txt-at-feat-3-t": "Sensitif Proses Aktif",
    "txt-at-feat-3-d": "Mengecek aplikasi aktif sebelum menghapus. Jika browser sedang dibuka, cache browser tersebut akan dilewati demi mencegah kerusakan sesi.",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "Script Batch (.bat) klasik, ringan, dan super cepat untuk optimasi Windows satu klik. Didesain praktis, aman membersihkan direktori sampah, Recycle Bin, log riwayat, dan memicu pelepasan RAM sistem yang tersumbat.",
    "txt-jc-btn-guide": "Unduh Rilis",

    // Toolkit Guide
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
    "txt-cl-desc": "Pembaruan dan perubahan terbaru pada Utilitas ncexs.",

    // AutoTask Guide
    "txt-how-at-title": "Cara Menggunakan - ncexs AutoTask",
    "txt-at-dl-title": "Unduh Script",
    "txt-at-dl-desc": "Unduh script otomatisasi PowerShell resmi dari repositori GitHub kami:",
    "txt-at-dl-btn": "Unduh ncexs-AutoTask.ps1",
    "txt-at-manual-title": "Perintah Jalankan Manual",
    "txt-at-manual-1": "Buka <b>PowerShell</b> (Disarankan sebagai Administrator).",
    "txt-at-manual-2": "Jalankan script secara lokal dengan perintah ini:",
    "txt-at-sched-title": "Otomatisasi dengan Task Scheduler (Disarankan)",
    "txt-at-step-1": "<b>Buka Task Scheduler</b><p>Tekan <b>Win + R</b>, ketik <code class='code-inline'>taskschd.msc</code>, lalu tekan <b>Enter</b>.</p>",
    "txt-at-step-2": "<b>Buat Task Baru</b><p>Klik <b>Create Task</b> di sidebar kanan (jangan pilih Basic Task). Di tab <b>General</b>:</p><ul><li>Nama: <code class='code-inline'>ncexs Auto Task</code></li><li>Centang: <b>'Run whether user is logged on or not'</b></li><li>Centang: <b>'Run with highest privileges'</b></li></ul>",
    "txt-at-step-3": "<b>Atur Trigger (Jadwal)</b><p>Buka tab <b>Triggers</b>, klik <b>New</b>. Mulai tugas: <b>On a schedule</b>, pilih <b>Daily</b>. Opsional, centang <b>'Repeat task every:'</b>, ketik <code class='code-inline'>6 hours</code>, dan atur durasi ke <b>Indefinitely</b>.</p>",
    "txt-at-step-4": "<b>Atur Action</b><p>Buka tab <b>Actions</b>, klik <b>New</b>, atur Action ke <b>'Start a program'</b>:</p><ul><li>Program/script: <code class='code-inline'>powershell.exe</code></li><li>Arguments: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(Ganti path folder dengan lokasi tempat Anda menyimpan script Anda. Hapus -Silent untuk melihat tampilan debug)</i></li></ul>",
    "txt-at-step-5": "<b>Atur Conditions</b><p>Di tab <b>Conditions</b>, hilangkan centang: <b>'Start the task only if the computer is on AC power'</b> (agar tetap berjalan di laptop saat menggunakan baterai).</p>",
    "txt-at-step-6": "<b>Atur Settings & Simpan</b><p>Di tab <b>Settings</b>, centang <b>'Run task as soon as possible after a scheduled start is missed'</b>. Klik <b>OK</b> dan masukkan password Windows Anda jika diminta.</p>",

    // Junk Cleaner Guide
    "txt-how-jc-title": "Cara Menggunakan - Cara Menggunakan - ncexs Junk Cleaner",
    "txt-jc-run-title": "Petunjuk Sekali Klik",
    "txt-jc-step-1": "Unduh rilis ZIP terbaru dari <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "Ekstrak file ZIP yang telah diunduh.",
    "txt-jc-step-3": "Double-click file <code class='code-inline'>ncexs-junkcleaner.bat</code> untuk memulai program.",
    "txt-jc-step-4": "Jika muncul peringatan SmartScreen ('Windows protected your PC'), klik <b>More info</b> → <b>Run anyway</b>.",
    "txt-jc-step-5": "Berikan akses Administrator saat diminta oleh User Account Control (UAC).",
    "txt-jc-step-6": "Ikuti petunjuk di layar (ketik <code class='code-inline'>Y</code> atau <code class='code-inline'>N</code>) untuk: Junk Cleaner, Deep Cleanup, Antivirus Quick Scan, atau optimasi RAM."
  }
};

function setLanguage(lang) {
  const btnEn = document.getElementById('btn-en');
  const btnId = document.getElementById('btn-id');
  if (btnEn) btnEn.classList.remove('active');
  if (btnId) btnId.classList.remove('active');
  
  const targetBtn = document.getElementById('btn-' + lang);
  if (targetBtn) targetBtn.classList.add('active');

  const t = translations[lang];
  for (const key in t) {
    const el = document.getElementById(key);
    if (el) el.innerHTML = t[key];
  }
}
window.setLanguage = setLanguage;

function toggleLanguage() {
  const currentLang = document.getElementById('btn-id')?.classList.contains('active') ? 'id' : 'en';
  const newLang = currentLang === 'en' ? 'id' : 'en';
  setLanguage(newLang);
}
window.toggleLanguage = toggleLanguage;

window.addEventListener('DOMContentLoaded', () => {
  // Initialize with toolkit project
  setProject('toolkit');
});

window.onload = () => { 
  setLanguage('en'); 
};

let allChangelogVersions = [];
let changelogCurrentPage = 1;
let changelogItemsPerPage = 3;

async function loadChangelogForProject(project) {
  const container = document.getElementById('changelog-list');
  if (!container) return;


  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:#888;">
      <i class="fas fa-circle-notch fa-spin fa-2x" style="color:var(--primary-color)"></i>
      <p style="margin-top:1rem">Loading changelog from GitHub...</p>
    </div>
  `;

  try {
    let rawVersions = [];
    let markdownText = '';
    
    if (project === 'toolkit') {
      const response = await fetch('https://raw.githubusercontent.com/ncexs/ncexs-toolkit/main/CHANGELOG.md', { cache: "no-store" });
      if (!response.ok) {
        throw new Error("CHANGELOG.md not found in ncexs-toolkit repository.");
      }
      markdownText = await response.text();
      const splitVersions = markdownText.split(/(?=^# 🚀 ncexs Toolkit v)/m);
      rawVersions = splitVersions.filter(v => v.trim() !== '');
    } 
    else if (project === 'autotask') {
      const response = await fetch('https://raw.githubusercontent.com/ncexs/ncexs-AutoTask/main/CHANGELOG.md', { cache: "no-store" });
      if (!response.ok) {
        throw new Error("CHANGELOG.md not found in ncexs-AutoTask repository.");
      }
      markdownText = await response.text();
      
      // Split by either ## 🚀 or ## 📦 to separate AutoTask versions cleanly
      const splitVersions = markdownText.split(/(?=^##?\s*(?:🚀|📦))/m);
      rawVersions = splitVersions.filter(v => {
        const trimmed = v.trim();
        return trimmed !== '' && (trimmed.startsWith('# 🚀') || trimmed.startsWith('## 🚀') || trimmed.startsWith('## 📦') || trimmed.startsWith('# 📦'));
      });
    } 
    else if (project === 'junkcleaner') {
      try {
        const jcReleases = await fetchWithCache('https://api.github.com/repos/ncexs/ncexs-junkcleaner/releases', 'jc_releases_cache');
        if (jcReleases && Array.isArray(jcReleases)) {
          jcReleases.forEach(release => {
            const versionText = `# 🚀 ncexs Junk Cleaner ${release.tag_name}\n\n${release.body}`;
            rawVersions.push(versionText);
          });
        } else {
          throw new Error("No releases returned from GitHub API.");
        }
      } catch (e) {
        console.error("Failed to load junk cleaner releases", e);
        throw new Error("Could not load releases from GitHub API.");
      }
    }

    allChangelogVersions = rawVersions;
    changelogCurrentPage = 1;
    displayChangelogPageForProject(project);
  } catch (error) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2rem; background: rgba(255,0,0,0.1); border-radius: 12px; border: 1px solid rgba(255,0,0,0.2);">
        <i class="fas fa-file-alt fa-2x" style="color: #ef4444; margin-bottom: 15px;"></i>
        <h3 style="margin-top: 0; color: #ef4444;">Changelog Loading Failed</h3>
        <p style="color: var(--text-muted);">${error.message}</p>
        <p style="margin-top: 15px;">Please verify that the repository is public and contains a valid release file.</p>
      </div>
    `;
  }
}

function displayChangelogPageForProject(project) {
  const container = document.getElementById('changelog-list');
  if (!container) return;

  const start = (changelogCurrentPage - 1) * changelogItemsPerPage;
  const end = start + changelogItemsPerPage;
  const pageVersions = allChangelogVersions.slice(start, end);

  if (pageVersions.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--text-muted);">
        <i class="fas fa-box-open fa-2x" style="margin-bottom:15px; opacity:0.5;"></i>
        <p>No version history available for this project yet.</p>
      </div>
    `;
    return;
  }

  let htmlContent = '';
  pageVersions.forEach(ver => {
      const lines = ver.trim().split('\n');
      let title = "Release Notes";
      if (lines[0].startsWith("#")) {
          // Replace both 🚀 and 📦 emojis along with Markdown syntax
          title = lines.shift()
                       .replace(/^#+\s*🚀\s*/, '')
                       .replace(/^#+\s*📦\s*/, '')
                       .replace(/^#+\s*/, '')
                       .trim();
      }
      
      let htmlBody = parseMarkdown(lines.join('\n'));
      let buttonsHtml = "";
      
      // Determine if this specific entry should show download/GitHub buttons
      const versionMatch = title.match(/v([1230]\.\d+(?:\.\d+)?(?:-\w+)?)/i) || title.match(/(\d+\.\d+(?:\.\d+)?(?:-\w+)?)/);
      
      // We only show buttons for non-autotask projects
      if (versionMatch && project !== 'autotask') {
          const v = versionMatch[1];
          const cleanV = v.replace(/^v/i, '');
          
          // Toolkit v3.0+ does NOT show any buttons (neither download nor github)
          const isToolkitV3Plus = (project === 'toolkit' && parseFloat(cleanV) >= 3.0);
          
          if (!isToolkitV3Plus) {
              let repoName = (project === 'junkcleaner') ? 'ncexs-junkcleaner' : 'ncexs-toolkit';
              
              const downloadLinks = {
                "2.6": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.6/ncexs-Toolkit-v2.6.birthday-build.ps1",
                "2.5": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.5/ncexs-Toolkit-v2.5.new-year-edition.ps1",
                "2.4": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.4/ncexs-Toolkit-v2.4.optimized-release.ps1",
                "2.3": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.3/ncexs-Toolkit-v2.3.refined-release.ps1",
                "2.2.2": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.2.2/ncexs-Toolkit-v2.2.2-final-hotfix.zip",
                "2.2.1": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.2.1/ncexs.Toolkit.v2.2.1.hotfix.zip",
                "2.2": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.2/ncexs.Toolkit.v2.2.advanced.zip",
                "2.1": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.1/ncexs.Toolkit.v2.1.Enhanced.Edition.zip",
                "2.0": "https://github.com/ncexs/ncexs-toolkit/releases/download/v2.0/ncexs.Toolkit.v2.0.Extended.zip",
                "1.3": "https://github.com/ncexs/ncexs-junkcleaner/releases/download/v1.3/ncexs-junkcleaner-v1.3-EOL.zip",
                "1.2": "https://github.com/ncexs/ncexs-junkcleaner/releases/download/v1.2/ncexs-junkcleaner-v1.2.zip",
                "1.1": "https://github.com/ncexs/ncexs-junkcleaner/releases/download/v1.1/ncexs-junkcleaner-v1.1-nobin.zip",
                "1.0": "https://github.com/ncexs/ncexs-junkcleaner/releases/download/v1.0/ncexs-junkcleaner-v1.0.zip"
              };
              
              const dlUrl = downloadLinks[cleanV] || `https://github.com/ncexs/${repoName}/releases/tag/${v.startsWith('v') ? v : 'v' + v}`;
              
              buttonsHtml = `
                <div style="display: flex; gap: 10px;">
                  <a href="${dlUrl}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem; background-color: var(--primary-color); color: #fff; border: none; border-radius: 6px;"><i class="fas fa-download"></i> Download</a>
                  <a href="https://github.com/ncexs/${repoName}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px;"><i class="fab fa-github"></i> GitHub</a>
                </div>
              `;
          }
      }

      htmlContent += `
        <div class="card" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
            <h3 style="margin: 0; color: var(--primary-color);">${title}</h3>
            ${buttonsHtml}
          </div>
          <div class="changelog-box" style="padding: 10px 5px;">
            <div class="changelog-content">${htmlBody}</div>
          </div>
        </div>
      `;
  });
  container.innerHTML = htmlContent;
  renderChangelogPaginationForProject(project);
}

function renderChangelogPaginationForProject(project) {
  const totalPages = Math.ceil(allChangelogVersions.length / changelogItemsPerPage);
  if (totalPages <= 1) return;

  let paginationHtml = '<div class="pagination" style="display:flex; justify-content:center; gap:10px; margin-top:20px;">';
  
  const prevDisabled = changelogCurrentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
  paginationHtml += `<button class="btn btn-outline" ${prevDisabled} onclick="changeChangelogPageForProject(-1, '${project}')"><i class="fas fa-chevron-left"></i> Prev</button>`;
  
  paginationHtml += `<span style="display:flex; align-items:center; font-weight:600; color:var(--text-muted);">Page ${changelogCurrentPage} of ${totalPages}</span>`;
  
  const nextDisabled = changelogCurrentPage === totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
  paginationHtml += `<button class="btn btn-outline" ${nextDisabled} onclick="changeChangelogPageForProject(1, '${project}')">Next <i class="fas fa-chevron-right"></i></button>`;
  
  paginationHtml += '</div>';
  
  document.getElementById('changelog-list').innerHTML += paginationHtml;
}

window.changeChangelogPageForProject = function(direction, project) {
  const totalPages = Math.ceil(allChangelogVersions.length / changelogItemsPerPage);
  const newPage = changelogCurrentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    changelogCurrentPage = newPage;
    displayChangelogPageForProject(project);
    document.getElementById('changelog').scrollIntoView({ behavior: 'smooth' });
  }
}

window.addEventListener('scroll', () => {
  const btn = document.getElementById('scroll-bottom-btn');
  if (!btn) return;
  const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 50;
  if (isAtBottom) {
    btn.classList.remove('show');
  } else {
    btn.classList.add('show');
  }
});

function updateRealTimeClock() {
  const now = new Date();
  
  // Detect active language dynamically from dropdown
  let locale = 'en-GB';
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    const activeLang = langSelect.value;
    if (activeLang === 'id') locale = 'id-ID';
    else if (activeLang === 'jv') locale = 'jv-ID';
    else if (activeLang === 'su') locale = 'su-ID';
    else if (activeLang === 'hi') locale = 'hi-IN';
    else if (activeLang === 'ru') locale = 'ru-RU';
    else if (activeLang === 'ja') locale = 'ja-JP';
    else if (activeLang === 'ko') locale = 'ko-KR';
    else if (activeLang === 'zh') locale = 'zh-CN';
    else if (activeLang === 'ar') locale = 'ar-SA';
  }

  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  document.getElementById('time').textContent = now.toLocaleTimeString('en-US', timeOptions);

  const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  document.getElementById('date').textContent = now.toLocaleDateString(locale, dateOptions);
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

function openProjectDetail(project) {
  setProject(project);
  
  const homeView = document.getElementById('home-view');
  const detailView = document.getElementById('project-detail-view');
  if (homeView) homeView.classList.add('hidden');
  if (detailView) detailView.classList.remove('hidden');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.openProjectDetail = openProjectDetail;

function goBackToHome() {
  const homeView = document.getElementById('home-view');
  const detailView = document.getElementById('project-detail-view');
  if (homeView) homeView.classList.remove('hidden');
  if (detailView) detailView.classList.add('hidden');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goBackToHome = goBackToHome;



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
  const langSelect = document.getElementById('lang-select');
  const currentLang = langSelect ? langSelect.value : 'en';
  setLanguage(currentLang);

  // Clear and reload changelog for the active project
  loadChangelogForProject(project);
}

const fallbackTranslations = {
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
    
    // New UX navigation elements
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> Explore Our Projects",
    "txt-select-project-desc": "Click on one of the projects below to view its comprehensive guide, manual commands, and full version history.",
    "txt-back-home": "Back to Home",
    "txt-cta-tk-home": "View Guide &rarr;",
    "txt-cta-at-home": "View Guide &rarr;",
    "txt-cta-jc-home": "View Guide &rarr;",
    "txt-cta-tk-detail": "View Guide &rarr;",
    "txt-cta-at-detail": "View Guide &rarr;",
    "txt-cta-jc-detail": "View Guide &rarr;",

    // Toolkit Intro
    "txt-tk-intro-desc": "An open-source, interactive, all-in-one PowerShell utility console. Safely clean, optimize system speed, configure DNS, repair network connections, and manage Windows Updates—all from one lightweight interface with zero installation.",
    "txt-tk-btn-guide": "Get Started",
    
    // AutoTask Intro
    "txt-at-intro-desc": "A lightweight background automation script built for silent, daily Windows maintenance. It runs automatically via Task Scheduler to clean system junk, browser shader caches, and GPUs without interrupting active browser sessions or processes.",
    "txt-at-btn-guide": "Setup Scheduler",
    
    // Security Features Intro
    "txt-sec-feat-1-t": "100% Safe Cleanup",
    "txt-sec-feat-1-d": "Targeted strictly at temporary paths and system/browser cache files. Your personal files, passwords, browser history, cookies, and authentications are completely untouched.",
    "txt-sec-feat-2-t": "Non-Intrusive Design",
    "txt-sec-feat-2-d": "Designed to run smoothly. Use our interactive console menus, run a simple one-click script, or automate silent cleanup in the background without any intrusive popups.",
    "txt-sec-feat-3-t": "Smart Process Detection",
    "txt-sec-feat-3-d": "Our scripts intelligently check for active applications before cleaning. If a browser is active, they can skip its cache to protect your open database sessions and tabs.",
    "txt-sec-feat-4-t": "100% Virus-Free",
    "txt-sec-feat-4-d": "Tested and verified 100% clean by VirusTotal. Our tools contain absolutely zero malware, spyware, or malicious code, ensuring your system remains completely safe.",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "A classic, lightweight, and super-fast Batch Script (.bat) for one-click Windows optimization. Designed to be simple and safe, it empties junk directories, Recycle Bins, recent logs, and triggers a system RAM flush.",
    "txt-jc-btn-guide": "Get Release",

    // Toolkit Guide
    "txt-how-title": "How to Use - ncexs Toolkit",
    "txt-quick-title": "Quick Run (No Download Required)",
    "txt-quick-1": "Open your <b>Start Menu</b>, type <b>powershell</b>, right-click it and select <b>Run as Administrator</b>.",
    "txt-quick-2": "Copy and paste the command below, then press <b>Enter</b>:",
    "txt-quick-3": "The toolkit will launch automatically.",
    "txt-quick-4-1": "To cancel or exit any running process, press <b>Ctrl + C</b>.",
    "txt-quick-4-2": "To return and use the toolkit again, simply copy and paste the command below:",
    "txt-menu-title": "Interactive Menu Options",
    /* MENU_TRANS_EN_START */
        "txt-opt-q": "<b>Q → Quick Fix (Recommended)</b>",
        "txt-opt-0": "<b>0 → Compact OS (Save 2-5GB Space)</b>",
        "txt-opt-1": "1 → System Information",
        "txt-opt-2": "2 → Enhanced Junk Cleaner",
        "txt-opt-3": "3 → Empty Recycle Bin",
        "txt-opt-4": "4 → Open Disk Cleanup",
        "txt-opt-5": "5 → Smart Uninstaller",
        "txt-opt-6": "6 → Network Repair",
        "txt-opt-7": "7 → Power & Battery Utilities",
        "txt-opt-8": "8 → Memory Optimizer",
        "txt-opt-9": "9 → Defrag & Optimize Drives",
        "txt-opt-10": "10 → System Health Checker",
        "txt-opt-11": "11 → Updates & Drivers Center",
        "txt-opt-12": "12 → DNS Changer",
        "txt-opt-13": "13 → Wi-Fi Password Recovery",
        "txt-opt-14": "14 → Visual FX Booster",
        "txt-opt-15": "15 → Optimize WhatsApp",
        "txt-opt-16": "16 → Exit Toolkit",
        "txt-opt-l": "L → Change Language",
        /* MENU_TRANS_EN_END */
    "txt-tip-title": "Tip:",
    "txt-tip-desc": "Use <b>Menu [0] Compact OS</b> if your C: drive is full. Always backup important data before performing deep system maintenance.",
    "txt-feat-title": "Key Feature Explanation",
    "txt-fl-t": "Change Language (Menu L):",
    "txt-fl-d": "Switches the toolkit's interactive console interface between English and Indonesian instantly.",
    "txt-f0-t": "Compact OS (Menu 0):",
    "txt-f0-d": "A powerful Windows feature that compresses system binaries. It is 100% safe, reversible, and can instantly free up <b>2GB to 5GB</b> of storage space without deleting any files.",
    "txt-f1-t": "System Information (Menu 1):",
    "txt-f1-d": "Displays quick and detailed specifications of your computer, including CPU, RAM, Windows version, and active drive space.",
    "txt-f2-t": "Enhanced Junk Cleaner (Menu 2):",
    "txt-f2-d": "Safely removes temporary files, system log files, and browser caches (Chrome, Edge, Brave). Also cleans shader caches for <b>AMD, NVIDIA, and Intel</b> GPUs to fix game stuttering issues.",
    "txt-f3-t": "Empty Recycle Bin (Menu 3):",
    "txt-f3-d": "Instantly empties the Windows Recycle Bin for all users and drives to free up space.",
    "txt-f4-t": "Open Disk Cleanup (Menu 4):",
    "txt-f4-d": "Launches the official Windows Disk Cleanup utility (cleanmgr) for advanced system file cleanup.",
    "txt-f5-t": "Smart Uninstaller (Menu 5):",
    "txt-f5-d": "Quickly search and remove installed programs using fuzzy logic search. Just type the app name or initials!",
    "txt-f6-t": "Network Repair (Menu 6):",
    "txt-f6-d": "Runs a complete 5-step network reset: Release/Renew IP, Flush DNS, Reset Winsock, and Reset TCP/IP stack. Useful for fixing connection drops.",
    "txt-f7-t": "Power & Battery Utilities (Menu 7):",
    "txt-f7-d": "Generates a detailed HTML battery health report, configures high performance power plans, and manages system sleep states.",
    "txt-f8-t": "Memory Optimizer (Menu 8):",
    "txt-f8-d": "Instantly clears system standby memory and releases unused RAM caches, helping to speed up system responsiveness and games.",
    "txt-f9-t": "Defrag & Optimize Drives (Menu 9):",
    "txt-f9-d": "Analyzes and runs TRIM command for SSDs or defragments HDDs to maintain high drive read/write speeds.",
    "txt-f10-t": "System Health Checker (Menu 10):",
    "txt-f10-d": "Runs SFC (System File Checker) and DISM repair tools to find and fix corrupt Windows system files automatically.",
    "txt-f11-t": "Updates & Drivers Center (Menu 11):",
    "txt-f11-d": "Fixes stuck or failed Windows Updates by resetting the update services (wuauserv, bits, cryptSvc) and renaming the download cache folder.",
    "txt-f12-t": "DNS Changer (Menu 12):",
    "txt-f12-d": "Allows you to quickly change your DNS server settings to popular secure options like Google Public DNS or Cloudflare for faster, safer browsing.",
    "txt-f13-t": "Wi-Fi Password Recovery (Menu 13):",
    "txt-f13-d": "Quickly retrieves and displays saved Wi-Fi profiles and passwords on your current machine.",
    "txt-f14-t": "Visual FX Booster (Menu 14):",
    "txt-f14-d": "Optimizes system visual effects and animations to boost speed and performance, especially on older hardware.",
    "txt-f15-t": "Optimize WhatsApp (Menu 15):",
    "txt-f15-d": "Cleans cached files, logs, and unnecessary media sent/received via WhatsApp Desktop to free up gigabytes of wasted storage.",
    "txt-f16-t": "Exit Toolkit (Menu 16):",
    "txt-f16-d": "Safely closes the console window and restores your original PowerShell execution policies.",
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
    "txt-hub-desc": "Temukan serangkaian alat utilitas yang ringan, aman, dan kuat yang dirancang untuk mengoptimalkan, mengubah, dan mengotomatiskan sistem Windows Anda—kinerja murni, tanpa bloatware.",
    "txt-tab-intro": "Pengenalan",
    "txt-tab-projects": "Proyek",
    "txt-sub-tab-how": "Cara Penggunaan",
    "txt-sub-tab-changelog": "Catatan Rilis",
    "txt-bio-title": "Halo, Saya ncexs",
    "txt-bio-desc": "Saya adalah seorang developer yang sedang belajar membangun alat yang ringan & berguna untuk semua orang. Saya membuat utilitas ini untuk membantu diri saya sendiri dan orang lain mengelola sistem Windows secara efisien tanpa \"bloatware\".",
    "txt-sec-title": "Keamanan & Kepercayaan",
    "txt-sec-desc": "Alat utilitas ini 100% transparan dan open-source. Alat-alat ini tidak mengumpulkan data pribadi apa pun. Anda bebas memeriksa kodenya kapan saja.",
  
    // New UX navigation elements
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> Jelajahi Proyek Kami",
    "txt-select-project-desc": "Klik salah satu proyek di bawah untuk melihat panduan penggunaan, perintah manual, dan riwayat versi lengkap.",
    "txt-back-home": "Kembali ke Beranda",
    "txt-cta-tk-home": "Lihat Panduan &rarr;",
    "txt-cta-at-home": "Lihat Panduan &rarr;",
    "txt-cta-jc-home": "Lihat Panduan &rarr;",
    "txt-cta-tk-detail": "Lihat Panduan &rarr;",
    "txt-cta-at-detail": "Lihat Panduan &rarr;",
    "txt-cta-jc-detail": "Lihat Panduan &rarr;",

    // Toolkit Intro
    "txt-tk-intro-desc": "Konsol utilitas PowerShell interaktif all-in-one yang open-source. Bersihkan dengan aman, optimalkan kecepatan sistem, konfigurasi DNS, perbaiki koneksi jaringan, dan kelola Windows Update—semua dari satu antarmuka ringan tanpa instalasi.",
    "txt-tk-btn-guide": "Mulai Sekarang",
    
    // AutoTask Intro
    "txt-at-intro-desc": "Script otomatisasi latar belakang ringan untuk pemeliharaan Windows harian yang sunyi. Berjalan otomatis via Task Scheduler untuk membersihkan sampah sistem, cache shader browser, dan GPU tanpa mengganggu sesi browser aktif atau proses aplikasi.",
    "txt-at-btn-guide": "Atur Penjadwal",
    
    // Security Features Intro
    "txt-sec-feat-1-t": "Pembersihan 100% Aman",
    "txt-sec-feat-1-d": "Ditargetkan ketat hanya ke folder temporary dan file cache sistem/browser. File pribadi, password, riwayat browser, cookie, dan data autentikasi Anda sepenuhnya aman.",
    "txt-sec-feat-2-t": "Desain Non-Intrusif",
    "txt-sec-feat-2-d": "Didesain untuk berjalan mulus. Gunakan menu konsol interaktif kami, jalankan script sekali klik yang praktis, atau otomatiskan pembersihan senyap di latar belakang tanpa popup yang mengganggu.",
    "txt-sec-feat-3-t": "Deteksi Proses Pintar",
    "txt-sec-feat-3-d": "Script kami secara cerdas memeriksa aplikasi aktif sebelum melakukan pembersihan. Jika browser sedang digunakan, cache akan dilewati demi menjaga sesi database dan tab Anda tetap aman.",
    "txt-sec-feat-4-t": "100% Bebas Virus",
    "txt-sec-feat-4-d": "Diuji dan terverifikasi 100% bersih oleh VirusTotal. Alat kami sama sekali tidak mengandung malware, spyware, atau kode berbahaya, menjamin sistem Anda tetap sepenuhnya aman.",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "Script Batch (.bat) klasik, ringan, dan super cepat untuk optimasi Windows satu klik. Didesain praktis, aman membersihkan direktori sampah, Recycle Bin, log riwayat, dan memicu pelepasan RAM sistem yang tersumbat.",
    "txt-jc-btn-guide": "Unduh Rilis",
  
    // Toolkit Guide
    "txt-how-title": "Cara Menggunakan - ncexs Toolkit",
    "txt-quick-title": "Perintah Cepat (Tanpa Perlu Download)",
    "txt-quick-1": "Buka <b>Start Menu</b>, ketik <b>powershell</b>, klik kanan lalu pilih <b>Run as Administrator</b>.",
    "txt-quick-2": "Copy dan paste perintah di bawah ini, lalu tekan <b>Enter</b>:",
    "txt-quick-3": "Toolkit akan langsung terbuka secara otomatis.",
    "txt-quick-4-1": "Untuk membatalkan atau menghentikan proses yang sedang berjalan, tekan <b>Ctrl + C</b>.",
    "txt-quick-4-2": "Untuk kembali menggunakan toolkit, cukup salin dan tempel (copas) kembali perintah di bawah ini:",
    "txt-menu-title": "Pilihan Menu Interaktif",
    /* MENU_TRANS_ID_START */
        "txt-opt-q": "<b>Q → Perbaikan Cepat (Disarankan)</b>",
        "txt-opt-0": "<b>0 → Compact OS (Hemat 2-5GB Space)</b>",
        "txt-opt-1": "1 → Informasi Sistem",
        "txt-opt-2": "2 → Pembersih Sampah (Enhanced)",
        "txt-opt-3": "3 → Kosongkan Recycle Bin",
        "txt-opt-4": "4 → Buka Disk Cleanup",
        "txt-opt-5": "5 → Smart Uninstaller",
        "txt-opt-6": "6 → Perbaikan Jaringan",
        "txt-opt-7": "7 → Utilitas Daya & Baterai",
        "txt-opt-8": "8 → Optimasi Memori",
        "txt-opt-9": "9 → Defragment & Optimasi Drive",
        "txt-opt-10": "10 → Pemeriksa Kesehatan Sistem",
        "txt-opt-11": "11 → Pusat Update & Driver",
        "txt-opt-12": "12 → Pengubah DNS",
        "txt-opt-13": "13 → Wi-Fi Password Recovery",
        "txt-opt-14": "14 → Visual FX Booster",
        "txt-opt-15": "15 → Optimasi WhatsApp",
        "txt-opt-16": "16 → Keluar Aplikasi",
        "txt-opt-l": "L → Ubah Bahasa",
        /* MENU_TRANS_ID_END */
    "txt-tip-title": "Tips:",
    "txt-tip-desc": "Gunakan <b>Menu [0] Compact OS</b> jika drive C: penuh. Selalu backup data penting sebelum melakukan perawatan sistem mendalam.",
    "txt-feat-title": "Penjelasan Fitur Utama",
    "txt-fl-t": "Ubah Bahasa (Menu L):",
    "txt-fl-d": "Mengubah bahasa tampilan konsol interaktif toolkit antara Bahasa Inggris dan Bahasa Indonesia secara instan.",
    "txt-f0-t": "Compact OS (Menu 0):",
    "txt-f0-d": "Fitur Windows yang kuat untuk mengompres file sistem. 100% aman, bisa dibatalkan, dan instan menghemat <b>2GB hingga 5GB</b> ruang penyimpanan tanpa menghapus file pribadi.",
    "txt-f1-t": "Informasi Sistem (Menu 1):",
    "txt-f1-d": "Menampilkan spesifikasi komputer Anda dengan cepat dan detail, termasuk CPU, RAM, versi Windows, serta sisa ruang drive yang aktif.",
    "txt-f2-t": "Enhanced Junk Cleaner (Menu 2):",
    "txt-f2-d": "Menghapus file sementara, file log sistem, dan cache browser (Chrome, Edge, Brave) dengan aman. Juga membersihkan cache shader untuk GPU <b>AMD, NVIDIA, dan Intel</b> guna mengatasi masalah patah-patah (stuttering) saat bermain game.",
    "txt-f3-t": "Kosongkan Recycle Bin (Menu 3):",
    "txt-f3-d": "Mengosongkan Recycle Bin secara instan untuk semua pengguna dan drive untuk melegakan penyimpanan.",
    "txt-f4-t": "Buka Disk Cleanup (Menu 4):",
    "txt-f4-d": "Membuka utilitas bawaan Windows Disk Cleanup (cleanmgr) untuk pembersihan file sistem tingkat lanjut.",
    "txt-f5-t": "Smart Uninstaller (Menu 5):",
    "txt-f5-d": "Cari dan hapus program terinstall dengan cepat menggunakan pencarian pintar. Cukup ketik nama aplikasi atau inisialnya!",
    "txt-f6-t": "Perbaikan Jaringan (Menu 6):",
    "txt-f6-d": "Menjalankan reset jaringan 5 langkah: Release/Renew IP, Flush DNS, Reset Winsock, dan Reset stack TCP/IP. Berguna untuk memperbaiki koneksi yang sering putus.",
    "txt-f7-t": "Utilitas Daya & Baterai (Menu 7):",
    "txt-f7-d": "Membuat laporan kesehatan baterai secara detail dalam format HTML, mengatur skema daya kinerja tinggi, dan mengelola mode tidur sistem.",
    "txt-f8-t": "Optimasi Memori (Menu 8):",
    "txt-f8-d": "Membersihkan standby memory dan melepaskan cache RAM yang tidak terpakai secara instan untuk mempercepat respons sistem dan game.",
    "txt-f9-t": "Defragment & Optimasi Drive (Menu 9):",
    "txt-f9-d": "Menganalisis dan menjalankan perintah TRIM untuk SSD atau mendefrag HDD guna mempertahankan kecepatan baca/tulis penyimpanan yang optimal.",
    "txt-f10-t": "Pemeriksa Kesehatan Sistem (Menu 10):",
    "txt-f10-d": "Menjalankan SFC (System File Checker) dan DISM repair tools untuk mencari dan memperbaiki file sistem Windows yang rusak atau korup secara otomatis.",
    "txt-f11-t": "Pusat Update & Driver (Menu 11):",
    "txt-f11-d": "Memperbaiki Windows Update yang macet atau gagal dengan mereset layanan update (wuauserv, bits, cryptSvc) and mengganti nama folder cache download.",
    "txt-f12-t": "Pengubah DNS (Menu 12):",
    "txt-f12-d": "Mempermudah Anda mengubah pengaturan DNS sistem ke penyedia DNS aman terpopuler seperti Google Public DNS atau Cloudflare demi koneksi yang lebih cepat dan aman.",
    "txt-f13-t": "Wi-Fi Password Recovery (Menu 13):",
    "txt-f13-d": "Melihat kembali profil dan kata sandi Wi-Fi yang tersimpan di komputer Anda dengan cepat.",
    "txt-f14-t": "Visual FX Booster (Menu 14):",
    "txt-f14-d": "Mengoptimalkan efek visual dan animasi Windows untuk meningkatkan kecepatan dan performa sistem, sangat berguna pada PC spesifikasi rendah.",
    "txt-f15-t": "Optimasi WhatsApp (Menu 15):",
    "txt-f15-d": "Membersihkan file cache, file log, dan file media tidak penting dari WhatsApp Desktop untuk membebaskan ruang penyimpanan berukuran gigabyte.",
    "txt-f16-t": "Keluar Aplikasi (Menu 16):",
    "txt-f16-d": "Keluar dari jendela konsol toolkit dengan aman dan mengembalikan kebijakan eksekusi (execution policy) PowerShell Anda ke semula.",
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
    "txt-how-jc-title": "Cara Menggunakan - ncexs Junk Cleaner",
    "txt-jc-run-title": "Petunjuk Sekali Klik",
    "txt-jc-step-1": "Unduh rilis ZIP terbaru dari <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "Ekstrak file ZIP yang telah diunduh.",
    "txt-jc-step-3": "Double-click file <code class='code-inline'>ncexs-junkcleaner.bat</code> untuk memulai program.",
    "txt-jc-step-4": "Jika muncul peringatan SmartScreen ('Windows protected your PC'), klik <b>More info</b> → <b>Run anyway</b>.",
    "txt-jc-step-5": "Berikan akses Administrator saat diminta oleh User Account Control (UAC).",
    "txt-jc-step-6": "Ikuti petunjuk di layar (ketik <code class='code-inline'>Y</code> atau <code class='code-inline'>N</code>) untuk: Junk Cleaner, Deep Cleanup, Antivirus Quick Scan, atau optimasi RAM."
  },
  ja: {
    "txt-lang-label": "言語を選択:",
    "txt-hub-subtitle": "PC本来の性能を最大限に引き出す",
    "txt-hub-desc": "Windows環境を最適化、クリーンアップ、自動化するために開発された、軽量で安全、かつ強力な厳選オープンソースツール群。純粋なパフォーマンスを追求し、不要な機能（ブロートウェア）は一切ありません。",
    "txt-tab-intro": "イントロダクション",
    "txt-tab-projects": "プロジェクト",
    "txt-sub-tab-how": "使い方",
    "txt-sub-tab-changelog": "変更履歴",
    "txt-bio-title": "こんにちは、ncexsです",
    "txt-bio-desc": "私は誰もが手軽に使える、軽量で実用的なツールの作り方を学んでいる開発者です。自分自身や他の人々が、無駄なソフトウェアなしで効率的にWindowsシステムを管理できるよう、これらのユーティリティを作成しました。",
    "txt-sec-title": "安全管理と信頼性",
    "txt-sec-desc": "これらのユーティリティは100%透明化されたオープンソースです。個人情報は一切収集しません。いつでも自由にコードを監査していただけます。",
    
    // New UX navigation elements
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> プロジェクトを探索する",
    "txt-select-project-desc": "以下のプロジェクトをクリックすると、詳細な使い方ガイド、手動実行コマンド、および完全なバージョン履歴をご覧いただけます。",
    "txt-back-home": "ホームに戻る",
    "txt-cta-tk-home": "ガイドを見る &rarr;",
    "txt-cta-at-home": "ガイドを見る &rarr;",
    "txt-cta-jc-home": "ガイドを見る &rarr;",
    "txt-cta-tk-detail": "ガイドを見る &rarr;",
    "txt-cta-at-detail": "ガイドを見る &rarr;",
    "txt-cta-jc-detail": "ガイドを見る &rarr;",

    // Toolkit Intro
    "txt-tk-intro-desc": "オープンソースでインタラクティブなオールインワンPowerShellコンソール。インストール不要の軽量インターフェースから、安全なクリーンアップ、システム速度の最適化、DNS構成、ネットワーク修復、Windows Updateの管理などをすべて実行できます。",
    "txt-tk-btn-guide": "今すぐ始める",
    
    // AutoTask Intro
    "txt-at-intro-desc": "バックグラウンドで動作する、日常のWindowsメンテナンス用軽量自動化スクリプト。タスクスケジューラを介して自動実行され、アクティブなブラウザセッションやアプリに影響を与えずに、システムゴミ、ブラウザのシェーダーキャッシュ、GPUキャッシュを安全にクリーンアップします。",
    "txt-at-btn-guide": "スケジューラの設定",
    
    // Security Features Intro
    "txt-sec-feat-1-t": "100%安全なクリーンアップ",
    "txt-sec-feat-1-d": "一時フォルダ（Temp）やシステム/ブラウザのキャッシュのみを対象に、厳しく安全に削除します。個人ファイル、パスワード、ブラウザ履歴、クッキー、およびログイン情報は一切変更されません。",
    "txt-sec-feat-2-t": "システムへの負担が極少な設計",
    "txt-sec-feat-2-d": "バックグラウンドでスムーズに稼働するように設計されています。インタラクティブなコンソールメニューを使用する、シンプルな1クリック自動実行スクリプトを使用する、または一切のポップアップなしでサイレントに最適化できます。",
    "txt-sec-feat-3-t": "スマートな実行プロセス検出",
    "txt-sec-feat-3-d": "クリーンアップを行う前に、動作中のアプリを高度に検知。ブラウザがアクティブな場合は自動的にそのキャッシュ処理をスキップし、開き中のデータベースセッションやタブを保護します。",
    "txt-sec-feat-4-t": "100%ウイルスフリー",
    "txt-sec-feat-4-d": "VirusTotalによって100%安全かつクリーンであるとテスト・実証されています。スパイウェア、アドウェア、悪意のあるマルウェアの要素は一切含まれていません。",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "クラシックで軽量、そして超高速な1クリックWindows最適化バッチスクリプト（.bat）。シンプルかつ安全に設計されており、一時フォルダのクリーンアップ、ごみ箱の空化、システムログ履歴の消去、およびRAMキャッシュの解放を直接実行します。",
    "txt-jc-btn-guide": "リリースの取得",
    
    // Toolkit Guide
    "txt-how-title": "使い方 - ncexs Toolkit",
    "txt-quick-title": "クイック実行 (ダウンロード不要)",
    "txt-quick-1": "<b>スタートメニュー</b>を開き、<b>powershell</b>と入力して右クリックし、<b>[管理者として実行]</b>を選択します。",
    "txt-quick-2": "以下のコマンドをコピーして貼り付け、<b>Enter</b>キーを押します:",
    "txt-quick-3": "ツールキットが自動的に起動します。",
    "txt-quick-4-1": "実行中のプロセスをキャンセル、または途中で終了するには、<b>Ctrl + C</b>キーを押してください。",
    "txt-quick-4-2": "再びツールキットに戻って使用するには、以下のコマンドをコピーしてもう一度貼り付けるだけでOKです:",
    "txt-menu-title": "インタラクティブメニューのオプション",
    /* MENU_TRANS_JA_START */
        "txt-opt-0": "<b>0 → Compact OS (2-5GB容量を圧縮解放)</b>",
        "txt-opt-1": "1 → システム情報の表示",
        "txt-opt-2": "2 → 拡張ジャンククリーナー",
        "txt-opt-3": "3 → ごみ箱を空にする",
        "txt-opt-4": "4 → ディスククリーンアップ",
        "txt-opt-5": "5 → スマートアンインストーラー",
        "txt-opt-6": "6 → ネットワーク修復とリセット",
        "txt-opt-7": "7 → 電源＆バッテリーユーティリティ",
        "txt-opt-8": "8 → メモリ（RAM）最適化",
        "txt-opt-9": "9 → ドライブ最適化とデフラグ",
        "txt-opt-10": "10 → システム修復チェッカー",
        "txt-opt-11": "11 → 更新プログラム＆ドライバー",
        "txt-opt-12": "12 → 超高速DNSの適用設定",
        "txt-opt-13": "13 → Wi-Fiパスワード復元表示",
        "txt-opt-14": "14 → 視覚効果ブースター",
        "txt-opt-15": "15 → WhatsAppの最適化",
        "txt-opt-16": "16 → ツールキットの終了",
        "txt-opt-l": "L → 表示言語の変更",
        /* MENU_TRANS_JA_END */
    "txt-tip-title": "ヒント:",
    "txt-tip-desc": "C:ドライブの空き容量が不足している場合は、<b>メニュー [0] Compact OS</b>をご使用ください。システムの大規模なメンテナンス前には、必ず重要なデータのバックアップを行ってください。",
    "txt-feat-title": "主要機能の説明",
    "txt-fl-t": "言語の変更 (メニュー L):",
    "txt-fl-d": "ツールキットのコンソールインターフェースの言語を英語とインドネシア語の間で瞬時に切り替えます。",
    "txt-f0-t": "Compact OS (メニュー 0):",
    "txt-f0-d": "システムファイルを圧縮する強力なWindows機能。100%安全で可逆的（元に戻せる）であり、個人のファイルを一切削除せずに瞬時に<b>2GBから5GB</b>の容量を解放できます。",
    "txt-f1-t": "システム情報 (メニュー 1):",
    "txt-f1-d": "CPU、RAM、Windowsのバージョン、現在の各ドライブの空き容量など、PCの詳細なスペック情報をすばやく表示します。",
    "txt-f2-t": "拡張ジャンククリーナー (メニュー 2):",
    "txt-f2-d": "一時ファイル、システムログファイル、および各種ブラウザキャッシュ（Chrome、Edge、Brave）を安全にクリーンアップします。<b>AMD、NVIDIA、Intel</b>のGPUシェーダーキャッシュも削除し、ゲームの遅延・カクつき問題を解消します。",
    "txt-f3-t": "ごみ箱を空にする (メニュー 3):",
    "txt-f3-d": "全ユーザーおよび全ドライブのごみ箱の中身をすばやく空にし、ストレージ容量を解放します。",
    "txt-f4-t": "ディスククリーンアップの起動 (メニュー 4):",
    "txt-f4-d": "Windows公式のディスククリーンアップユーティリティ（cleanmgr）を直接起動し、高度なシステムクリーンアップを実行します。",
    "txt-f5-t": "スマートアンインストーラー (メニュー 5):",
    "txt-f5-d": "あいまい検索機能（Fuzzy Search）を用いて、インストールされているアプリを高速検索。アプリ名の頭文字を入力するだけで安全にアンインストールできます。",
    "txt-f6-t": "ネットワーク修復 (メニュー 6):",
    "txt-f6-d": "IPの再取得、DNSキャッシュクリア、Winsockリセット、TCP/IPスタック再構築を含む包括的な5ステップの接続リセットを実行し、ネット障害を解消します。",
    "txt-f7-t": "電源とバッテリーユーティリティ (メニュー 7):",
    "txt-f7-d": "詳細なバッテリー健康状態レポート（HTML形式）を生成し、高パフォーマンス電源プランを構成してスリープ状態を高度に管理します。",
    "txt-f8-t": "メモリ最適化 (メニュー 8):",
    "txt-f8-d": "スタンバイメモリや未使用のRAMキャッシュを瞬時に一括解放し、システム応答速度やゲーム中のパフォーマンスを向上させます。",
    "txt-f9-t": "ドライブ最適化とデフラグ (メニュー 9):",
    "txt-f9-d": "SSD向けにTRIMコマンドを安全に実行、またはHDD向けに最適化（デフラグ）処理を実行し、高速な読み書き速度を維持します。",
    "txt-f10-t": "システム修復チェッカー (メニュー 10):",
    "txt-f10-d": "SFC（システムファイルチェッカー）とDISM自動修復スキャンを実行し、破損したコアWindowsファイルを検索・自動復旧します。",
    "txt-f11-t": "更新プログラム＆ドライバーセンター (メニュー 11):",
    "txt-f11-d": "Windows Updateサービス（wuauserv、bits、cryptSvc）を一時的に安全リセットし、キャッシュ破損フォルダをリネームすることでアップデートの進行エラーを解消します。",
    "txt-f12-t": "DNSチェンジャー (メニュー 12):",
    "txt-f12-d": "Google Public DNSやCloudflareなどの安全で超高速なパブリックDNSサーバーに、設定をすばやく安全に切り替えます。",
    "txt-f13-t": "Wi-Fiパスワード復元 (メニュー 13):",
    "txt-f13-d": "現在お使いのPC内に過去に保存されたすべてのWi-Fiプロファイル名と接続パスワードを瞬時に検出し、一覧表示します。",
    "txt-f14-t": "Visual FXブースター (メニュー 14):",
    "txt-f14-d": "余計なアニメーションや視覚効果を最適化し、低スペックPCや古いハードウェアでのレスポンスと快適性を高めます。",
    "txt-f15-t": "WhatsAppの最適化 (メニュー 15):",
    "txt-f15-d": "WhatsApp Desktop経由で送受信され、内部に溜まった一時ファイルをクリアし、ギガバイト単位の不要なストレージ浪費を解消します。",
    "txt-f16-t": "ツールキットの終了 (メニュー 16):",
    "txt-f16-d": "コンソールウィンドウを安全に閉じ、一時的に適用していたPowerShell実行ポリシーを元の安全な既定状態に自動復元します。",
    "txt-cl-title": "バージョン履歴 / 変更ログ",
    "txt-cl-desc": "ncexs Toolkitの最新の更新内容および機能追加の一覧。",

    // AutoTask Guide
    "txt-how-at-title": "使い方 - ncexs AutoTask",
    "txt-at-dl-title": "スクリプトのダウンロード",
    "txt-at-dl-desc": "GitHub公式リポジトリからPowerShell自動化スクリプトファイルを直接ダウンロードします:",
    "txt-at-dl-btn": "ncexs-AutoTask.ps1 をダウンロード",
    "txt-at-manual-title": "手動実行コマンド",
    "txt-at-manual-1": "<b>PowerShell</b> を開きます（管理者として実行を推奨）。",
    "txt-at-manual-2": "以下のコマンドを実行してスクリプトをローカルで呼び出します:",
    "txt-at-sched-title": "タスクスケジューラによる自動化 (推奨)",
    "txt-at-step-1": "<b>タスクスケジューラを起動する</b><p>キーボードの <b>Win + R</b> を押し、<code class='code-inline'>taskschd.msc</code> と入力して <b>Enter</b> キーを押します。</p>",
    "txt-at-step-2": "<b>新しいタスクの作成</b><p>右側のペインで <b>[タスクの作成...]</b>（基本タスクの作成ではありません）をクリックし、<b>[全般]</b>タブを設定します:</p><ul><li>名前: <code class='code-inline'>ncexs Auto Task</code></li><li>チェック: <b>「ユーザーがログオンしているかどうかにかかわらず実行する」</b></li><li>チェック: <b>「最上位の特権で実行する」</b></li></ul>",
    "txt-at-step-3": "<b>トリガー（スケジュール）の構成</b><p><b>[トリガー]</b>タブを開いて <b>[新規...]</b> をクリックします。タスクの開始を<b>「スケジュールに従う」</b>にし、<b>[毎日]</b>を選択します。必要に応じて「繰り返し間隔」にチェックを入れ、<code class='code-inline'>6時間</code> と入力し、継続期間を<b>「無期限」</b>にします。</p>",
    "txt-at-step-4": "<b>操作（アクション）の構成</b><p><b>[操作]</b>タブを開いて <b>[新規...]</b> をクリックし、操作を<b>「プログラムの開始」</b>に設定します:</p><ul><li>プログラム/スクリプト: <code class='code-inline'>powershell.exe</code></li><li>引数の追加: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>（スクリプトファイルを実際に保存した絶対パスに書き換えてください。テスト時は -Silent を省いてデバッグ可能です）</i></li></ul>",
    "txt-at-step-5": "<b>条件の構成</b><p><b>[条件]</b>タブで、<b>「コンピューターをAC電源で使用している場合のみタスクを開始する」</b>のチェックを外します（ノートPCなどでバッテリー駆動時も自動動作させるためです）。</p>",
    "txt-at-step-6": "<b>設定と保存</b><p><b>[設定]</b>タブで、<b>「スケジュールされた時刻にタスクを開始できなかった場合、すぐにタスクを実行する」</b>にチェックを入れます。最後に <b>[OK]</b> をクリックし、必要に応じてWindows管理者パスワードを入力します。</p>",

    // Junk Cleaner Guide
    "txt-how-jc-title": "使い方 - ncexs Junk Cleaner",
    "txt-jc-run-title": "1クリッククイック起動の手順",
    "txt-jc-step-1": "公式の <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a> ページから、最新のリリースZIPファイルをダウンロードします。",
    "txt-jc-step-2": "ダウンロードしたZIP圧縮ファイルをローカルフォルダーに展開（解凍）します。",
    "txt-jc-step-3": "<code class='code-inline'>ncexs-junkcleaner.bat</code> ファイルをダブルクリックしてスクリプトを直接実行します。",
    "txt-jc-step-4": "SmartScreenによる防御ダイアログ（「WindowsによってPCが保護されました」）が表示された場合は、<b>[詳細情報]</b>をクリックし、<b>[実行]</b>ボタンを押してください。",
    "txt-jc-step-5": "ユーザーアカウント制御 (UAC) 画面が表示されたら、<b>[はい]</b> を選択して管理者権限を許可します。",
    "txt-jc-step-6": "画面に表示される選択肢（キーボードの <code class='code-inline'>Y</code> または <code class='code-inline'>N</code>）に従って決定します: ジャンククリーナー、ディープクリーンアップ、アンチウイルス簡易スキャン、RAM最適化などをお好みで構成できます。"
  },
  ko: {
    "txt-lang-label": "언어 선택:",
    "txt-hub-subtitle": "PC의 숨겨진 잠재력을 극대화하다",
    "txt-hub-desc": "불필요한 무거운 소프트웨어(Bloatware)를 완전히 배제하고, Windows 성능 최적화, 정리, 자동화를 위해 정성껏 선별된 고성능 초경량 및 안전 오픈소스 도구 모음입니다.",
    "txt-tab-intro": "소개",
    "txt-tab-projects": "프로젝트 목록",
    "txt-sub-tab-how": "사용 방법",
    "txt-sub-tab-changelog": "업데이트 기록",
    "txt-bio-title": "안녕하세요, ncexs입니다",
    "txt-bio-desc": "저는 모든 사용자를 위한 빠르고 가벼우며 실용적인 컴퓨터 최적화 도구를 연구하고 개발 중인 개발자입니다. 불필요하고 무거운 시스템 정리 백그라운드 프로그램 없이 사용자가 컴퓨터를 스스로 쾌적하게 유지하도록 이 보조 유틸리티들을 제작했습니다.",
    "txt-sec-title": "투명성과 보안 보장",
    "txt-sec-desc": "본 유틸리티들은 100% 투명한 오픈소스로 제공됩니다. 어떠한 개인정보도 전혀 수집하지 않으므로, 언제나 자유롭게 소스 코드를 감사하고 신뢰할 수 있습니다.",
    
    // New UX navigation elements
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> 프로젝트 탐색",
    "txt-select-project-desc": "아래 프로젝트를 선택하시면 상세한 사용 설명서, 수동 실행 명령 블록, 및 완전한 전체 버전 변경 이력을 확인할 수 있습니다.",
    "txt-back-home": "홈으로 돌아가기",
    "txt-cta-tk-home": "가이드 보기 &rarr;",
    "txt-cta-at-home": "가이드 보기 &rarr;",
    "txt-cta-jc-home": "가이드 보기 &rarr;",
    "txt-cta-tk-detail": "가이드 보기 &rarr;",
    "txt-cta-at-detail": "가이드 보기 &rarr;",
    "txt-cta-jc-detail": "가이드 보기 &rarr;",

    // Toolkit Intro
    "txt-tk-intro-desc": "안전한 원클릭 정리는 물론 시스템 지연 속도 개선, DNS 서버 변환, 네트워크 트러블 복구, 윈도우 보안 업데이트 오류 재부팅 처리를 설치 없이 완벽하게 실행하는 가볍고 직관적인 대화형 PowerShell 콘솔 유틸리티입니다.",
    "txt-tk-btn-guide": "지금 시작하기",
    
    // AutoTask Intro
    "txt-at-intro-desc": "스케줄러와 조용히 연동되어 매일 실행되는 무소음 백그라운드 윈도우 유지보수 스크립트입니다. 사용 중인 브라우저 세션이나 작업 중인 업무 흐름을 차단하지 않으며 임시파일 및 누적된 브라우저/GPU 셰이더 캐시를 묵묵히 정비합니다.",
    "txt-at-btn-guide": "스케줄러 등록",
    
    // Security Features Intro
    "txt-sec-feat-1-t": "100% 안전한 파일 정리",
    "txt-sec-feat-1-d": "시스템 임시 파일 및 시스템/브라우저가 누적해둔 정크 캐시 데이터만을 전담 타겟팅합니다. 개인 보관용 문서, 사진, 암호화 패스워드 저장고, 브라우저 방문 기록, 로그인 세션 쿠키는 엄격하게 보호되어 안심하셔도 좋습니다.",
    "txt-sec-feat-2-t": "리소스를 잡아먹지 않는 최적 설계",
    "txt-sec-feat-2-d": "가볍고 완벽한 구동을 지향합니다. 직접 마우스를 누를 필요 없이 간단한 원터치 버튼 메뉴로 실행하거나, 어떤 성가신 알림 팝업도 띄우지 않고 투명하게 동작하도록 구성할 수 있습니다.",
    "txt-sec-feat-3-t": "지능형 활성 프로세스 우회",
    "txt-sec-feat-3-d": "청소 단계 전 사용 중인 브라우저가 있는지 스스로 선행 분석합니다. 크롬이나 엣지가 켜져 있을 땐 작동 중인 탭과 활성화된 데이터베이스의 세션 손실을 피하기 위해 센스 있게 패스합니다.",
    "txt-sec-feat-4-t": "100% 안심 바이러스 프리 보장",
    "txt-sec-feat-4-d": "VirusTotal에서 공식 검진 결과 탐지율 0%로 판명된 무결점 청정 도구입니다. 악성 광고 프로그램, 개인정보를 해치는 스파이웨어 등이 전혀 없어 믿을 수 있습니다.",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "클래식하고 가벼우며 매우 빠른 원클릭 Windows 최적화 배치 스크립트(.bat)입니다. 간결하고 안전하게 고안되어 임시 디렉토리 정리, 휴지통 비우기, 사용 이력 로그 삭제 및 RAM 캐시 플러시를 즉각 수행합니다.",
    "txt-jc-btn-guide": "릴리즈 받기",

    // Toolkit Guide
    "txt-how-title": "사용 방법 - ncexs Toolkit",
    "txt-quick-title": "빠른 실행 (무설치 구동)",
    "txt-quick-1": "윈도우 <b>시작 메뉴</b>를 열고, <b>powershell</b>을 검색한 후 마우스 우클릭하여 <b>[관리자 권한으로 실행]</b>을 누릅니다.",
    "txt-quick-2": "아래의 원클릭 명령줄을 복사한 후 붙여넣고 <b>Enter</b> 키를 눌러주세요:",
    "txt-quick-3": "콘솔 형태의 툴킷이 즉시 활성화되어 열립니다.",
    "txt-quick-4-1": "동작 중인 최적화 작업을 안전하게 취소하거나 멈추려면, 콘솔에서 <b>Ctrl + C</b> 단축키를 눌러주십시오.",
    "txt-quick-4-2": "언제든 툴킷으로 복귀하여 다시 사용하려면, 아래의 구동 명령줄을 복사해 한 번 더 입력해주시면 복구됩니다:",
    "txt-menu-title": "대화형 제어 인터페이스 옵션",
    /* MENU_TRANS_KO_START */
        "txt-opt-0": "<b>0 → Compact OS (2-5GB 압축 용량 확보)</b>",
        "txt-opt-1": "1 → 시스템 사양 정보 분석",
        "txt-opt-2": "2 → 확장 정크 및 캐시 정리",
        "txt-opt-3": "3 → 로컬 휴지통 일괄 비우기",
        "txt-opt-4": "4 → 디스크 정리 유틸리티 호출",
        "txt-opt-5": "5 → 고속 초성 앱 언인스톨러",
        "txt-opt-6": "6 → 네트워크 연결 리셋 복구",
        "txt-opt-7": "7 → 전원 구성 및 배터리 레포트",
        "txt-opt-8": "8 → 시스템 대기 메모리 반환",
        "txt-opt-9": "9 → 드라이브 조율 및 최적화",
        "txt-opt-10": "10 → 시스템 자가진단 (SFC/DISM)",
        "txt-opt-11": "11 → 업데이트 오류 청산 센터",
        "txt-opt-12": "12 → 안전 고성능 DNS 서버 변환",
        "txt-opt-13": "13 → 저장된 Wi-Fi 패스워드 추출",
        "txt-opt-14": "14 → 성능 지향 비주얼 옵션 보완",
        "txt-opt-15": "15 → WhatsApp 메신저 최적화",
        "txt-opt-16": "16 → 대화형 툴킷 프로그램 종료",
        "txt-opt-l": "L → 인터페이스 표시 언어 변경",
        /* MENU_TRANS_KO_END */
    "txt-tip-title": "유용한 팁:",
    "txt-tip-desc": "C: 드라이브 여유공간이 빠듯한 경우 <b>메뉴 [0] Compact OS</b>를 시도해보세요. 무거운 시스템 변경 전에는 항상 중요한 데이터를 미리 백업해 두는 습관이 좋습니다.",
    "txt-feat-title": "핵심 탑재 기술 설명",
    "txt-fl-t": "언어팩 조절 (메뉴 L):",
    "txt-fl-d": "콘솔 도구의 다국어 전환을 지원하여, 영어와 인도네시아어로 표현 환경을 빠르게 전환해줍니다.",
    "txt-f0-t": "Compact OS (메뉴 0):",
    "txt-f0-d": "윈도우 자체의 고유 압축 기능을 활용해 시스템 바이너리를 안전하게 압축합니다. 100% 복구 가능하며, 내 중요한 문서와 파일을 단 하나도 건드리지 않고 <b>2GB에서 최대 5GB</b>에 달하는 용량을 실시간 확보합니다.",
    "txt-f1-t": "시스템 디테일 분석 (메뉴 1):",
    "txt-f1-d": "내 컴퓨터의 주요 하드웨어 스펙인 CPU, RAM 탑재량, Windows의 커널 릴리즈 정보, 활성화된 로컬 디바이스 용량을 명쾌하게 보고해줍니다.",
    "txt-f2-t": "스마트 시스템 정비 (메뉴 2):",
    "txt-f2-d": "불필요한 시스템 임시 리포트, 브라우저 가중 캐시(크롬, 웨일, 엣지)를 정밀 조준 세척합니다. 추가로 <b>AMD, NVIDIA, Intel</b> 그래픽 처리장치의 셰이더 캐시도 정비해 스터터링 현상을 완화합니다.",
    "txt-f3-t": "휴지통 자동 청소 (메뉴 3):",
    "txt-f3-d": "모든 디렉토리 및 로컬 계정들의 윈도우 휴지통 잔존 파일을 완전 영구 삭제하여 수동 마우스 클릭의 수고를 덜어줍니다.",
    "txt-f4-t": "Disk Cleanup 실행 (메뉴 4):",
    "txt-f4-d": "OS 기본 내장 유틸리티인 cleanmgr을 직접 호출해 불필요하게 남아있는 업데이트 캐시 파일 등 고급 정리 마법사를 구동합니다.",
    "txt-f5-t": "고속 프로그램 삭제 (메뉴 5):",
    "txt-f5-d": "지능형 검색 기능을 탑재하여 프로그램 이름 일부나 초성 및 영문 철자만 입력해도 설치 리스트에서 식별하여 원스톱 제거해줍니다.",
    "txt-f6-t": "인터넷 망 복구 (메뉴 6):",
    "txt-f6-d": "IP 정보 갱신, DNS 캐시 플러시, Winsock 복원, TCP/IP 오버헤드 초기화를 묶어 연결 끊김 현상을 해결하는 5단계 네트워크 재수립 작업을 엽니다.",
    "txt-f7-t": "전원 및 배터리 분석 (메뉴 7):",
    "txt-f7-d": "HTML 규격으로 배터리 열화 수치 및 상태 보고서를 만들고, 고성능 전원 프로필 세팅과 세부 전원 대기 단계를 체계적으로 설정합니다.",
    "txt-f8-t": "메모리 점유율 완화 (메뉴 8):",
    "txt-f8-d": "가용 자원을 과도하게 잡고 있는 시스템 대기 영역 및 캐싱 메모리 잔여분을 청소해 게임 반응성과 전반적인 체감 로딩 속도를 향상시킵니다.",
    "txt-f9-t": "드라이브 보존 트림 (메뉴 9):",
    "txt-f9-d": "SSD의 효율 유지를 돕는 TRIM 명령을 실행하거나 HDD의 내부 저장 최적화 처리를 병행해 읽기/쓰기 지속 속도를 가다듬습니다.",
    "txt-f10-t": "시스템 진단 및 자가치유 (메뉴 10):",
    "txt-f10-d": "윈도우 코어 파일의 교란 여부를 체크하는 SFC 및 DISM 원격 레포지토리 복구를 가동해 알 수 없는 프리징이나 크래시 잦은 오류를 복원합니다.",
    "txt-f11-t": "업데이트 오류 전담팀 (메뉴 11):",
    "txt-f11-d": "진행이 멈춘 윈도우 업데이트 서비스를 잠시 비활성하고 다운로드 파일 경로를 리셋하여 고질적인 업데이트 먹통 문제를 정면 돌파합니다.",
    "txt-f12-t": "고성능 DNS 이식 (메뉴 12):",
    "txt-f12-d": "인터넷 응답 반응이 빠른 검증된 퍼블릭 서버(구글 DNS, 클라우드플레어 등)로 네트워크 네임서버 세팅을 민첩하게 교정합니다.",
    "txt-f13-t": "Wi-Fi 비밀번호 발굴 (메뉴 13):",
    "txt-f13-d": "현재 연결된 디바이스에 축적된 와이파이 네트워크 SSID 기록과 기억나지 않는 이전 키를 찾아 터미널에 보여줍니다.",
    "txt-f14-t": "성능 중점 Visual FX 조율 (메뉴 14):",
    "txt-f14-d": "윈도우 내 과도하게 펼쳐진 시각 전용 트랜지션 연출들을 경량화 조율하여 구형 장비나 노트북에서 한층 기민한 조작 반응을 확보합니다.",
    "txt-f15-t": "WhatsApp 메신저 청소 (메뉴 15):",
    "txt-f15-d": "WhatsApp Desktop 사용으로 장치 내부에 누적된 미디어 프리뷰 조각, 캐시 로그 쓰레기들을 추적 및 세척해 불필요한 낭비를 예방합니다.",
    "txt-f16-t": "툴킷 안전 종료 (메뉴 16):",
    "txt-f16-d": "터미널의 환경을 안전하게 퇴장하며 임시 적용되었던 파워쉘의 구동 허가 범위를 디폴트 보안 수치로 원복 복구해줍니다.",
    "txt-cl-title": "버전 히스토리 / 업데이트 노트",
    "txt-cl-desc": "ncexs Toolkit의 누적 릴리즈 이력과 새로운 업데이트 내용 안내.",

    // AutoTask Guide
    "txt-how-at-title": "사용 방법 - ncexs AutoTask",
    "txt-at-dl-title": "보조 스크립트 수령",
    "txt-at-dl-desc": "공식 원격 리포지토리 GitHub에서 정비 전담 백그라운드 구동 스크립트를 수령합니다:",
    "txt-at-dl-btn": "ncexs-AutoTask.ps1 다운로드",
    "txt-at-manual-title": "수동 다이렉트 구동",
    "txt-at-manual-1": "<b>PowerShell</b>을 엽니다 (관리자 권한 추천).",
    "txt-at-manual-2": "다음 명령줄을 실행해 시스템 백그라운드로 스크립트를 로컬 수행합니다:",
    "txt-at-sched-title": "작업 스케줄러를 통한 자동 유지보수 (권장)",
    "txt-at-step-1": "<b>작업 스케줄러 실행</b><p>키보드의 <b>Win + R</b>을 누른 뒤 <code class='code-inline'>taskschd.msc</code>를 입력하고 <b>Enter</b>를 쳐 스케줄러를 엽니다.</p>",
    "txt-at-step-2": "<b>새 작업 정의 추가</b><p>오른쪽 메뉴판에서 <b>[작업 만들기...]</b>(기본 작업 만들기 제외)를 실행한 뒤, <b>[일반]</b> 탭에서 다음과 같이 세팅합니다:</p><ul><li>이름: <code class='code-inline'>ncexs Auto Task</code></li><li>체크: <b>\"사용자의 로그온 여부와 관계없이 실행\"</b></li><li>체크: <b>\"가장 높은 수준의 권한으로 실행\"</b></li></ul>",
    "txt-at-step-3": "<b>동작 조건 설정 (트리거)</b><p><b>[트리거]</b> 탭에서 <b>[새로 만들기...]</b>를 실행하고 시작 기준을 <b>[예약 상태]</b>로 정의한 후, <b>[매일]</b>을 찍습니다. 원할 경우 '작업 반복 간격'을 체크한 뒤 <code class='code-inline'>6시간</code>을 치고 기간을 <b>[무기한]</b>으로 적용합니다.</p>",
    "txt-at-step-4": "<b>동작 액션 추가 (동작)</b><p><b>[동작]</b> 탭에서 <b>[새로 만들기...]</b>를 열고 동작 방식을 <b>[프로그램 시작]</b>으로 정의합니다:</p><ul><li>프로그램/스크립트: <code class='code-inline'>powershell.exe</code></li><li>인수 추가: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\경로\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(스크립트가 실제 안착된 내 드라이브 경로로 수정해 주십시오. 동작 디버깅 중엔 -Silent를 빼고 테스트 가능합니다)</i></li></ul>",
    "txt-at-step-5": "<b> AC 전원 간섭 우회</b><p><b>[조건]</b> 탭으로 건너가 <b>\"컴퓨터의 AC 전원이 켜져 있는 경우에만 작업 시작\"</b>의 박스 체크를 풀어줍니다 (데스크탑 외 배터리를 쓰는 노트북 이동 상태에서도 문제없이 작업이 연동되도록 조치하는 과정입니다).</p>",
    "txt-at-step-6": "<b>설정 완료 및 작업 영구 저장</b><p><b>[설정]</b> 탭에서 <b>\"예약된 시작 시간을 놓친 경우 가능한 한 빨리 작업 실행\"</b>을 필수로 켜줍니다. 이제 <b>[확인]</b>을 누른 뒤 계정 로그인 보안 암호를 요청할 때 인증해주면 스케줄 세팅이 고정 완료됩니다.</p>",

    // Junk Cleaner Guide
    "txt-how-jc-title": "사용 방법 - ncexs Junk Cleaner",
    "txt-jc-run-title": "원클릭 퀵 배치 수동 구동",
    "txt-jc-step-1": "공식 <a href='https://github.com/ncexs/junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a> 릴리즈 리스트에서 최신 압축 배포판 ZIP을 다운로드 받습니다.",
    "txt-jc-step-2": "수령한 다운로드 ZIP 아카이브를 로컬 임의의 임계 폴더에 압축 해제합니다.",
    "txt-jc-step-3": "압축 푼 폴더의 <code class='code-inline'>ncexs-junkcleaner.bat</code> 정비 배치파일을 가볍게 더블클릭해 시작합니다.",
    "txt-jc-step-4": "만약 SmartScreen 보안 화면('Windows의 PC 보호')이 떠서 일시 저지되면, 하단의 <b>[추가 정보]</b> 링크를 연 뒤 <b>[실행]</b>을 당차게 눌러 통과합니다.",
    "txt-jc-step-5": "사용자 계정 컨트롤(UAC) 가이드 팝업이 전면에 뜨면, <b>[예]</b>를 눌러 관리자 자격을 위임합니다.",
    "txt-jc-step-6": "안내에 맞춰 간단히 키보드 영문 <code class='code-inline'>Y</code> 혹은 <code class='code-inline'>N</code> 키를 타이핑하여 불필요 파일 청소, 전동 하드클리닝, 윈도우 백신 빠른 정밀 검사, 내 RAM 캐시 반환 등 필요 옵션을 선별 적용해 진행합니다."
  },
  zh: {
    "txt-lang-label": "选择语言：",
    "txt-hub-subtitle": "释放您电脑的全部潜能",
    "txt-hub-desc": "探索一系列精心打造的轻量级、安全且强大的工具，专为优化、清理和自动化您的 Windows 体验而设计——纯粹性能，告别臃肿。",
    "txt-tab-intro": "简介",
    "txt-tab-projects": "项目列表",
    "txt-sub-tab-how": "使用说明",
    "txt-sub-tab-changelog": "更新日志",
    "txt-bio-title": "你好，我是 ncexs",
    "txt-bio-desc": "我是一名开发者，致力于为所有人构建轻量且实用的工具。我创建这些实用程序是为了帮助自己和他人高效管理 Windows 系统，远离“流氓软件”。",
    "txt-sec-title": "安全与信任",
    "txt-sec-desc": "这些实用程序 100% 透明且开源。它们不收集任何个人数据。您可以随时自由审计代码。",
    
    // New UX navigation elements
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> 探索我们的项目",
    "txt-select-project-desc": "点击下方项目即可查看详细指南、手动运行命令和完整版本历史记录。",
    "txt-back-home": "返回首页",
    "txt-cta-tk-home": "查看指南 &rarr;",
    "txt-cta-at-home": "查看指南 &rarr;",
    "txt-cta-jc-home": "查看指南 &rarr;",
    "txt-cta-tk-detail": "查看指南 &rarr;",
    "txt-cta-at-detail": "查看指南 &rarr;",
    "txt-cta-jc-detail": "查看指南 &rarr;",

    // Toolkit Intro
    "txt-tk-intro-desc": "一款开源、交互式的一站式 PowerShell 实用工具控制台。无需安装即可安全清理、提升系统速度、配置 DNS、修复网络连接并管理 Windows 更新。",
    "txt-tk-btn-guide": "立即开始",
    
    // AutoTask Intro
    "txt-at-intro-desc": "专为无感日常 Windows 维护打造的轻量级后台自动化脚本。通过任务计划程序自动运行，清理系统垃圾、浏览器及 GPU 缓存，且绝不打断活动的浏览器会话或进程。",
    "txt-at-btn-guide": "设置任务计划",
    
    // Security Features Intro
    "txt-sec-feat-1-t": "100% 安全清理",
    "txt-sec-feat-1-d": "严格针对临时路径和系统/浏览器缓存文件。您的个人文件、密码、浏览器历史记录、Cookie 和登录状态完全不受影响。",
    "txt-sec-feat-2-t": "无感轻量设计",
    "txt-sec-feat-2-d": "专为流畅运行而设计。使用交互式控制台菜单，或一键运行脚本，亦或在后台自动静默清理，告别任何烦人的弹窗。",
    "txt-sec-feat-3-t": "智能进程检测",
    "txt-sec-feat-3-d": "我们的脚本在清理前会智能检测活动应用程序。如果浏览器正在使用，会自动跳过其缓存，保护您打开的标签页及数据库会话。",
    "txt-sec-feat-4-t": "100% 无病毒保证",
    "txt-sec-feat-4-d": "经 VirusTotal 测试验证 100% 干净无毒。我们的工具绝不含任何恶意软件、间谍软件或恶意代码，确保系统绝对安全。",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "经典、轻量且极速的批处理脚本 (.bat)，实现一键式 Windows 优化。设计简洁安全，快速清空垃圾目录、回收站、近期日志，并释放系统内存。",
    "txt-jc-btn-guide": "获取发布版",

    // Toolkit Guide
    "txt-how-title": "使用说明 - ncexs Toolkit",
    "txt-quick-title": "快速运行（无需下载）",
    "txt-quick-1": "打开 <b>开始菜单</b>，输入 <b>powershell</b>，右键点击并选择 <b>以管理员身份运行</b>。",
    "txt-quick-2": "复制并粘贴下方命令，然后按 <b>Enter</b> 回车键：",
    "txt-quick-3": "工具箱将自动启动。",
    "txt-quick-4-1": "若要取消或退出正在运行的进程，请按 <b>Ctrl + C</b>。",
    "txt-quick-4-2": "若要返回并再次使用工具箱，只需重新复制并粘贴下方命令：",
    "txt-menu-title": "交互式菜单选项",
    /* MENU_TRANS_ZH_START */
        "txt-opt-0": "<b>0 → 紧凑型系统 Compact OS（节省 2-5GB 空间）</b>",
        "txt-opt-1": "1 → 查看系统信息",
        "txt-opt-2": "2 → 增强版垃圾与缓存清理",
        "txt-opt-3": "3 → 清空回收站",
        "txt-opt-4": "4 → 打开磁盘清理工具",
        "txt-opt-5": "5 → 智能软件卸载",
        "txt-opt-6": "6 → 修复网络连接",
        "txt-opt-7": "7 → 电源与电池管理",
        "txt-opt-8": "8 → 内存优化与清理",
        "txt-opt-9": "9 → 磁盘碎片整理与优化",
        "txt-opt-10": "10 → 系统健康检查与修复",
        "txt-opt-11": "11 → 修复 Windows 更新与驱动",
        "txt-opt-12": "12 → 快速修改安全 DNS",
        "txt-opt-13": "13 → 查看已保存 Wi-Fi 密码",
        "txt-opt-14": "14 → 视觉效果与性能加速",
        "txt-opt-15": "15 → 优化 WhatsApp 存储",
        "txt-opt-16": "16 → 退出工具箱",
        "txt-opt-l": "L → 切换界面语言",
        /* MENU_TRANS_ZH_END */
    "txt-tip-title": "提示：",
    "txt-tip-desc": "如果您的 C 盘空间已满，请使用 <b>菜单 [0] Compact OS</b>。在进行深度系统维护前，请务必备份重要数据。",
    "txt-feat-title": "核心功能说明",
    "txt-fl-t": "切换语言 (菜单 L)：",
    "txt-fl-d": "在英语和印尼语之间即时切换工具箱控制台的交互界面语言。",
    "txt-f0-t": "紧凑型系统 Compact OS (菜单 0)：",
    "txt-f0-d": "Windows 自带的系统文件压缩功能。100% 安全且可随时还原，在不删除任何文件的情况下瞬间为您释放 <b>2GB 至 5GB</b> 存储空间。",
    "txt-f1-t": "系统信息 (菜单 1)：",
    "txt-f1-d": "快速显示电脑的详细配置规格，包括 CPU、内存、Windows 版本及各驱动器剩余空间。",
    "txt-f2-t": "增强版垃圾清理 (菜单 2)：",
    "txt-f2-d": "安全删除临时文件、系统日志和浏览器缓存（Chrome、Edge、Brave）。同时清理 <b>AMD、NVIDIA 及 Intel</b> 显卡着色器缓存，解决游戏卡顿问题。",
    "txt-f3-t": "清空回收站 (菜单 3)：",
    "txt-f3-d": "一键清空所有用户及磁盘驱动器的 Windows 回收站，释放存储空间。",
    "txt-f4-t": "打开磁盘清理 (菜单 4)：",
    "txt-f4-d": "启动官方 Windows 磁盘清理工具 (cleanmgr)，进行高级系统文件清理。",
    "txt-f5-t": "智能卸载程序 (菜单 5)：",
    "txt-f5-d": "使用模糊搜索快速查找并卸载已安装的软件。只需输入软件名称或首字母拼音！",
    "txt-f6-t": "网络修复 (菜单 6)：",
    "txt-f6-d": "执行完整的 5 步网络重置：释放/续约 IP、刷新 DNS、重置 Winsock 及 TCP/IP 协议栈，有效解决断网问题。",
    "txt-f7-t": "电源与电池实用程序 (菜单 7)：",
    "txt-f7-d": "生成详细的 HTML 电池健康报告，配置高性能电源计划，并管理系统睡眠状态。",
    "txt-f8-t": "内存优化 (菜单 8)：",
    "txt-f8-d": "瞬间清理系统备用内存并释放闲置 RAM 缓存，提升系统响应速度与游戏帧率。",
    "txt-f9-t": "驱动器碎片整理与优化 (菜单 9)：",
    "txt-f9-d": "对固态硬盘 (SSD) 执行 TRIM 指令或对机械硬盘 (HDD) 进行碎片整理，维持极速读写性能。",
    "txt-f10-t": "系统健康检查 (菜单 10)：",
    "txt-f10-d": "运行 SFC（系统文件检查器）及 DISM 修复工具，自动扫描并修复已损坏的 Windows 系统文件。",
    "txt-f11-t": "更新与驱动中心 (菜单 11)：",
    "txt-f11-d": "通过重置更新服务（wuauserv、bits、cryptSvc）并重命名下载缓存文件夹，修复卡住或失败的 Windows 更新。",
    "txt-f12-t": "DNS 切换工具 (菜单 12)：",
    "txt-f12-d": "快速切换至 Google Public DNS 或 Cloudflare 等知名安全 DNS，享受更快、更安全的网络浏览。",
    "txt-f13-t": "Wi-Fi 密码找回 (菜单 13)：",
    "txt-f13-d": "快速检索并显示当前电脑中保存的所有 Wi-Fi 网络名称及密码。",
    "txt-f14-t": "视觉效果加速器 (菜单 14)：",
    "txt-f14-d": "优化系统动画与视觉效果，显著提升系统运行速度和流畅度，老旧电脑必备。",
    "txt-f15-t": "优化 WhatsApp (菜单 15)：",
    "txt-f15-d": "清理 WhatsApp 桌面版产生的无用缓存、日志和过期媒体文件，释放数 GB 浪费的存储空间。",
    "txt-f16-t": "退出工具箱 (菜单 16)：",
    "txt-f16-d": "安全关闭控制台窗口，并自动恢复原有的 PowerShell 执行策略。",
    "txt-cl-title": "版本历史 / 更新日志",
    "txt-cl-desc": "ncexs 实用工具的最新更新和改进记录。",
  
    // AutoTask Guide
    "txt-how-at-title": "使用说明 - ncexs AutoTask",
    "txt-at-dl-title": "下载脚本",
    "txt-at-dl-desc": "从我们的 GitHub 仓库下载官方 PowerShell 自动化脚本：",
    "txt-at-dl-btn": "下载 ncexs-AutoTask.ps1",
    "txt-at-manual-title": "手动运行命令",
    "txt-at-manual-1": "打开 <b>PowerShell</b>（建议以管理员身份运行）。",
    "txt-at-manual-2": "通过以下命令在本地执行脚本：",
    "txt-at-sched-title": "使用任务计划程序实现自动化（推荐）",
    "txt-at-step-1": "<b>打开任务计划程序</b><p>按 <b>Win + R</b> 键，输入 <code class='code-inline'>taskschd.msc</code>，然后按 <b>Enter</b> 回车键。</p>",
    "txt-at-step-2": "<b>创建新任务</b><p>点击右侧栏的 <b>创建任务</b>（不要选择基本任务）。在 <b>常规</b> 选项卡中：</p><ul><li>名称：<code class='code-inline'>ncexs Auto Task</code></li><li>勾选：<b>“不管用户是否登录都要运行”</b></li><li>勾选：<b>“使用最高权限运行”</b></li></ul>",
    "txt-at-step-3": "<b>配置触发器（计划时间）</b><p>转到 <b>触发器</b> 选项卡，点击 <b>新建</b>。开始任务设为 <b>按计划</b>，选择 <b>每天</b>。可选择勾选 <b>“重复任务间隔：”</b>，输入 <code class='code-inline'>6 小时</code>，持续时间设为 <b>无限期</b>。</p>",
    "txt-at-step-4": "<b>配置操作</b><p>转到 <b>操作</b> 选项卡，点击 <b>新建</b>，操作设为 <b>“启动程序”</b>：</p><ul><li>程序/脚本：<code class='code-inline'>powershell.exe</code></li><li>添加参数：<code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\路径\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>（请将文件夹路径替换为您保存脚本的实际位置。调试时可去掉 -Silent）</i></li></ul>",
    "txt-at-step-5": "<b>配置条件</b><p>在 <b>条件</b> 选项卡中，取消勾选：<b>“只有在计算机使用交流电源时才启动此任务”</b>（这样在使用电池的笔记本电脑上也能运行）。</p>",
    "txt-at-step-6": "<b>配置设置并保存</b><p>在 <b>设置</b> 选项卡中，勾选 <b>“如果过了计划开始时间，立即启动任务”</b>。点击 <b>确定</b>，并在弹出窗口中输入您的 Windows 密码即可完成。</p>",
  
    // Junk Cleaner Guide
    "txt-how-jc-title": "使用说明 - ncexs Junk Cleaner",
    "txt-jc-run-title": "一键运行指南",
    "txt-jc-step-1": "从官方 <a href='https://github.com/ncexs/junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a> 页面下载最新版本的 ZIP 压缩包。",
    "txt-jc-step-2": "解压下载的 ZIP 压缩包。",
    "txt-jc-step-3": "双击运行 <code class='code-inline'>ncexs-junkcleaner.bat</code> 批处理文件启动脚本。",
    "txt-jc-step-4": "若 Windows SmartScreen 拦截运行（“Windows 已保护你的 PC”），请点击 <b>更多信息</b> → <b>仍要运行</b>。",
    "txt-jc-step-5": "当用户账户控制 (UAC) 提示时，允许管理员权限。",
    "txt-jc-step-6": "根据屏幕提示（输入 <code class='code-inline'>Y</code> 或 <code class='code-inline'>N</code>）进行选择：垃圾清理、深度清理、杀毒软件快速扫描或内存优化。"
  },
  ar: {
    "txt-lang-label": "اختر اللغة:",
    "txt-hub-subtitle": "أطلق العنان لأقصى طاقة لجهاز الكمبيوتر الخاص بك",
    "txt-hub-desc": "اكتشف مجموعة منتقاة من الأدوات الخفيفة والآمنة والقوية المصممة لتحسين نظام Windows الخاص بك وتنظيفه وأتمتة مهامه—أداء نقي تماماً بدون أي برامج منتفخة.",
    "txt-tab-intro": "المقدمة",
    "txt-tab-projects": "المشاريع",
    "txt-sub-tab-how": "كيفية الاستخدام",
    "txt-sub-tab-changelog": "سجل التحديثات",
    "txt-bio-title": "مرحباً، أنا ncexs",
    "txt-bio-desc": "أنا مطور أتعلم بناء أدوات خفيفة ومفيدة للجميع. قمت بإنشاء هذه الأدوات لمساعدة نفسي والآخرين على إدارة أنظمة Windows بكفاءة وسرعة دون أي برمجيات ثقيلة غير ضرورية.",
    "txt-sec-title": "الأمان والثقة",
    "txt-sec-desc": "هذه الأدوات مفتوحة المصدر وشفافة بنسبة 100%. هي لا تقوم بجمع أي بيانات شخصية، ويمكنك فحص ومراجعة الأكواد البرمجية في أي وقت.",
    
    // New UX navigation elements
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> استكشف مشاريعنا",
    "txt-select-project-desc": "انقر على أحد المشاريع أدناه لعرض دليله الشامل، وأوامر التشغيل اليدوية، وسجل الإصدارات الكامل.",
    "txt-back-home": "العودة للرئيسية",
    "txt-cta-tk-home": "عرض الدليل &larr;",
    "txt-cta-at-home": "عرض الدليل &larr;",
    "txt-cta-jc-home": "عرض الدليل &larr;",
    "txt-cta-tk-detail": "عرض الدليل &larr;",
    "txt-cta-at-detail": "عرض الدليل &larr;",
    "txt-cta-jc-detail": "عرض الدليل &larr;",

    // Toolkit Intro
    "txt-tk-intro-desc": "وحدة تحكم تفاعلية مفتوحة المصدر تجمع أدوات PowerShell الأساسية في مكان واحد. تتيح لك التنظيف الآمن، تسريع النظام، إعداد DNS، إصلاح الشبكة، وإدارة تحديثات Windows—كل ذلك بدون أي تثبيت.",
    "txt-tk-btn-guide": "ابدأ الآن",
    
    // AutoTask Intro
    "txt-at-intro-desc": "برنامج نصي خفيف يعمل في الخلفية لصيانة Windows اليومية بصمت. يتم تشغيله تلقائياً عبر Task Scheduler لتنظيف مخلفات النظام وذاكرة التخزين المؤقت للمتصفح وبطاقة الرسوميات دون مقاطعة جلساتك النشطة.",
    "txt-at-btn-guide": "إعداد الجدولة",
    
    // Security Features Intro
    "txt-sec-feat-1-t": "تنظيف آمن 100%",
    "txt-sec-feat-1-d": "يستهدف الملفات المؤقتة وذاكرة التخزين المؤقت للنظام والمتصفحات فقط. ملفاتك الشخصية، كلمات المرور، سجل التصفح، وملفات تعريف الارتباط تبقى آمنة تماماً ولا يتم المساس بها.",
    "txt-sec-feat-2-t": "تصميم خفيف وغير مزعج",
    "txt-sec-feat-2-d": "مصمم ليعمل بسلاسة تامة. استخدم القوائم التفاعلية، أو قم بتشغيل برنامج نصي بنقرة واحدة، أو قم بجدولة التنظيف الصامت في الخلفية بدون أي نوافذ منبثقة مزعجة.",
    "txt-sec-feat-3-t": "اكتشاف ذكي للعمليات",
    "txt-sec-feat-3-d": "تقوم نصوصنا البرمجية بفحص التطبيقات النشطة بذكاء قبل التنظيف. إذا كان المتصفح قيد الاستخدام، يتم تخطي ذاكرة التخزين المؤقت الخاصة به لحماية جلساتك وعلامات التبويب المفتوحة.",
    "txt-sec-feat-4-t": "خالي من الفيروسات 100%",
    "txt-sec-feat-4-d": "تم اختباره والتحقق من سلامته عبر موقع VirusTotal. أدواتنا خالية تماماً من أي برمجيات خبيثة أو تجسسية، مما يضمن بقاء نظامك آمناً بالكامل.",
    
    // Junk Cleaner Intro
    "txt-jc-intro-desc": "برنامج نصي كلاسيكي وسريع جداً (.bat) لتحسين Windows بنقرة واحدة. مصمم ليكون بسيطاً وآمناً لتفريغ المجلدات المؤقتة وسلة المحذوفات والسجلات وإفراغ الذاكرة العشوائية.",
    "txt-jc-btn-guide": "تحميل الإصدار",

    // Toolkit Guide
    "txt-how-title": "كيفية الاستخدام - ncexs Toolkit",
    "txt-quick-title": "تشغيل سريع (لا يتطلب التحميل)",
    "txt-quick-1": "افتح <b>قائمة ابدأ</b>، واكتب <b>powershell</b>، وانقر بزر الماوس الأيمن عليه واختر <b>تشغيل كمسؤول (Run as Administrator)</b>.",
    "txt-quick-2": "قم بنسخ ولصق الأمر أدناه، ثم اضغط على <b>Enter</b>:",
    "txt-quick-3": "سيتم تشغيل مجموعة الأدوات تلقائياً على الفور.",
    "txt-quick-4-1": "لإلغاء أو إيقاف أي عملية قيد التشغيل، اضغط على <b>Ctrl + C</b>.",
    "txt-quick-4-2": "للعودة واستخدام مجموعة الأدوات مرة أخرى، ما عليك سوى نسخ ولصق الأمر أدناه مجدداً:",
    "txt-menu-title": "خيارات القائمة التفاعلية",
    /* MENU_TRANS_AR_START */
        "txt-opt-0": "<b>0 → ضغط النظام Compact OS (توفير 2-5 جيجابايت)</b>",
        "txt-opt-1": "1 → معلومات ومواصفات النظام",
        "txt-opt-2": "2 → منظف المخلفات المطور",
        "txt-opt-3": "3 → إفراغ سلة المحذوفات",
        "txt-opt-4": "4 → فتح أداة تنظيف القرص (Disk Cleanup)",
        "txt-opt-5": "5 → إلغاء تثبيت البرامج الذكي",
        "txt-opt-6": "6 → إصلاح وإعادة ضبط الشبكة",
        "txt-opt-7": "7 → أدوات الطاقة وتقرير البطارية",
        "txt-opt-8": "8 → تحسين وتسريع الذاكرة (RAM)",
        "txt-opt-9": "9 → إلغاء تجزئة الأقراص وتحسينها",
        "txt-opt-10": "10 → فحص صحة وإصلاح ملفات النظام",
        "txt-opt-11": "11 → مركز إصلاح التحديثات والتعريفات",
        "txt-opt-12": "12 → مغير خوادم DNS السريع",
        "txt-opt-13": "13 → استرجاع كلمات مرور Wi-Fi المحفوظة",
        "txt-opt-14": "14 → تحسين التأثيرات المرئية للأداء",
        "txt-opt-15": "15 → تنظيف وتحسين تخزين WhatsApp",
        "txt-opt-16": "16 → الخروج من الأداة",
        "txt-opt-l": "L → تغيير لغة العرض",
        /* MENU_TRANS_AR_END */
    "txt-tip-title": "نصيحة:",
    "txt-tip-desc": "استخدم <b>القائمة [0] Compact OS</b> إذا كان القرص C ممتلئاً. احتفظ دائماً بنسخة احتياطية من بياناتك المهمة قبل إجراء صيانة عميقة للنظام.",
    "txt-feat-title": "شرح الميزات الرئيسية",
    "txt-fl-t": "تغيير اللغة (القائمة L):",
    "txt-fl-d": "يغير لغة واجهة أداة التحكم التفاعلية بين الإنجليزية والإندونيسية على الفور.",
    "txt-f0-t": "ضغط النظام Compact OS (القائمة 0):",
    "txt-f0-d": "ميزة مضمنة في Windows لضغط ملفات النظام. آمنة 100% وقابلة للإلغاء، وتوفر فوراً <b>2 إلى 5 جيجابايت</b> من مساحة التخزين دون حذف أي ملفات شخصية.",
    "txt-f1-t": "معلومات النظام (القائمة 1):",
    "txt-f1-d": "يعرض مواصفات جهاز الكمبيوتر الخاص بك بسرعة وتفصيل، بما في ذلك المعالج، الذاكرة العشوائية، إصدار Windows، والمساحة المتبقية في الأقراص.",
    "txt-f2-t": "منظف المخلفات المطور (القائمة 2):",
    "txt-f2-d": "يزيل الملفات المؤقتة وسجلات النظام ومخلفات المتصفحات (Chrome, Edge, Brave) بأمان. ينظف أيضاً ملفات التظليل (Shader Cache) لكروت الشاشة <b>AMD, NVIDIA, Intel</b> لحل مشكلات التقطيع في الألعاب.",
    "txt-f3-t": "إفراغ سلة المحذوفات (القائمة 3):",
    "txt-f3-d": "يفرغ سلة المحذوفات في Windows لجميع المستخدمين والأقراص بضغطة واحدة لتحرير المساحة.",
    "txt-f4-t": "تنظيف القرص (القائمة 4):",
    "txt-f4-d": "يفتح أداة Windows الرسمية (cleanmgr) لتنظيف ملفات النظام المتقدمة.",
    "txt-f5-t": "إلغاء التثبيت الذكي (القائمة 5):",
    "txt-f5-d": "ابحث عن البرامج المثبتة وأزلها بسرعة باستخدام البحث الذكي. ما عليك سوى كتابة اسم التطبيق أو أحرفه الأولى!",
    "txt-f6-t": "إصلاح الشبكة (القائمة 6):",
    "txt-f6-d": "يقوم بإعادة ضبط الشبكة بالكامل عبر 5 خطوات: تجديد IP، مسح DNS، إعادة ضبط Winsock، ومكدس TCP/IP لحل انقطاع الاتصال.",
    "txt-f7-t": "أدوات الطاقة والبطارية (القائمة 7):",
    "txt-f7-d": "ينشئ تقريراً مفصلاً عن حالة البطارية بصيغة HTML، ويضبط خطط الطاقة عالية الأداء، ويدير وضع السكون.",
    "txt-f8-t": "محسن الذاكرة (القائمة 8):",
    "txt-f8-d": "يمسح الذاكرة الاحتياطية ويحرر الذاكرة العشوائية غير المستخدمة على الفور، مما يساعد على تسريع استجابة النظام والألعاب.",
    "txt-f9-t": "إلغاء التجزئة وتحسين الأقراص (القائمة 9):",
    "txt-f9-d": "يحلل ويشغل أمر TRIM لأقراص SSD أو يلغي تجزئة أقراص HDD للحفاظ على سرعات قراءة وكتابة عالية.",
    "txt-f10-t": "فحص صحة النظام (القائمة 10):",
    "txt-f10-d": "يشغل أدوات الفحص والإصلاح (SFC و DISM) للعثور على ملفات نظام Windows التالفة وإصلاحها تلقائياً.",
    "txt-f11-t": "مركز التحديثات والتعريفات (القائمة 11):",
    "txt-f11-d": "يصلح تحديثات Windows العالقة أو الفاشلة عن طريق إعادة تشغيل خدمات التحديث (wuauserv, bits, cryptSvc) وإعادة تسمية مجلد التنزيل المؤقت.",
    "txt-f12-t": "مغير DNS (القائمة 12):",
    "txt-f12-d": "يتيح لك تغيير إعدادات خادم DNS بسرعة إلى خيارات آمنة وسريعة مثل Google Public DNS أو Cloudflare لتصفح أكثر سرعة وأماناً.",
    "txt-f13-t": "استعادة كلمات مرور Wi-Fi (القائمة 13):",
    "txt-f13-d": "يستخرج ويعرض جميع أسماء شبكات Wi-Fi المحفوظة وكلمات المرور الخاصة بها على جهازك فوراً.",
    "txt-f14-t": "معزز التأثيرات المرئية (القائمة 14):",
    "txt-f14-d": "يحسن التأثيرات المرئية والرسوم المتحركة للنظام لزيادة السرعة والأداء، خاصة على الأجهزة القديمة.",
    "txt-f15-t": "تحسين WhatsApp (القائمة 15):",
    "txt-f15-d": "ينظف الملفات المؤقتة والسجلات والوسائط غير الضرورية لتطبيق WhatsApp Desktop لتحرير جيجابايتات من مساحة التخزين الضائعة.",
    "txt-f16-t": "الخروج من الأداة (القائمة 16):",
    "txt-f16-d": "يغلق نافذة أداة التحكم بأمان ويعيد سياسات تشغيل PowerShell إلى وضعها الأصلي.",
    "txt-cl-title": "سجل الإصدارات / التحديثات",
    "txt-cl-desc": "التحديثات والتغييرات الأخيرة على أدوات ncexs.",
  
    // AutoTask Guide
    "txt-how-at-title": "كيفية الاستخدام - ncexs AutoTask",
    "txt-at-dl-title": "تحميل البرنامج النصي",
    "txt-at-dl-desc": "قم بتحميل النص البرمجي الرسمي للأتمتة من مستودع GitHub الخاص بنا:",
    "txt-at-dl-btn": "تحميل ncexs-AutoTask.ps1",
    "txt-at-manual-title": "أمر التشغيل اليدوي",
    "txt-at-manual-1": "افتح <b>PowerShell</b> (يُوصى بالتشغيل كمسؤول).",
    "txt-at-manual-2": "قم بتشغيل البرنامج النصي محلياً باستخدام هذا الأمر:",
    "txt-at-sched-title": "الأتمتة باستخدام Task Scheduler (موصى به)",
    "txt-at-step-1": "<b>فتح Task Scheduler</b><p>اضغط على <b>Win + R</b>، واكتب <code class='code-inline'>taskschd.msc</code>، ثم اضغط على <b>Enter</b>.</p>",
    "txt-at-step-2": "<b>إنشاء مهمة جديدة</b><p>انقر على <b>Create Task</b> في القائمة الجانبية اليمنى (ليس Basic Task). في علامة التبويب <b>General</b>:</p><ul><li>الاسم: <code class='code-inline'>ncexs Auto Task</code></li><li>حدد: <b>\"Run whether user is logged on or not\"</b></li><li>حدد: <b>\"Run with highest privileges\"</b></li></ul>",
    "txt-at-step-3": "<b>تكوين المشغل (الجدول الزمني)</b><p>انتقل إلى علامة التبويب <b>Triggers</b>، وانقر على <b>New</b>. اضبط بدء المهمة على <b>On a schedule</b>، واختر <b>Daily</b>. اختيارياً، حدد <b>\"Repeat task every:\"</b> واكتب <code class='code-inline'>6 hours</code> واضبط المدة على <b>Indefinitely</b>.</p>",
    "txt-at-step-4": "<b>تكوين الإجراء (Action)</b><p>انتقل إلى علامة التبويب <b>Actions</b>، وانقر على <b>New</b>، واضبط الإجراء على <b>\"Start a program\"</b>:</p><ul><li>البرنامج/النص: <code class='code-inline'>powershell.exe</code></li><li>إضافة وسيطات: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(قم بتغيير مسار المجلد إلى المكان الذي حفظت فيه البرنامج النصي. احذف -Silent للمعاينة عند التصحيح)</i></li></ul>",
    "txt-at-step-5": "<b>تكوين الشروط (Conditions)</b><p>في علامة التبويب <b>Conditions</b>، قم بإلغاء تحديد: <b>\"Start the task only if the computer is on AC power\"</b> (هذا يسمح بتشغيله على أجهزة الكمبيوتر المحمولة أثناء استخدام البطارية).</p>",
    "txt-at-step-6": "<b>حفظ الإعدادات</b><p>في علامة التبويب <b>Settings</b>، حدد <b>\"Run task as soon as possible after a scheduled start is missed\"</b>. انقر على <b>OK</b> وأدخل كلمة مرور Windows الخاصة بك عند المطالبة.</p>",
  
    // Junk Cleaner Guide
    "txt-how-jc-title": "كيفية الاستخدام - ncexs Junk Cleaner",
    "txt-jc-run-title": "تعليمات التشغيل بنقرة واحدة",
    "txt-jc-step-1": "قم بتحميل أحدث ملف ZIP من صفحة <a href='https://github.com/ncexs/junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "قم بفك ضغط ملف ZIP الذي تم تنزيله.",
    "txt-jc-step-3": "انقر نقراً مزدوجاً فوق ملف <code class='code-inline'>ncexs-junkcleaner.bat</code> لتشغيل البرنامج.",
    "txt-jc-step-4": "إذا قام SmartScreen بحظر التشغيل ('Windows protected your PC')، فانقر فوق <b>More info</b> → <b>Run anyway</b>.",
    "txt-jc-step-5": "اسمح بصلاحيات المسؤول (Administrator) عند المطالبة بذلك من قبل UAC.",
    "txt-jc-step-6": "اتبع المطالبات التي تظهر على الشاشة (اكتب <code class='code-inline'>Y</code> أو <code class='code-inline'>N</code>) لاختيار: تنظيف المخلفات، التنظيف العميق، الفحص السريع لمكافح الفيروسات، أو تحسين الذاكرة."
  },
  jv: {
    "txt-lang-label": "Pilih Basa:",
    "txt-hub-subtitle": "Maksimalkeun Potensi Penuh PC Panjenengan",
    "txt-hub-desc": "Jelajahi piranti alus ingkang enteng, aman, saha mateng kagem ngoptimalaken, ngresiki, saha ngotomatisasi sistem Windows panjenengan—kinerja murni, mboten wonten bloatware.",
    "txt-tab-intro": "Pitepangan",
    "txt-tab-projects": "Proyek",
    "txt-sub-tab-how": "Tata Cara Migunakaken",
    "txt-sub-tab-changelog": "Cathetan Rilis",
    "txt-bio-title": "Sugeng rawuh, Kula ncexs",
    "txt-bio-desc": "Kula nggih menika pangembang ingkang taksih sinau damel piranti enteng saha migunani kagem tiyang kathah. Kula damel utilitas menika kagem mbiyantu kula piyambak saha sesami ngatur sistem Windows kanthi gampil tanpa \"bloatware\".",
    "txt-sec-title": "Keamanan & Kapercayan",
    "txt-sec-desc": "Piranti utilitas menika 100% transparan saha open-source. Piranti menika mboten ngempalaken data pribadi menapa kemawon. Panjenengan bebas mriksa kode kapan kemawon.",
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> Jelajahi Proyek Kula",
    "txt-select-project-desc": "Klik salah satunggaling proyek ing ngandhap menika kagem ningali pandhuan, perintah manual, saha riwayat versi jangkep.",
    "txt-back-home": "Wangsul ing Beranda",
    "txt-cta-tk-home": "Mirsani Pandhuan &rarr;",
    "txt-cta-at-home": "Mirsani Pandhuan &rarr;",
    "txt-cta-jc-home": "Mirsani Pandhuan &rarr;",
    "txt-cta-tk-detail": "Mirsani Pandhuan &rarr;",
    "txt-cta-at-detail": "Mirsani Pandhuan &rarr;",
    "txt-cta-jc-detail": "Mirsani Pandhuan &rarr;",
    "txt-tk-intro-desc": "Konsol utilitas PowerShell interaktif all-in-one ingkang open-source. Kagem ngresiki kanthi aman, ngoptimalaken kacepetan sistem, konfigurasi DNS, ndandani koneksi jaringan, saha ngatur Windows Update—sedaya saking setunggal antarmuka enteng tanpa instalasi.",
    "txt-tk-btn-guide": "Wiwiti Sakmenika",
    "txt-at-intro-desc": "Script otomatisasi latar belakang ingkang enteng kagem pangopenan Windows dinten-dinten ingkang senyap. Mlaku otomatis lumantar Task Scheduler kagem ngresiki runtah sistem, cache shader browser, saha GPU tanpa ngganggu sesi browser aktif utawi proses aplikasi.",
    "txt-at-btn-guide": "Atur Jadwal",
    "txt-sec-feat-1-t": "Pangresikan 100% Aman",
    "txt-sec-feat-1-d": "Ditargetaken namung kagem folder temporary saha file cache sistem/browser. File pribadi, sandhi, riwayat browser, cookie, saha data autentikasi panjenengan tetep aman.",
    "txt-sec-feat-2-t": "Desain Non-Intrusif",
    "txt-sec-feat-2-d": "Didesain supados mlaku kanthi alus. Migunakaken menu konsol interaktif, nglampahaken script sepindhah klik, utawi otomatisasi pangresikan latar belakang tanpa popup ingkang ngganggu.",
    "txt-sec-feat-3-t": "Deteksi Proses Pinter",
    "txt-sec-feat-3-d": "Script kula mriksa aplikasi aktif kanthi cermat saderengipun ngresiki. Menawi browser saweg dipunginakaken, cache badhe dipunlangkungi supados sesi tab panjenengan tetep aman.",
    "txt-sec-feat-4-t": "100% Bebas Virus",
    "txt-sec-feat-4-d": "Sampun dipunuji saha terverifikasi 100% resik dening VirusTotal. Piranti kula mboten ngandhut malware, spyware, utawi kode mbebayani, njamin sistem panjenengan tetep aman.",
    "txt-jc-intro-desc": "Script Batch (.bat) klasik, enteng, saha super cepet kagem optimasi Windows sepindhah klik. Didesain praktis, aman ngresiki direktori runtah, Recycle Bin, log riwayat, saha mbebasaken RAM sistem.",
    "txt-jc-btn-guide": "Undhuh Rilis",
    "txt-how-title": "Cara Migunakaken - ncexs Toolkit",
    "txt-quick-title": "Perintah Cepet (Mboten Perlu Undhuh)",
    "txt-quick-1": "Buka <b>Start Menu</b>, ketik <b>powershell</b>, klik kanan lajeng pilih <b>Run as Administrator</b>.",
    "txt-quick-2": "Copy saha paste perintah ing ngandhap menika, lajeng pencet <b>Enter</b>:",
    "txt-quick-3": "Toolkit badhe langsung mbikak kanthi otomatis.",
    "txt-quick-4-1": "Kagem mbatalaken utawi mungkasi proses ingkang mlampah, pencet <b>Ctrl + C</b>.",
    "txt-quick-4-2": "Kagem migunakaken toolkit malih, cobi salin saha tempel malih perintah ing ngandhap menika:",
    "txt-menu-title": "Pilihan Menu Interaktif",
    "txt-opt-0": "<b>0 → Compact OS (Hemat 2-5GB Ruang)</b>",
    "txt-opt-1": "1 → Informasi Sistem",
    "txt-opt-2": "2 → Pangresik Runtah (Enhanced)",
    "txt-opt-3": "3 → Kosongaken Recycle Bin",
    "txt-opt-4": "4 → Buka Disk Cleanup",
    "txt-opt-5": "5 → Smart Uninstaller",
    "txt-opt-6": "6 → Perbaikan Jaringan",
    "txt-opt-7": "7 → Utilitas Daya & Baterai",
    "txt-opt-8": "8 → Optimasi Memori",
    "txt-opt-9": "9 → Defragment & Optimasi Drive",
    "txt-opt-10": "10 → Pamariksan Kasarasan Sistem",
    "txt-opt-11": "11 → Pusat Update & Driver",
    "txt-opt-12": "12 → Pangowah DNS",
    "txt-opt-13": "13 → Wi-Fi Password Recovery",
    "txt-opt-14": "14 → Visual FX Booster",
    "txt-opt-15": "15 → Optimasi WhatsApp",
    "txt-opt-16": "16 → Medal Saking Aplikasi",
    "txt-opt-l": "L → Gantos Basa",
    "txt-tip-title": "Tips:",
    "txt-tip-desc": "Gunakaken <b>Menu [0] Compact OS</b> menawi drive C: kebak. Tansah damel cadangan (backup) data wigati saderengipun nglampahi perawatan sistem mendalam.",
    "txt-feat-title": "Pamedharan Fitur Utama",
    "txt-fl-t": "Gantos Basa (Menu L):",
    "txt-fl-d": "Nggantos basa tampilan konsol interaktif toolkit antawisipun Basa Inggris, Indonesia, saha Jawi kanthi instan.",
    "txt-f0-t": "Compact OS (Menu 0):",
    "txt-f0-d": "Fitur Windows ingkang kuat kagem ngompres file sistem. 100% aman, saged dipunwangsulaken, saha ngirit <b>2GB ngantos 5GB</b> ruang panyimpenan tanpa mbusak file pribadi.",
    "txt-f1-t": "Informasi Sistem (Menu 1):",
    "txt-f1-d": "Nampilaken spesifikasi komputer panjenengan kanthi cepet saha rinci, kalebet CPU, RAM, versi Windows, saha sisa ruang drive ingkang aktif.",
    "txt-f2-t": "Enhanced Junk Cleaner (Menu 2):",
    "txt-f2-d": "Mbusak file sauntara, file log sistem, saha cache browser (Chrome, Edge, Brave) kanthi aman. Ugi ngresiki cache shader GPU <b>AMD, NVIDIA, saha Intel</b> supados mboten patah-patah nalika main game.",
    "txt-f3-t": "Kosongaken Recycle Bin (Menu 3):",
    "txt-f3-d": "Ngosongaken Recycle Bin kanthi instan kagem sedaya pangguna saha drive kagem nglegakaken panyimpenan.",
    "txt-f4-t": "Buka Disk Cleanup (Menu 4):",
    "txt-f4-d": "Mbukak utilitas bawaan Windows Disk Cleanup (cleanmgr) kagem pangresikan file sistem tingkat lanjut.",
    "txt-f5-t": "Smart Uninstaller (Menu 5):",
    "txt-f5-d": "Padosi saha mbusak program terinstal kanthi cepet migunakaken pencarian pinter. Cukup ketik nama aplikasi utawi inisialipun!",
    "txt-f6-t": "Perbaikan Jaringan (Menu 6):",
    "txt-f6-d": "Nglampahaken reset jaringan 5 langkah: Release/Renew IP, Flush DNS, Reset Winsock, saha Reset stack TCP/IP. Migunani kagem ndandani koneksi ingkang asring pedhot.",
    "txt-f7-t": "Utilitas Daya & Baterai (Menu 7):",
    "txt-f7-d": "Damel laporan kasarasan baterai kanthi rinci ing format HTML, ngatur skema daya kinerja inggil, saha ngatur mode tilem sistem.",
    "txt-f8-t": "Optimasi Memori (Menu 8):",
    "txt-f8-d": "Ngresiki standby memory saha mbebasaken cache RAM ingkang mboten dipunginakaken kanthi instan kagem nambah kacepetan respons sistem saha game.",
    "txt-f9-t": "Defragment & Optimasi Drive (Menu 9):",
    "txt-f9-d": "Mriksa saha nglampahaken perintah TRIM kagem SSD utawi mendefrag HDD supados kacepetan maos/nyerat panyimpenan tetep inggil.",
    "txt-f10-t": "Pamariksan Kasarasan Sistem (Menu 10):",
    "txt-f10-d": "Nglampahaken SFC (System File Checker) saha DISM repair tools kagem madosi saha ndandani file sistem Windows ingkang risak kanthi otomatis.",
    "txt-f11-t": "Pusat Update & Driver (Menu 11):",
    "txt-f11-d": "Ndandani Windows Update ingkang macet utawi gagal kanthi mereset layanan update (wuauserv, bits, cryptSvc) saha nggantos nama folder cache undhuhan.",
    "txt-f12-t": "Pangowah DNS (Menu 12):",
    "txt-f12-d": "Nggampilaken panjenengan ngowahi pangaturan DNS sistem menyang panyedia aman populer kados Google Public DNS utawi Cloudflare.",
    "txt-f13-t": "Wi-Fi Password Recovery (Menu 13):",
    "txt-f13-d": "Ningali malih profil saha sandhi Wi-Fi ingkang kasimpen ing komputer panjenengan kanthi cepet.",
    "txt-f14-t": "Visual FX Booster (Menu 14):",
    "txt-f14-d": "Ngoptimalaken efek visual saha animasi Windows kagem nambah kacepetan saha performa sistem, migunani sanget ing PC spesifikasi andhap.",
    "txt-f15-t": "Optimasi WhatsApp (Menu 15):",
    "txt-f15-d": "Ngresiki file cache, log, saha file media mboten wigati saking WhatsApp Desktop kagem mbebasaken ruang panyimpenan gigabyte.",
    "txt-f16-t": "Medal Saking Aplikasi (Menu 16):",
    "txt-f16-d": "Medal saking konsol toolkit kanthi aman saha ngwangsulaken kebijakan eksekusi PowerShell panjenengan kados wau.",
    "txt-cl-title": "Riwayat Versi / Changelog",
    "txt-cl-desc": "Pambangunan saha ewah-ewahan enggal ing Utilitas ncexs.",
    "txt-how-at-title": "Cara Migunakaken - ncexs AutoTask",
    "txt-at-dl-title": "Undhuh Script",
    "txt-at-dl-desc": "Undhuh script otomatisasi PowerShell resmi saking repositori GitHub kula:",
    "txt-at-dl-btn": "Undhuh ncexs-AutoTask.ps1",
    "txt-at-manual-title": "Perintah Mlampahaken Manual",
    "txt-at-manual-1": "Buka <b>PowerShell</b> (Disaranaken minangka Administrator).",
    "txt-at-manual-2": "Jalanaken script sacara lokal kanthi perintah menika:",
    "txt-at-sched-title": "Otomatisasi kanthi Task Scheduler (Disaranaken)",
    "txt-at-step-1": "<b>Buka Task Scheduler</b><p>Pencet <b>Win + R</b>, ketik <code class='code-inline'>taskschd.msc</code>, lajeng pencet <b>Enter</b>.</p>",
    "txt-at-step-2": "<b>Damel Task Enggal</b><p>Klik <b>Create Task</b> ing sidebar tengen (sampun pilih Basic Task). Ing tab <b>General</b>:</p><ul><li>Nama: <code class='code-inline'>ncexs Auto Task</code></li><li>Centang: <b>'Run whether user is logged on or not'</b></li><li>Centang: <b>'Run with highest privileges'</b></li></ul>",
    "txt-at-step-3": "<b>Atur Trigger (Jadwal)</b><p>Buka tab <b>Triggers</b>, klik <b>New</b>. Pilih <b>On a schedule</b>, pilih <b>Daily</b>. Opsional, centang <b>'Repeat task every:'</b>, ketik <code class='code-inline'>6 hours</code>, saha atur durasi menyang <b>Indefinitely</b>.</p>",
    "txt-at-step-4": "<b>Atur Action</b><p>Buka tab <b>Actions</b>, klik <b>New</b>, atur Action menyang <b>'Start a program'</b>:</p><ul><li>Program/script: <code class='code-inline'>powershell.exe</code></li><li>Arguments: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(Gantos path folder sareng lokasi panjenengan nyimpen script. Hapus -Silent kagem ningali debug)</i></li></ul>",
    "txt-at-step-5": "<b>Atur Conditions</b><p>Ing tab <b>Conditions</b>, ilangaken centang: <b>'Start the task only if the computer is on AC power'</b> (supados mlaku ing laptop migunakaken baterai).</p>",
    "txt-at-step-6": "<b>Atur Settings & Simpan</b><p>Ing tab <b>Settings</b>, centang <b>'Run task as soon as possible after a scheduled start is missed'</b>. Klik <b>OK</b> saha lebetaken sandhi Windows panjenengan menawi dipunsuwun.</p>",
    "txt-how-jc-title": "Cara Migunakaken - ncexs Junk Cleaner",
    "txt-jc-run-title": "Pituduh Sepindhah Klik",
    "txt-jc-step-1": "Undhuh rilis ZIP paling enggal saking <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "Ekstrak file ZIP ingkang sampun dipunundhuh.",
    "txt-jc-step-3": "Double-click file <code class='code-inline'>ncexs-junkcleaner.bat</code> kagem miwiti program.",
    "txt-jc-step-4": "Menawi SmartScreen paring peringatan ('Windows protected your PC'), klik <b>More info</b> → <b>Run anyway</b>.",
    "txt-jc-step-5": "Paringi akses Administrator nalika dipunsuwun dening User Account Control (UAC).",
    "txt-jc-step-6": "Tututi pituduh ing layar (ketik <code class='code-inline'>Y</code> utawi <code class='code-inline'>N</code>) kagem: Junk Cleaner, Deep Cleanup, Antivirus Quick Scan, utawi optimasi RAM."
  },
  su: {
    "txt-lang-label": "Pilih Basa:",
    "txt-hub-subtitle": "Maksimalkeun Potensi Penuh PC Anjeun",
    "txt-hub-desc": "Milari rangkeian alat utilitas nu hampang, aman, tur tangguh nu dirarancang pikeun ngoptimalkeun, ngabersihan, sareng ngotomatisasi sistem Windows anjeun—kinerja murni, tanpa bloatware.",
    "txt-tab-intro": "Pangaweruh",
    "txt-tab-projects": "Proyék",
    "txt-sub-tab-how": "Tata Cara Nganggo",
    "txt-sub-tab-changelog": "Catetan Rilis",
    "txt-bio-title": "Wilujeng sumping, Simkuring ncexs",
    "txt-bio-desc": "Simkuring mangrupikeun pangembang nu nuju diajar ngawangun alat nu hampang & mangpaat piken saréréa. Simkuring ngadamel utilitas ieu piken ngabantos diri sorangan sareng sasama ngatur sistem Windows kalayan gampil tanpa \"bloatware\".",
    "txt-sec-title": "Kaamanan & Kapercantenan",
    "txt-sec-desc": "Alat utilitas ieu 100% transparan sareng open-source. Alat ieu henteu ngempelkeun data pribadi naon waé. Anjeun bébas marios kode iraha waé.",
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> Milari Proyék Urang",
    "txt-select-project-desc": "Klik salah sahiji proyék di handap piken ningali panduan, perintah manual, sareng riwayat vérsi lengkep.",
    "txt-back-home": "Wangsul ka Beranda",
    "txt-cta-tk-home": "Tingali Panduan &rarr;",
    "txt-cta-at-home": "Tingali Panduan &rarr;",
    "txt-cta-jc-home": "Tingali Panduan &rarr;",
    "txt-cta-tk-detail": "Tingali Panduan &rarr;",
    "txt-cta-at-detail": "Tingali Panduan &rarr;",
    "txt-cta-jc-detail": "Tingali Panduan &rarr;",
    "txt-tk-intro-desc": "Konsol utilitas PowerShell interaktif all-in-one nu open-source. Piken ngabersihan kalayan aman, ngoptimalkeun kagancangan sistem, konfigurasi DNS, ngalereskeun konéksi jaringan, sareng ngatur Windows Update—sadayana tina hiji antarmuka hampang tanpa instalasi.",
    "txt-tk-btn-guide": "Mawitan Ayeuna",
    "txt-at-intro-desc": "Script otomatisasi latar pengker nu hampang piken pangropéa Windows sadidinten nu senyap. Lumangsung otomatis ngalangkungan Task Scheduler piken ngabersihan runtah sistem, cache shader browser, sareng GPU tanpa ngaganggu sési browser aktif atanapi prosés aplikasi.",
    "txt-at-btn-guide": "Atur Jadwal",
    "txt-sec-feat-1-t": "Pangbersihan 100% Aman",
    "txt-sec-feat-1-d": "Ditujukeun khusus piken folder temporary sareng file cache sistem/browser. File pribadi, kecap sandi, riwayat browser, cookie, sareng data autentikasi anjeun tetep aman.",
    "txt-sec-feat-2-t": "Désain Non-Intrusif",
    "txt-sec-feat-2-d": "Dirarancang supados lumangsung kalayan lemes. Nganggo menu konsol interaktif, ngajalankeun script sakali klik, atanapi otomatisasi pangbersihan latar pengker tanpa popup nu ngaganggu.",
    "txt-sec-feat-3-t": "Detéksi Prosés Pinter",
    "txt-sec-feat-3-d": "Script urang marios aplikasi aktif kalayan cermat sateuacan ngabersihan. Upami browser nuju dianggo, cache badé dilangkungan supados sési tab anjeun tetep aman.",
    "txt-sec-feat-4-t": "100% Bébas Virus",
    "txt-sec-feat-4-d": "Parantos diuji sareng terverifikasi 100% beresih ku VirusTotal. Alat urang henteu ngandung malware, spyware, atanapi kode picilakaeun, ngajamin sistem anjeun tetep aman.",
    "txt-jc-intro-desc": "Script Batch (.bat) klasik, hampang, sareng super gancang piken optimasi Windows sakali klik. Dirarancang praktis, aman ngabersihan direktori runtah, Recycle Bin, log riwayat, sareng ngabébaskeun RAM sistem.",
    "txt-jc-btn-guide": "Unduh Rilis",
    "txt-how-title": "Tata Cara Nganggo - ncexs Toolkit",
    "txt-quick-title": "Perintah Gancang (Henteu Perlu Unduh)",
    "txt-quick-1": "Buka <b>Start Menu</b>, ketik <b>powershell</b>, klik katuhu lajeng pilih <b>Run as Administrator</b>.",
    "txt-quick-2": "Copy sareng paste perintah di handap ieu, lajeng pencét <b>Enter</b>:",
    "txt-quick-3": "Toolkit badé langsung muka kalayan otomatis.",
    "txt-quick-4-1": "Piken ngabatalkeun atanapi ngeureunkeun prosés nu lumangsung, pencét <b>Ctrl + C</b>.",
    "txt-quick-4-2": "Piken nganggo toolkit deui, cobi salin sareng tempel deui perintah di handap ieu:",
    "txt-menu-title": "Pilihan Menu Interaktif",
    "txt-opt-0": "<b>0 → Compact OS (Hemat 2-5GB Ruang)</b>",
    "txt-opt-1": "1 → Informasi Sistem",
    "txt-opt-2": "2 → Pangbersih Runtah (Enhanced)",
    "txt-opt-3": "3 → Kosongkeun Recycle Bin",
    "txt-opt-4": "4 → Buka Disk Cleanup",
    "txt-opt-5": "5 → Smart Uninstaller",
    "txt-opt-6": "6 → Perbaikan Jaringan",
    "txt-opt-7": "7 → Utilitas Daya & Baterai",
    "txt-opt-8": "8 → Optimasi Mémori",
    "txt-opt-9": "9 → Defragment & Optimasi Drive",
    "txt-opt-10": "10 → Pamariosan Kaséhatan Sistem",
    "txt-opt-11": "11 → Pusat Update & Driver",
    "txt-opt-12": "12 → Pangobah DNS",
    "txt-opt-13": "13 → Wi-Fi Password Recovery",
    "txt-opt-14": "14 → Visual FX Booster",
    "txt-opt-15": "15 → Optimasi WhatsApp",
    "txt-opt-16": "16 → Kaluar Ti Aplikasi",
    "txt-opt-l": "L → Gantos Basa",
    "txt-tip-title": "Tips:",
    "txt-tip-desc": "Nganggo <b>Menu [0] Compact OS</b> upami drive C: pinuh. Salawasna ngadamel cadangan (backup) data penting sateuacan pangropéa sistem mendalam.",
    "txt-feat-title": "Pamedaran Fitur Utama",
    "txt-fl-t": "Gantos Basa (Menu L):",
    "txt-fl-d": "Nggantos basa tampilan konsol interaktif toolkit antawis Basa Inggris, Indonesia, sareng Sunda kalayan instan.",
    "txt-f0-t": "Compact OS (Menu 0):",
    "txt-f0-d": "Fitur Windows nu tangguh piken ngompres file sistem. 100% aman, tiasa diwangsulkeun, sareng ngirit <b>2GB dugi ka 5GB</b> ruang panyimpenan tanpa mupus file pribadi.",
    "txt-f1-t": "Informasi Sistem (Menu 1):",
    "txt-f1-d": "Nampilkeun spesifikasi komputer anjeun kalayan gancang sareng rinci, kalebet CPU, RAM, vérsi Windows, sareng sisa ruang drive nu aktif.",
    "txt-f2-t": "Enhanced Junk Cleaner (Menu 2):",
    "txt-f2-d": "Mupus file samentawis, file log sistem, sareng cache browser (Chrome, Edge, Brave) kalayan aman. Ogé ngabersihan cache shader GPU <b>AMD, NVIDIA, sareng Intel</b> supados henteu patah-patah nalika maén game.",
    "txt-f3-t": "Kosongkeun Recycle Bin (Menu 3):",
    "txt-f3-d": "Ngosongkeun Recycle Bin kalayan instan piken sadaya pangguna sareng drive piken ngalegakeun panyimpenan.",
    "txt-f4-t": "Buka Disk Cleanup (Menu 4):",
    "txt-f4-d": "Muka utilitas bawaan Windows Disk Cleanup (cleanmgr) piken pangbersihan file sistem tingkat lanjut.",
    "txt-f5-t": "Smart Uninstaller (Menu 5):",
    "txt-f5-d": "Pilari sareng mupus program terinstal kalayan gancang nganggo panyarian pinter. Cukup ketik nami aplikasi atanapi inisialna!",
    "txt-f6-t": "Perbaikan Jaringan (Menu 6):",
    "txt-f6-d": "Ngajalankeun reset jaringan 5 langkah: Release/Renew IP, Flush DNS, Reset Winsock, sareng Reset stack TCP/IP. Mangpaat piken ngalereskeun konéksi nu sering pedot.",
    "txt-f7-t": "Utilitas Daya & Baterai (Menu 7):",
    "txt-f7-d": "Ngadamel laporan kaséhatan baterai kalayan rinci dina format HTML, ngatur skéma daya kinerja luhur, sareng ngatur mode sare sistem.",
    "txt-f8-t": "Optimasi Mémori (Menu 8):",
    "txt-f8-d": "Ngabersihan standby memory sareng ngabébaskeun cache RAM nu henteu dianggo kalayan instan piken nambah kagancangan respons sistem sareng game.",
    "txt-f9-t": "Defragment & Optimasi Drive (Menu 9):",
    "txt-f9-d": "Marios sareng ngajalankeun perintah TRIM piken SSD atanapi mendefrag HDD supados kagancangan maca/nyerat panyimpenan tetep luhur.",
    "txt-f10-t": "Pamariosan Kaséhatan Sistem (Menu 10):",
    "txt-f10-d": "Ngajalankeun SFC (System File Checker) sareng DISM repair tools piken milari sareng ngalereskeun file sistem Windows nu ruksak kalayan otomatis.",
    "txt-f11-t": "Pusat Update & Driver (Menu 11):",
    "txt-f11-d": "Ngalereskeun Windows Update nu macét atanapi gagal ku cara mereset layanan update (wuauserv, bits, cryptSvc) sareng ngagantos nami folder cache unduhan.",
    "txt-f12-t": "Pangobah DNS (Menu 12):",
    "txt-f12-d": "Ngagampilkeun anjeun ngobah pangaturan DNS sistem ka panyedia aman populér sapertos Google Public DNS atanapi Cloudflare.",
    "txt-f13-t": "Wi-Fi Password Recovery (Menu 13):",
    "txt-f13-d": "Ningali deui profil sareng sandi Wi-Fi nu kasimpen dina komputer anjeun kalayan gancang.",
    "txt-f14-t": "Visual FX Booster (Menu 14):",
    "txt-f14-d": "Ngoptimalkeun éfék visual sareng animasi Windows piken nambah kagancangan sareng performa sistem, mangpaat pisan dina PC spesifikasi handap.",
    "txt-f15-t": "Optimasi WhatsApp (Menu 15):",
    "txt-f15-d": "Ngabersihan file cache, log, sareng file media henteu penting ti WhatsApp Desktop piken ngabébaskeun ruang panyimpenan gigabyte.",
    "txt-f16-t": "Kaluar Ti Aplikasi (Menu 16):",
    "txt-f16-d": "Kaluar ti konsol toolkit kalayan aman sareng ngawangsulkeun kebijakan eksekusi PowerShell anjeun sapertos sateuacanna.",
    "txt-cl-title": "Riwayat Vérsi / Changelog",
    "txt-cl-desc": "Pangwangunan sareng parobihan anyar dina Utilitas ncexs.",
    "txt-how-at-title": "Tata Cara Nganggo - ncexs AutoTask",
    "txt-at-dl-title": "Unduh Script",
    "txt-at-dl-desc": "Unduh script otomatisasi PowerShell resmi ti repositori GitHub urang:",
    "txt-at-dl-btn": "Unduh ncexs-AutoTask.ps1",
    "txt-at-manual-title": "Perintah Ngajalankeun Manual",
    "txt-at-manual-1": "<b>PowerShell</b> (Disaranakeun salaku Administrator).",
    "txt-at-manual-2": "Jalankeun script sacara lokal ku perintah ieu:",
    "txt-at-sched-title": "Otomatisasi ku Task Scheduler (Disaranakeun)",
    "txt-at-step-1": "<b>Buka Task Scheduler</b><p>Pencét <b>Win + R</b>, ketik <code class='code-inline'>taskschd.msc</code>, lajeng pencét <b>Enter</b>.</p>",
    "txt-at-step-2": "<b>Ngadamel Task Anyar</b><p>Klik <b>Create Task</b> di sidebar katuhu (tong pilih Basic Task). Dina tab <b>General</b>:</p><ul><li>Nami: <code class='code-inline'>ncexs Auto Task</code></li><li>Centang: <b>'Run whether user is logged on or not'</b></li><li>Centang: <b>'Run with highest privileges'</b></li></ul>",
    "txt-at-step-3": "<b>Atur Trigger (Jadwal)</b><p>Buka tab <b>Triggers</b>, klik <b>New</b>. Pilih <b>On a schedule</b>, pilih <b>Daily</b>. Opsional, centang <b>'Repeat task every:'</b>, ketik <code class='code-inline'>6 hours</code>, sareng atur durasi ka <b>Indefinitely</b>.</p>",
    "txt-at-step-4": "<b>Atur Action</b><p>Buka tab <b>Actions</b>, klik <b>New</b>, atur Action ka <b>'Start a program'</b>:</p><ul><li>Program/script: <code class='code-inline'>powershell.exe</code></li><li>Arguments: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(Gantos path folder sareng lokasi anjeun nyimpen script. Hapus -Silent piken ningali debug)</i></li></ul>",
    "txt-at-step-5": "<b>Atur Conditions</b><p>Dina tab <b>Conditions</b>, ilangkeun centang: <b>'Start the task only if the computer is on AC power'</b> (supados tiasa lumangsung dina laptop nganggo baterai).</p>",
    "txt-at-step-6": "<b>Atur Settings & Simpan</b><p>Dina tab <b>Settings</b>, centang <b>'Run task as soon as possible after a scheduled start is missed'</b>. Klik <b>OK</b> sareng lebetkeun sandhi Windows anjeun upami dipersilakeun.</p>",
    "txt-how-jc-title": "Tata Cara Nganggo - ncexs Junk Cleaner",
    "txt-jc-run-title": "Pituduh Sakali Klik",
    "txt-jc-step-1": "Unduh rilis ZIP panganyarna ti <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "Ekstrak file ZIP nu parantos diunduh.",
    "txt-jc-step-3": "Double-click file <code class='code-inline'>ncexs-junkcleaner.bat</code> piken ngamawitan program.",
    "txt-jc-step-4": "Upami SmartScreen masihan peringatan ('Windows protected your PC'), klik <b>More info</b> → <b>Run anyway</b>.",
    "txt-jc-step-5": "Pasihan aksés Administrator nalika dipersilakeun ku User Account Control (UAC).",
    "txt-jc-step-6": "Tuturkeun pituduh di layar (ketik <code class='code-inline'>Y</code> atanapi <code class='code-inline'>N</code>) piken: Junk Cleaner, Deep Cleanup, Antivirus Quick Scan, atanapi optimasi RAM."
  },
  hi: {
    "txt-lang-label": "भाषा चुनें:",
    "txt-hub-subtitle": "अपने पीसी की पूरी क्षमता को अनलॉक करें",
    "txt-hub-desc": "अपने विंडोज अनुभव को अनुकूलित, साफ़ और स्वचालित करने के लिए डिज़ाइन किए गए हल्के, सुरक्षित और शक्तिशाली उपकरणों के एक क्यूरेटेड सूट का अन्वेषण करें—शुद्ध प्रदर्शन, शून्य ब्लोटवेयर।",
    "txt-tab-intro": "परिचय",
    "txt-tab-projects": "प्रोजेक्ट्स",
    "txt-sub-tab-how": "उपयोग कैसे करें",
    "txt-sub-tab-changelog": "अपडेट इतिहास",
    "txt-bio-title": "नमस्ते, मैं ncexs हूँ",
    "txt-bio-desc": "मैं एक डेवलपर हूँ जो सभी के लिए हल्के और उपयोगी उपकरण बनाना सीख रहा है। मैंने इन उपयोगिताओं को स्वयं और दूसरों की मदद करने के लिए बनाया है ताकि बिना किसी अनावश्यक ब्लोटवेयर के विंडोज सिस्टम को कुशलतापूर्वक प्रबंधित किया जा सके।",
    "txt-sec-title": "सुरक्षा और विश्वास",
    "txt-sec-desc": "ये उपयोगिताएँ 100% पारदर्शी और ओपन-सोर्स हैं। वे कोई भी व्यक्तिगत डेटा एकत्र नहीं करती हैं। आप किसी भी समय कोड की स्वतंत्र रूप से जांच कर सकते हैं।",
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> हमारे प्रोजेक्ट्स एक्सप्लोर करें",
    "txt-select-project-desc": "विस्तृत गाइड, मैनुअल रन कमांड और पूर्ण संस्करण इतिहास देखने के लिए नीचे दिए गए किसी भी प्रोजेक्ट पर क्लिक करें।",
    "txt-back-home": "होम पर वापस जाएं",
    "txt-cta-tk-home": "गाइड देखें &rarr;",
    "txt-cta-at-home": "गाइड देखें &rarr;",
    "txt-cta-jc-home": "गाइड देखें &rarr;",
    "txt-cta-tk-detail": "गाइड देखें &rarr;",
    "txt-cta-at-detail": "गाइड देखें &rarr;",
    "txt-cta-jc-detail": "गाइड देखें &rarr;",
    "txt-tk-intro-desc": "एक ओपन-सोर्स, ऑल-इन-वन इंटरएक्टिव पावरशेल यूटिलिटी कंसोल। बिना किसी इंस्टॉलेशन के सुरक्षित सफाई, सिस्टम गति अनुकूलन, DNS कॉन्फ़िगरेशन, नेटवर्क मरम्मत और विंडोज अपडेट प्रबंधन करें।",
    "txt-tk-btn-guide": "अभी शुरू करें",
    "txt-at-intro-desc": "दैनिक विंडोज रखरखाव के लिए एक हल्का बैकग्राउंड ऑटोमेशन स्क्रिप्ट। आपके सक्रिय ब्राउज़र सत्र या ऐप प्रक्रियाओं को बाधित किए बिना सिस्टम जंक, ब्राउज़र शेडर कैश और GPU कैश को साफ़ करने के लिए टास्क शेड्यूलर के माध्यम से स्वचालित रूप से चलता है।",
    "txt-at-btn-guide": "शेड्यूल सेट करें",
    "txt-sec-feat-1-t": "100% सुरक्षित सफाई",
    "txt-sec-feat-1-d": "विशेष रूप से केवल अस्थायी फ़ोल्डरों और सिस्टम/ब्राउज़र कैश फ़ाइलों को लक्षित करता है। आपकी व्यक्तिगत फ़ाइलें, पासवर्ड, ब्राउज़र इतिहास, कुकीज़ और लॉगिन डेटा पूरी तरह से अछूते और सुरक्षित रहते हैं।",
    "txt-sec-feat-2-t": "नॉन-इंट्रूसिव डिज़ाइन",
    "txt-sec-feat-2-d": "सुचारू रूप से चलने के लिए डिज़ाइन किया गया। इंटरएक्टिव कंसोल मेनू का उपयोग करें, वन-क्लिक स्क्रिप्ट चलाएं, या किसी भी परेशान करने वाले पॉपअप के बिना बैकग्राउंड सफाई को स्वचालित करें।",
    "txt-sec-feat-3-t": "स्मार्ट प्रोसेस डिटेक्शन",
    "txt-sec-feat-3-d": "हमारी स्क्रिप्ट सफाई से पहले सक्रिय एप्लिकेशन की जांच करती है। यदि ब्राउज़र उपयोग में है, तो यह आपके खुले टैब सत्रों की सुरक्षा के लिए स्वचालित रूप से इसके कैश को छोड़ देता है।",
    "txt-sec-feat-4-t": "100% वायरस मुक्त",
    "txt-sec-feat-4-d": "VirusTotal द्वारा 100% साफ़ और सुरक्षित के रूप में परीक्षण और सत्यापित किया गया। हमारे उपकरणों में कोई मैलवेयर, स्पाईवेयर या दुर्भावनापूर्ण कोड नहीं है, यह सुनिश्चित करते हुए कि आपका सिस्टम सुरक्षित रहे।",
    "txt-jc-intro-desc": "वन-क्लिक विंडोज अनुकूलन के लिए एक क्लासिक, हल्का और सुपर-फ़ास्ट बैच स्क्रिप्ट (.bat)। जंक निर्देशिकाओं, रीसायकल बिन, लॉग इतिहास को साफ़ करने और सिस्टम रैम को मुक्त करने के लिए सरल और सुरक्षित डिज़ाइन किया गया।",
    "txt-jc-btn-guide": "रिलीज़ प्राप्त करें",
    "txt-how-title": "उपयोग कैसे करें - ncexs Toolkit",
    "txt-quick-title": "त्वरित रन (डाउनलोड की आवश्यकता नहीं)",
    "txt-quick-1": "<b>स्टार्ट मेनू</b> खोलें, <b>powershell</b> टाइप करें, राइट-क्लिक करें और <b>Run as Administrator</b> चुनें।",
    "txt-quick-2": "नीचे दिए गए कमांड को कॉपी और पेस्ट करें, फिर <b>Enter</b> दबाएं:",
    "txt-quick-3": "टूलकिट स्वचालित रूप से लॉन्च हो जाएगा।",
    "txt-quick-4-1": "चल रही प्रक्रिया को रद्द करने या रोकने के लिए, <b>Ctrl + C</b> दबाएं।",
    "txt-quick-4-2": "वापस लौटने और टूलकिट का फिर से उपयोग करने के लिए, बस नीचे दिए गए कमांड को कॉपी और पेस्ट करें:",
    "txt-menu-title": "इंटरएक्टिव मेनू विकल्प",
    "txt-opt-0": "<b>0 → Compact OS (2-5GB स्थान बचाएं)</b>",
    "txt-opt-1": "1 → सिस्टम जानकारी देखें",
    "txt-opt-2": "2 → उन्नत जंक और कैश क्लीनर",
    "txt-opt-3": "3 → रीसायकल बिन खाली करें",
    "txt-opt-4": "4 → डिस्क क्लीनअप खोलें",
    "txt-opt-5": "5 → स्मार्ट अनइंस्टॉलर",
    "txt-opt-6": "6 → नेटवर्क मरम्मत और रीसेट",
    "txt-opt-7": "7 → पावर और बैटरी उपयोगिता",
    "txt-opt-8": "8 → मेमोरी (RAM) अनुकूलन",
    "txt-opt-9": "9 → ड्राइव डीफ़्रैग्मेन्ट और अनुकूलन",
    "txt-opt-10": "10 → सिस्टम फ़ाइल चेकर और मरम्मत",
    "txt-opt-11": "11 → विंडोज अपडेट और ड्राइवर केंद्र",
    "txt-opt-12": "12 → तेज़ DNS परिवर्तक",
    "txt-opt-13": "13 → वाई-फ़ाई पासवर्ड पुनर्प्राप्ति",
    "txt-opt-14": "14 → विज़ुअल इफ़ेक्ट बूस्टर",
    "txt-opt-15": "15 → WhatsApp संग्रहण अनुकूलन",
    "txt-opt-16": "16 → टूलकिट से बाहर निकलें",
    "txt-opt-l": "L → इंटरफ़ेस भाषा बदलें",
    "txt-tip-title": "सुझाव:",
    "txt-tip-desc": "यदि C: ड्राइव भर गई है तो <b>मेनू [0] Compact OS</b> का उपयोग करें। गहन सिस्टम रखरखाव से पहले हमेशा महत्वपूर्ण डेटा का बैकअप लें।",
    "txt-feat-title": "मुख्य विशेषताओं का विवरण",
    "txt-fl-t": "भाषा बदलें (मेनू L):",
    "txt-fl-d": "टूलकिट कंसोल इंटरफ़ेस की भाषा को तुरंत अंग्रेज़ी, इंडोनेशियाई, हिन्दी आदि में बदलें।",
    "txt-f0-t": "Compact OS (मेनू 0):",
    "txt-f0-d": "सिस्टम फ़ाइलों को संपीड़ित करने के लिए एक शक्तिशाली विंडोज सुविधा। 100% सुरक्षित, प्रतिवर्ती, और व्यक्तिगत फ़ाइलों को हटाए बिना <b>2GB से 5GB</b> संग्रहण स्थान बचाता है।",
    "txt-f1-t": "सिस्टम जानकारी (मेनू 1):",
    "txt-f1-d": "CPU, RAM, विंडोज संस्करण और सक्रिय ड्राइव के शेष स्थान सहित आपके कंप्यूटर के विनिर्देशों को तुरंत प्रदर्शित करता है।",
    "txt-f2-t": "उन्नत जंक क्लीनर (मेनू 2):",
    "txt-f2-d": "अस्थायी फ़ाइलों, सिस्टम लॉग और ब्राउज़र कैश (Chrome, Edge, Brave) को सुरक्षित रूप से साफ़ करता है। गेमिंग हकलाने को रोकने के लिए <b>AMD, NVIDIA और Intel</b> GPU शेडर कैश को भी साफ़ करता है।",
    "txt-f3-t": "रीसायकल बिन खाली करें (मेनू 3):",
    "txt-f3-d": "संग्रहण स्थान खाली करने के लिए सभी उपयोगकर्ताओं और ड्राइव के लिए रीसायकल बिन को तुरंत खाली करता है।",
    "txt-f4-t": "डिस्क क्लीनअप खोलें (मेनू 4):",
    "txt-f4-d": "उन्नत सिस्टम फ़ाइल सफाई के लिए अंतर्निहित विंडोज डिस्क क्लीनअप (cleanmgr) उपयोगिता खोलता है।",
    "txt-f5-t": "स्मार्ट अनइंस्टॉलर (मेनू 5):",
    "txt-f5-d": "स्मार्ट खोज का उपयोग करके स्थापित प्रोग्रामों को तेज़ी से खोजें और अनइंस्टॉल करें। बस एप्लिकेशन का नाम या प्रारंभिक अक्षर टाइप करें!",
    "txt-f6-t": "नेटवर्क मरम्मत (मेनू 6):",
    "txt-f6-d": "5-चरणीय नेटवर्क रीसेट करता है: IP रीलीज़/रिन्यू, DNS फ़्लश, विंसॉक रीसेट और TCP/IP स्टैक रीसेट। बार-बार डिस्कनेक्ट होने की समस्या को हल करने में मदद करता है।",
    "txt-f7-t": "पावर और बैटरी उपयोगिता (मेनू 7):",
    "txt-f7-d": "HTML प्रारूप में विस्तृत बैटरी स्वास्थ्य रिपोर्ट उत्पन्न करें, उच्च-प्रदर्शन पावर योजना कॉन्फ़िगर करें, और सिस्टम स्लीप मोड प्रबंधित करें।",
    "txt-f8-t": "मेमोरी अनुकूलन (मेनू 8):",
    "txt-f8-d": "सिस्टम प्रतिक्रिया और गेमिंग गति में सुधार करने के लिए स्टैंडबाय मेमोरी को साफ़ करें और अप्रयुक्त RAM कैश को तुरंत मुक्त करें।",
    "txt-f9-t": "ड्राइव अनुकूलन (मेनू 9):",
    "txt-f9-d": "SSD के लिए TRIM कमांड की जांच और निष्पादन करता है या पढ़ने/लिखने की गति को उच्च बनाए रखने के लिए HDD को डीफ़्रैग्मेन्ट करता है।",
    "txt-f10-t": "सिस्टम स्वास्थ्य जांच (मेनू 10):",
    "txt-f10-d": "दूषित विंडोज सिस्टम फ़ाइलों को स्वचालित रूप से खोजने और सुधारने के लिए SFC (सिस्टम फ़ाइल चेकर) और DISM मरम्मत उपकरण चलाता है।",
    "txt-f11-t": "अपडेट और ड्राइवर केंद्र (मेनू 11):",
    "txt-f11-d": "अपडेट सेवाओं (wuauserv, bits, cryptSvc) को रीसेट करके और डाउनलोड कैश फ़ोल्डर का नाम बदलकर अटके या विफल विंडोज अपडेट को ठीक करता है।",
    "txt-f12-t": "DNS परिवर्तक (मेनू 12):",
    "txt-f12-d": "आपके लिए सिस्टम DNS सेटिंग्स को लोकप्रिय और सुरक्षित प्रदाताओं जैसे Google Public DNS या Cloudflare में बदलना आसान बनाता है।",
    "txt-f13-t": "वाई-फ़ाई पासवर्ड रिकवरी (मेनू 13):",
    "txt-f13-d": "आपके कंप्यूटर पर सहेजे गए वाई-फ़ाई नेटवर्क नाम और पासवर्ड को तुरंत पुनर्प्राप्त और प्रदर्शित करता है।",
    "txt-f14-t": "विज़ुअल इफ़ेक्ट बूस्टर (मेनू 14):",
    "txt-f14-d": "सिस्टम गति और प्रदर्शन को बढ़ाने के लिए विंडोज एनिमेशन और विज़ुअल इफ़ेक्ट्स को अनुकूलित करता है, जो पुराने पीसी पर बहुत उपयोगी है।",
    "txt-f15-t": "WhatsApp अनुकूलन (मेनू 15):",
    "txt-f15-d": "गीगाबाइट स्थान खाली करने के लिए WhatsApp Desktop से अनावश्यक कैश, लॉग और मीडिया फ़ाइलों को साफ़ करता है।",
    "txt-f16-t": "बाहर निकलें (मेनू 16):",
    "txt-f16-d": "टूलकिट कंसोल से सुरक्षित रूप से बाहर निकलें और अपनी पावरशेल निष्पादन नीति को उसकी डिफ़ॉल्ट स्थिति में पुनर्स्थापित करें।",
    "txt-cl-title": "संस्करण इतिहास / चेंजलॉग",
    "txt-cl-desc": "ncexs उपयोगिताओं में नवीनतम अपडेट और सुधारों की सूची।",
    "txt-how-at-title": "उपयोग कैसे करें - ncexs AutoTask",
    "txt-at-dl-title": "स्क्रिप्ट डाउनलोड करें",
    "txt-at-dl-desc": "हमारे गिटहब रिपॉजिटरी से आधिकारिक पावरशेल ऑटोमेशन स्क्रिप्ट डाउनलोड करें:",
    "txt-at-dl-btn": "ncexs-AutoTask.ps1 डाउनलोड करें",
    "txt-at-manual-title": "मैनुअल रन कमांड",
    "txt-at-manual-1": "<b>PowerShell</b> खोलें (व्यवस्थापक के रूप में अनुशंसित)।",
    "txt-at-manual-2": "इस कमांड के साथ स्क्रिप्ट को स्थानीय रूप से चलाएं:",
    "txt-at-sched-title": "टास्क शेड्यूलर के साथ स्वचालित करें (अनुशंसित)",
    "txt-at-step-1": "<b>टास्क शेड्यूलर खोलें</b><p><b>Win + R</b> दबाएं, <code class='code-inline'>taskschd.msc</code> टाइप करें, और <b>Enter</b> दबाएं।</p>",
    "txt-at-step-2": "<b>नया टास्क बनाएं</b><p>दाएं साइडबार में <b>Create Task</b> पर क्लिक करें (Basic Task न चुनें)। <b>General</b> टैब में:</p><ul><li>नाम: <code class='code-inline'>ncexs Auto Task</code></li><li>चेक करें: <b>'Run whether user is logged on or not'</b></li><li>चेक करें: <b>'Run with highest privileges'</b></li></ul>",
    "txt-at-step-3": "<b>ट्रिगर कॉन्फ़िगर करें (शेड्यूल)</b><p><b>Triggers</b> टैब पर जाएं, <b>New</b> पर क्लिक करें। टास्क शुरू करने को <b>On a schedule</b> पर सेट करें, <b>Daily</b> चुनें। वैकल्पिक रूप से, <b>'Repeat task every:'</b> को चेक करें, <code class='code-inline'>6 hours</code> टाइप करें, और अवधि को <b>Indefinitely</b> पर सेट करें।</p>",
    "txt-at-step-4": "<b>एक्शन कॉन्फ़िगर करें</b><p><b>Actions</b> टैब पर जाएं, <b>New</b> पर क्लिक करें, एक्शन को <b>'Start a program'</b> पर सेट करें:</p><ul><li>प्रोग्राम/स्क्रिप्ट: <code class='code-inline'>powershell.exe</code></li><li>तर्क जोड़ें: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(फ़ोल्डर पथ को उस वास्तविक स्थान से बदलें जहां आपने स्क्रिप्ट सहेजी है। डिबग देखने के लिए -Silent हटा दें)</i></li></ul>",
    "txt-at-step-5": "<b>शर्तें कॉन्फ़िगर करें</b><p><b>Conditions</b> टैब में, अनचेक करें: <b>'Start the task only if the computer is on AC power'</b> (ताकि बैटरी का उपयोग करते समय लैपटॉप पर भी चल सके)।</p>",
    "txt-at-step-6": "<b>सेटिंग्स कॉन्फ़िगर करें और सहेजें</b><p><b>Settings</b> टैब में, <b>'Run task as soon as possible after a scheduled start is missed'</b> को चेक करें। <b>OK</b> पर क्लिक करें और संकेत मिलने पर अपना विंडोज पासवर्ड दर्ज करें।</p>",
    "txt-how-jc-title": "उपयोग कैसे करें - ncexs Junk Cleaner",
    "txt-jc-run-title": "वन-क्लिक रन गाइड",
    "txt-jc-step-1": "आधिकारिक <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a> पेज से नवीनतम रिलीज़ ज़िप डाउनलोड करें।",
    "txt-jc-step-2": "डाउनलोड की गई ज़िप फ़ाइल को अनज़िप करें।",
    "txt-jc-step-3": "प्रोग्राम शुरू करने के लिए <code class='code-inline'>ncexs-junkcleaner.bat</code> फ़ाइल पर डबल-क्लिक करें।",
    "txt-jc-step-4": "यदि SmartScreen चेतावनी देता है ('Windows protected your PC'), तो <b>More info</b> → <b>Run anyway</b> पर क्लिक करें।",
    "txt-jc-step-5": "उपयोगकर्ता खाता नियंत्रण (UAC) द्वारा संकेत दिए जाने पर व्यवस्थापक पहुंच की अनुमति दें।",
    "txt-jc-step-6": "ऑन-स्क्रीन संकेतों (टाइप <code class='code-inline'>Y</code> या <code class='code-inline'>N</code>) का पालन करें: जंक क्लीनर, डीप क्लीनअप, एंटीवायरस क्विक स्कैन, या रैम अनुकूलन के लिए।"
  },
  ru: {
    "txt-lang-label": "Выберите язык:",
    "txt-hub-subtitle": "Раскройте полный потенциал вашего ПК",
    "txt-hub-desc": "Изучите тщательно подобранный набор легких, безопасных и мощных инструментов, созданных для оптимизации, очистки и автоматизации вашей системы Windows — чистая производительность, никакого лишнего софта.",
    "txt-tab-intro": "Введение",
    "txt-tab-projects": "Проекты",
    "txt-sub-tab-how": "Как использовать",
    "txt-sub-tab-changelog": "История изменений",
    "txt-bio-title": "Здравствуйте, я ncexs",
    "txt-bio-desc": "Я разработчик, изучающий создание легких и полезных инструментов для каждого. Я создал эти утилиты, чтобы помочь себе и другим эффективно управлять системами Windows без какого-либо раздутого ПО (bloatware).",
    "txt-sec-title": "Безопасность и доверие",
    "txt-sec-desc": "Эти утилиты на 100% прозрачны и имеют открытый исходный код. Они не собирают никаких личных данных. Вы можете свободно проверить код в любое время.",
    "txt-select-project-title": "<i class=\"fas fa-compass\" style=\"color: var(--primary-color);\"></i> Исследуйте наши проекты",
    "txt-select-project-desc": "Нажмите на любой проект ниже, чтобы увидеть его подробное руководство, команды для ручного запуска и полную историю версий.",
    "txt-back-home": "Вернуться на главную",
    "txt-cta-tk-home": "Смотреть руководство &rarr;",
    "txt-cta-at-home": "Смотреть руководство &rarr;",
    "txt-cta-jc-home": "Смотреть руководство &rarr;",
    "txt-cta-tk-detail": "Смотреть руководство &rarr;",
    "txt-cta-at-detail": "Смотреть руководство &rarr;",
    "txt-cta-jc-detail": "Смотреть руководство &rarr;",
    "txt-tk-intro-desc": "Интерактивная консоль «всё в одном» с открытым исходным кодом. Выполняйте безопасную очистку, ускорение системы, настройку DNS, восстановление сети и управление обновлениями Windows — всё без установки.",
    "txt-tk-btn-guide": "Начать сейчас",
    "txt-at-intro-desc": "Легкий скрипт автоматизации для тихой ежедневной очистки Windows в фоновом режиме. Запускается автоматически через Планировщик задач (Task Scheduler) для удаления системного мусора и кэша браузеров без прерывания активных процессов.",
    "txt-at-btn-guide": "Настроить расписание",
    "txt-sec-feat-1-t": "100% безопасная очистка",
    "txt-sec-feat-1-d": "Строго нацелена только на временные папки и файлы кэша. Ваши личные файлы, пароли, история браузеров, файлы cookie и данные входа остаются в полной безопасности.",
    "txt-sec-feat-2-t": "Ненавязчивый дизайн",
    "txt-sec-feat-2-d": "Создано для плавной работы. Используйте интерактивное меню, запускайте очистку в один клик или настройте фоновую автоматизацию без каких-либо раздражающих всплывающих окон.",
    "txt-sec-feat-3-t": "Умное обнаружение процессов",
    "txt-sec-feat-3-d": "Наши скрипты проверяют запущенные приложения перед очисткой. Если браузер используется, кэш пропускается, чтобы защитить ваши открытые вкладки и сессии.",
    "txt-sec-feat-4-t": "100% без вирусов",
    "txt-sec-feat-4-d": "Проверено и подтверждено на 100% чистоту сервисом VirusTotal. В наших инструментах нет рекламного или шпионского ПО, что гарантирует абсолютную безопасность системы.",
    "txt-jc-intro-desc": "Классический, легкий и невероятно быстрый пакетный скрипт (.bat) для оптимизации Windows в один клик. Простая и безопасная очистка временных папок, Корзины, логов и освобождение оперативной памяти.",
    "txt-jc-btn-guide": "Скачать релиз",
    "txt-how-title": "Как использовать - ncexs Toolkit",
    "txt-quick-title": "Быстрый запуск (без скачивания)",
    "txt-quick-1": "Откройте <b>меню Пуск</b>, введите <b>powershell</b>, нажмите правой кнопкой мыши и выберите <b>Запуск от имени администратора</b>.",
    "txt-quick-2": "Скопируйте и вставьте команду ниже, затем нажмите <b>Enter</b>:",
    "txt-quick-3": "Набор инструментов запустится автоматически.",
    "txt-quick-4-1": "Чтобы отменить или остановить текущий процесс, нажмите <b>Ctrl + C</b>.",
    "txt-quick-4-2": "Чтобы вернуться и использовать набор инструментов снова, просто скопируйте и вставьте команду ниже еще раз:",
    "txt-menu-title": "Опции интерактивного меню",
    "txt-opt-0": "<b>0 → Compact OS (экономия 2-5 ГБ места)</b>",
    "txt-opt-1": "1 → Информация о системе",
    "txt-opt-2": "2 → Расширенная очистка мусора и кэша",
    "txt-opt-3": "3 → Очистить Корзину",
    "txt-opt-4": "4 → Запустить Очистку диска (Disk Cleanup)",
    "txt-opt-5": "5 → Умное удаление программ",
    "txt-opt-6": "6 → Восстановление и сброс сети",
    "txt-opt-7": "7 → Управление питанием и отчет о батарее",
    "txt-opt-8": "8 → Оптимизация оперативной памяти (RAM)",
    "txt-opt-9": "9 → Дефрагментация и оптимизация дисков",
    "txt-opt-10": "10 → Проверка и восстановление системных файлов",
    "txt-opt-11": "11 → Центр обновлений Windows и драйверов",
    "txt-opt-12": "12 → Быстрая смена DNS",
    "txt-opt-13": "13 → Просмотр сохраненных паролей Wi-Fi",
    "txt-opt-14": "14 → Ускорение визуальных эффектов",
    "txt-opt-15": "15 → Оптимизация хранилища WhatsApp",
    "txt-opt-16": "16 → Выход из утилиты",
    "txt-opt-l": "L → Изменить язык интерфейса",
    "txt-tip-title": "Совет:",
    "txt-tip-desc": "Используйте <b>Меню [0] Compact OS</b>, если диск C: заполнен. Всегда делайте резервную копию важных данных перед глубоким обслуживанием системы.",
    "txt-feat-title": "Описание основных функций",
    "txt-fl-t": "Смена языка (Меню L):",
    "txt-fl-d": "Мгновенное переключение языка интерфейса консоли между английским, индонезийским, русским и другими.",
    "txt-f0-t": "Compact OS (Меню 0):",
    "txt-f0-d": "Мощная функция Windows для сжатия системных файлов. 100% безопасно и обратимо, экономит от <b>2 до 5 ГБ</b> места без удаления личных файлов.",
    "txt-f1-t": "Информация о системе (Меню 1):",
    "txt-f1-d": "Быстрое отображение характеристик вашего ПК: процессор, оперативная память, версия Windows и свободное место на дисках.",
    "txt-f2-t": "Расширенная очистка мусора (Меню 2):",
    "txt-f2-d": "Безопасное удаление временных файлов, системных логов и кэша браузеров (Chrome, Edge, Brave). Также очищает кэш шейдеров <b>AMD, NVIDIA и Intel</b> для устранения фризов в играх.",
    "txt-f3-t": "Очистка Корзины (Меню 3):",
    "txt-f3-d": "Мгновенная очистка Корзины для всех пользователей и дисков для освобождения места.",
    "txt-f4-t": "Очистка диска (Меню 4):",
    "txt-f4-d": "Запуск встроенной утилиты Windows (cleanmgr) для глубокой очистки системных файлов.",
    "txt-f5-t": "Умный деинсталлятор (Меню 5):",
    "txt-f5-d": "Быстрый поиск и удаление установленных программ с помощью умного поиска. Просто введите название или начальные буквы приложения!",
    "txt-f6-t": "Восстановление сети (Меню 6):",
    "txt-f6-d": "Выполняет 5-этапный сброс сети: обновление IP, сброс DNS, Winsock и стека TCP/IP. Помогает устранить частые разрывы соединения.",
    "txt-f7-t": "Утилита питания и батареи (Меню 7):",
    "txt-f7-d": "Создание подробного отчета о состоянии батареи в формате HTML, настройка схемы высокой производительности и управление спящим режимом.",
    "txt-f8-t": "Оптимизация памяти (Меню 8):",
    "txt-f8-d": "Мгновенная очистка резервной памяти и освобождение неиспользуемого кэша RAM для ускорения отклика системы и игр.",
    "txt-f9-t": "Оптимизация дисков (Меню 9):",
    "txt-f9-d": "Проверка и запуск команды TRIM для SSD или дефрагментация HDD для поддержания высокой скорости чтения и записи.",
    "txt-f10-t": "Проверка здоровья системы (Меню 10):",
    "txt-f10-d": "Запуск инструментов сканирования и восстановления (SFC и DISM) для автоматического поиска и исправления поврежденных файлов Windows.",
    "txt-f11-t": "Центр обновлений и драйверов (Меню 11):",
    "txt-f11-d": "Исправление зависших или неудачных обновлений Windows путем перезапуска служб (wuauserv, bits, cryptSvc) и переименования кэша загрузок.",
    "txt-f12-t": "Смена DNS (Меню 12):",
    "txt-f12-d": "Легкое переключение настроек DNS на быстрые и безопасные публичные серверы, такие как Google Public DNS или Cloudflare.",
    "txt-f13-t": "Восстановление паролей Wi-Fi (Меню 13):",
    "txt-f13-d": "Быстрый поиск и отображение всех сохраненных имен сетей Wi-Fi и паролей к ним на вашем ПК.",
    "txt-f14-t": "Ускорение визуальных эффектов (Меню 14):",
    "txt-f14-d": "Оптимизация анимации и визуальных эффектов Windows для повышения скорости и производительности на старых ПК.",
    "txt-f15-t": "Оптимизация WhatsApp (Меню 15):",
    "txt-f15-d": "Очистка ненужного кэша, логов и старых медиафайлов WhatsApp Desktop для освобождения гигабайт места.",
    "txt-f16-t": "Выход из утилиты (Меню 16):",
    "txt-f16-d": "Безопасное закрытие консоли и возврат политики выполнения PowerShell в исходное состояние.",
    "txt-cl-title": "История версий / Список изменений",
    "txt-cl-desc": "Список последних обновлений и улучшений в утилитах ncexs.",
    "txt-how-at-title": "Как использовать - ncexs AutoTask",
    "txt-at-dl-title": "Скачать скрипт",
    "txt-at-dl-desc": "Скачайте официальный скрипт автоматизации PowerShell из нашего репозитория GitHub:",
    "txt-at-dl-btn": "Скачать ncexs-AutoTask.ps1",
    "txt-at-manual-title": "Команда для ручного запуска",
    "txt-at-manual-1": "Откройте <b>PowerShell</b> (рекомендуется от имени администратора).",
    "txt-at-manual-2": "Запустите скрипт локально с помощью этой команды:",
    "txt-at-sched-title": "Автоматизация через Планировщик задач (рекомендуется)",
    "txt-at-step-1": "<b>Откройте Планировщик задач</b><p>Нажмите <b>Win + R</b>, введите <code class='code-inline'>taskschd.msc</code> и нажмите <b>Enter</b>.</p>",
    "txt-at-step-2": "<b>Создайте новую задачу</b><p>Нажмите <b>Create Task</b> на правой панели (не выбирайте Basic Task). На вкладке <b>General</b>:</p><ul><li>Имя: <code class='code-inline'>ncexs Auto Task</code></li><li>Отметьте: <b>'Run whether user is logged on or not'</b></li><li>Отметьте: <b>'Run with highest privileges'</b></li></ul>",
    "txt-at-step-3": "<b>Настройте триггер (расписание)</b><p>Перейдите на вкладку <b>Triggers</b>, нажмите <b>New</b>. Установите запуск <b>On a schedule</b>, выберите <b>Daily</b>. Опционально отметьте <b>'Repeat task every:'</b>, введите <code class='code-inline'>6 hours</code> и установите продолжительность на <b>Indefinitely</b>.</p>",
    "txt-at-step-4": "<b>Настройте действие (Action)</b><p>Перейдите на вкладку <b>Actions</b>, нажмите <b>New</b>, установите действие <b>'Start a program'</b>:</p><ul><li>Программа/скрипт: <code class='code-inline'>powershell.exe</code></li><li>Аргументы: <code class='code-inline'>-ExecutionPolicy Bypass -File \"C:\\Path\\To\\ncexs-AutoTask.ps1\" -Silent</code></li><li><i>(Замените путь к папке на то место, где вы сохранили скрипт. Удалите -Silent для просмотра отладки)</i></li></ul>",
    "txt-at-step-5": "<b>Настройте условия (Conditions)</b><p>На вкладке <b>Conditions</b> снимите галочку: <b>'Start the task only if the computer is on AC power'</b> (чтобы задача работала на ноутбуках от батареи).</p>",
    "txt-at-step-6": "<b>Сохраните настройки</b><p>На вкладке <b>Settings</b> отметьте <b>'Run task as soon as possible after a scheduled start is missed'</b>. Нажмите <b>OK</b> и введите пароль Windows при появлении запроса.</p>",
    "txt-how-jc-title": "Как использовать - ncexs Junk Cleaner",
    "txt-jc-run-title": "Руководство по запуску в один клик",
    "txt-jc-step-1": "Скачайте последний ZIP-архив релиза со страницы <a href='https://github.com/ncexs/ncexs-junkcleaner/releases' target='_blank' style='color:var(--primary-color); text-decoration:none; font-weight:bold;'>GitHub Releases</a>.",
    "txt-jc-step-2": "Распакуйте скачанный ZIP-архив.",
    "txt-jc-step-3": "Дважды щелкните файл <code class='code-inline'>ncexs-junkcleaner.bat</code> для запуска программы.",
    "txt-jc-step-4": "Если SmartScreen предупреждает ('Windows protected your PC'), нажмите <b>Подробнее (More info)</b> → <b>Выполнить в любом случае (Run anyway)</b>.",
    "txt-jc-step-5": "Разрешите доступ администратора при появлении запроса от Контроля учетных записей (UAC).",
    "txt-jc-step-6": "Следуйте инструкциям на экране (введите <code class='code-inline'>Y</code> или <code class='code-inline'>N</code>) для: очистки мусора, глубокой очистки, быстрой проверки антивирусом или оптимизации RAM."
  }
};

async function setLanguage(lang) {
  // Sync dropdown value
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;

  let t = fallbackTranslations[lang] || fallbackTranslations['en'];
  try {
    const res = await fetch(`./locales/${lang}.json`);
    if (res.ok) {
      const fetched = await res.json();
      if (fetched && typeof fetched === 'object') {
        t = fetched;
      }
    }
  } catch (err) {
    console.warn("Could not fetch locales JSON (likely running locally via file:///). Using built-in fallback.");
  }

  for (const key in t) {
    const el = document.getElementById(key);
    if (el) el.innerHTML = t[key];
  }

  // Update detail view CTA texts dynamically for the active project
  let viewingText = 'Currently Viewing';
  let guideText = 'View Guide &rarr;';
  if (lang === 'id' || lang === 'jv' || lang === 'su') {
    viewingText = 'Sedang Dilihat';
    guideText = 'Lihat Panduan &rarr;';
  } else if (lang === 'hi') {
    viewingText = 'वर्तमान में देख रहे हैं';
    guideText = 'गाइड देखें &rarr;';
  } else if (lang === 'ru') {
    viewingText = 'Сейчас просматриваете';
    guideText = 'Руководство &rarr;';
  } else if (lang === 'ja') {
    viewingText = '閲覧中';
    guideText = 'ガイドを見る &rarr;';
  } else if (lang === 'ko') {
    viewingText = '현재 보는 중';
    guideText = '가이드 보기 &rarr;';
  } else if (lang === 'zh') {
    viewingText = '当前查看';
    guideText = '查看指南 &rarr;';
  } else if (lang === 'ar') {
    viewingText = 'معاينة حالياً';
    guideText = 'عرض الدليل &larr;';
  }

  if (lang === 'ar') {
    document.body.setAttribute('dir', 'rtl');
  } else {
    document.body.removeAttribute('dir');
  }

  document.querySelectorAll('#project-detail-view .project-btn').forEach(btn => {
    const proj = btn.getAttribute('data-project');
    const ctaTextEl = btn.querySelector('.project-btn-cta-text');
    if (ctaTextEl) {
      if (proj === activeProject) {
        ctaTextEl.innerHTML = viewingText;
      } else {
        ctaTextEl.innerHTML = guideText;
      }
    }
  });

  // Instant clock language switch update
  if (typeof updateRealTimeClock === 'function') {
    updateRealTimeClock();
  }

  // Reload changelog to reflect active language
  if (typeof loadChangelogForProject === 'function') {
    loadChangelogForProject(activeProject);
  }
}
window.setLanguage = setLanguage;



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
    
    const langSelect = document.getElementById('lang-select');
    const currentLang = langSelect ? langSelect.value : 'en';
    const filePath = (currentLang === 'en') ? 'CHANGELOG.md' : `docs/CHANGELOG.${currentLang}.md`;

    if (project === 'toolkit') {
      let url = `https://raw.githubusercontent.com/ncexs/ncexs-toolkit/main/${filePath}`;
      let response = await fetch(url, { cache: "no-store" });
      if (!response.ok && currentLang !== 'en') {
        url = `https://raw.githubusercontent.com/ncexs/ncexs-toolkit/main/CHANGELOG.md`;
        response = await fetch(url, { cache: "no-store" });
      }
      if (!response.ok) {
        throw new Error("CHANGELOG.md not found in ncexs-toolkit repository.");
      }
      markdownText = await response.text();
      const splitVersions = markdownText.split(/(?=^# 🚀 ncexs Toolkit v)/m);
      rawVersions = splitVersions.filter(v => v.trim() !== '');
    } 
    else if (project === 'autotask') {
      let url = `https://raw.githubusercontent.com/ncexs/ncexs-AutoTask/main/${filePath}`;
      let response = await fetch(url, { cache: "no-store" });
      if (!response.ok && currentLang !== 'en') {
        url = `https://raw.githubusercontent.com/ncexs/ncexs-AutoTask/main/CHANGELOG.md`;
        response = await fetch(url, { cache: "no-store" });
      }
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
      let url = `https://raw.githubusercontent.com/ncexs/ncexs-junkcleaner/main/${filePath}`;
      let response = await fetch(url, { cache: "no-store" });
      if (!response.ok && currentLang !== 'en') {
        url = `https://raw.githubusercontent.com/ncexs/ncexs-junkcleaner/main/CHANGELOG.md`;
        response = await fetch(url, { cache: "no-store" });
      }
      if (!response.ok) {
        throw new Error("CHANGELOG.md not found in ncexs-junkcleaner repository.");
      }
      markdownText = await response.text();
      
      const splitVersions = markdownText.split(/(?=^##\s*\[v)/m);
      rawVersions = splitVersions.filter(v => {
        const trimmed = v.trim();
        return trimmed !== '' && trimmed.startsWith('## [v');
      });
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
      
      const cleanLines = lines.filter(l => {
        const text = l.trim();
        if (text.includes('Bahasa Indonesia') && (text.includes('English') || text.includes('Basa Jawa'))) return false;
        if (text.startsWith('🌐')) return false;
        return true;
      });
      let htmlBody = parseMarkdown(cleanLines.join('\n'));
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

const fs = require('fs');
const https = require('https');
const path = require('path');

const SCRIPT_URL = 'https://raw.githubusercontent.com/ncexs/ncexs-toolkit/main/ncexs-Toolkit.ps1';
const INDEX_PATH = 'index.html';
const JS_PATH = 'js/main.js';
const LOCALE_EN_PATH = 'locales/en.json';
const LOCALE_ID_PATH = 'locales/id.json';

https.get(SCRIPT_URL, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        // Robust regex to match matching brackets properly even with {0} inside
        const enMatch = data.match(/"EN"\s*=\s*@\{([\s\S]+?)\n\s*\}/);
        const idMatch = data.match(/"ID"\s*=\s*@\{([\s\S]+?)\n\s*\}/);
        
        if (!enMatch || !idMatch) {
            console.error("Could not find translation blocks in PS1 script.");
            process.exit(1);
        }

        const parseDict = (str) => {
            const dict = {};
            const regex = /"([^"]+)"\s*=\s*"([^"]+)"/g;
            let match;
            while ((match = regex.exec(str)) !== null) {
                dict[match[1]] = match[2];
            }
            return dict;
        };

        const enDict = parseDict(enMatch[1]);
        const idDict = parseDict(idMatch[1]);

        const menuKeys = Object.keys(enDict).filter(k => k.startsWith('Menu_Option'));
        
        menuKeys.sort((a, b) => {
            let valA = a.replace('Menu_Option', '').toLowerCase();
            let valB = b.replace('Menu_Option', '').toLowerCase();
            if (valA === valB) return 0;
            if (valA === 'q') return -1;
            if (valB === 'q') return 1;
            if (valA === 'l') return 1;
            if (valB === 'l') return -1;
            
            const numA = parseInt(valA);
            const numB = parseInt(valB);
            if (isNaN(numA) && isNaN(numB)) return valA.localeCompare(valB);
            if (isNaN(numA)) return 1;
            if (isNaN(numB)) return -1;
            return numA - numB;
        });

        let htmlList = '';
        let enTrans = '';
        let idTrans = '';

        let hasQ = false;

        const formatText = (num, text) => {
            const prefix = num.toUpperCase() + " → ";
            if (num === 'q' || num === '0') return `<b>${prefix}${text}</b>`;
            return `${prefix}${text}`;
        };

        menuKeys.forEach(key => {
            const idSuffix = key.replace('Menu_Option', '').toLowerCase();
            if (idSuffix === 'q') hasQ = true;

            const transKey = "txt-opt-" + idSuffix;

            htmlList += `          <li id="${transKey}"></li>\n`;
            enTrans += `        "${transKey}": "${formatText(idSuffix, enDict[key])}",\n`;
            if (idDict[key]) {
                idTrans += `        "${transKey}": "${formatText(idSuffix, idDict[key])}",\n`;
            }
        });
        
        if (!hasQ) {
            htmlList = `          <li id="txt-opt-q"></li>\n` + htmlList;
            enTrans = `        "txt-opt-q": "<b>Q → Quick Fix (Recommended)</b>",\n` + enTrans;
            idTrans = `        "txt-opt-q": "<b>Q → Perbaikan Cepat (Disarankan)</b>",\n` + idTrans;
        }

        let indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');
        let mainJs = fs.readFileSync(JS_PATH, 'utf8');

        // Update index.html menu grid list items
        indexHtml = indexHtml.replace(
            /(<!-- MENU_LIST_START -->)[\s\S]*?(<!-- MENU_LIST_END -->)/,
            `$1\n${htmlList}          $2`
        );

        // Update js/main.js fallbackTranslations inline dictionaries
        mainJs = mainJs.replace(
            /(\/\* MENU_TRANS_EN_START \*\/)[\s\S]*?(\/\* MENU_TRANS_EN_END \*\/)/,
            `$1\n${enTrans}        $2`
        );

        mainJs = mainJs.replace(
            /(\/\* MENU_TRANS_ID_START \*\/)[\s\S]*?(\/\* MENU_TRANS_ID_END \*\/)/,
            `$1\n${idTrans}        $2`
        );

        fs.writeFileSync(INDEX_PATH, indexHtml, 'utf8');
        fs.writeFileSync(JS_PATH, mainJs, 'utf8');
        console.log("index.html and js/main.js updated successfully.");

        // NEW: Sync directly to ALL locale JSON files in the locales directory!
        const LOCALES_DIR = 'locales';
        if (fs.existsSync(LOCALES_DIR)) {
            const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
            localeFiles.forEach(file => {
                const localePath = path.join(LOCALES_DIR, file);
                const localeName = file.replace('.json', ''); // e.g. 'en', 'id', 'ja', etc.
                const langJson = JSON.parse(fs.readFileSync(localePath, 'utf8'));
                
                menuKeys.forEach(key => {
                    const idSuffix = key.replace('Menu_Option', '').toLowerCase();
                    const transKey = "txt-opt-" + idSuffix;
                    
                    if (localeName === 'en') {
                        // Always overwrite English with latest from PS1 script
                        langJson[transKey] = formatText(idSuffix, enDict[key]);
                    } else if (localeName === 'id') {
                        // Always overwrite Indonesian with latest from PS1 script
                        if (idDict[key]) {
                            langJson[transKey] = formatText(idSuffix, idDict[key]);
                        } else {
                            // Fallback to English if Indonesian is missing in PS1
                            langJson[transKey] = formatText(idSuffix, enDict[key]);
                        }
                    } else {
                        // For other languages:
                        // If it doesn't have the translation yet, set English as fallback
                        // If it already has a translation, do not overwrite it!
                        if (!langJson[transKey]) {
                            langJson[transKey] = formatText(idSuffix, enDict[key]);
                        }
                    }
                });

                // Handle Option Q specifically if not present
                if (!hasQ) {
                    const qKey = "txt-opt-q";
                    if (localeName === 'en') {
                        langJson[qKey] = "<b>Q → Quick Fix (Recommended)</b>";
                    } else if (localeName === 'id') {
                        langJson[qKey] = "<b>Q → Perbaikan Cepat (Disarankan)</b>";
                    } else {
                        if (!langJson[qKey]) {
                            langJson[qKey] = "<b>Q → Quick Fix (Recommended)</b>";
                        }
                    }
                }

                // Write back the updated JSON file
                fs.writeFileSync(localePath, JSON.stringify(langJson, null, 2), 'utf8');
                console.log(`${localePath} synchronized successfully.`);
            });
        }

        // Check if explanations are missing in index.html, and warn developer
        menuKeys.forEach(key => {
            const idSuffix = key.replace('Menu_Option', '').toLowerCase();
            if (idSuffix !== 'q' && idSuffix !== 'l') {
                const titleKey = `txt-f${idSuffix}-t`;
                if (!indexHtml.includes(titleKey)) {
                    console.warn(`\x1b[33m[WARNING] Missing Key Feature Explanation in index.html for Option ${idSuffix}! Please add:\x1b[0m`);
                    console.warn(`  <li>`);
                    console.warn(`    <b id="${titleKey}">[Title for Menu ${idSuffix}]:</b><br>`);
                    console.warn(`    <span id="txt-f${idSuffix}-d">[Description of Menu ${idSuffix}...]</span>`);
                    console.warn(`  </li>`);
                }
            }
        });
    });
}).on("error", (err) => {
    console.error("Error: " + err.message);
    process.exit(1);
});

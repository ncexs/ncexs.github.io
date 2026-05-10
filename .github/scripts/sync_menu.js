const fs = require('fs');
const https = require('https');

const SCRIPT_URL = 'https://raw.githubusercontent.com/ncexs/ncexs-toolkit/main/Test%20Build/ncexs-Toolkit-Test.ps1';
const INDEX_PATH = 'index.html';
const JS_PATH = 'js/main.js';

https.get(SCRIPT_URL, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        const enMatch = data.match(/"EN"\s*=\s*@\{([^}]+)\}/);
        const idMatch = data.match(/"ID"\s*=\s*@\{([^}]+)\}/);
        
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

        const menuKeys = Object.keys(enDict).filter(k => k.startsWith('Menu_Option') && k !== 'Menu_OptionL' && k !== 'Menu_Option16');
        
        menuKeys.sort((a, b) => {
            let valA = a.replace('Menu_Option', '').toLowerCase();
            let valB = b.replace('Menu_Option', '').toLowerCase();
            if (valA === 'q') return -1;
            if (valB === 'q') return 1;
            return parseInt(valA) - parseInt(valB);
        });

        let htmlList = '';
        let enTrans = '';
        let idTrans = '';

        let hasQ = false;

        menuKeys.forEach(key => {
            const idSuffix = key.replace('Menu_Option', '').toLowerCase();
            if (idSuffix === 'q') hasQ = true;

            const transKey = "txt-opt-" + idSuffix;

            htmlList += `          <li id="${transKey}"></li>\n`;

            const formatText = (num, text) => {
                const prefix = num.toUpperCase() + " → ";
                if (num === 'q' || num === '0') return `<b>${prefix}${text}</b>`;
                return `${prefix}${text}`;
            };

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

        indexHtml = indexHtml.replace(
            /(<!-- MENU_LIST_START -->)[\s\S]*?(<!-- MENU_LIST_END -->)/,
            `$1\n${htmlList}          $2`
        );

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
        console.log("index.html updated successfully.");
    });
}).on("error", (err) => {
    console.error("Error: " + err.message);
    process.exit(1);
});


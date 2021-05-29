//  script used for searching text withing the websites available for viewing
//  the paths of all the available html files are taken from the json file provided when building the website
//  the function used for searching is called:
//
//      searchSites(value: String, onlySearchCurrentSite:Boolean = false, onlySearchCurrentLang: Boolean = false, returnHighlighedPreviewFirstOccurrence: Boolean = false)
//
//  

const CURRENT_URL_SCHEME = location.href.split("://")[0].toUpperCase();

/**
 * Object holding the constants for the searcher script.
 */
const C = {
    /**
     * The path to the file containing all the available html files.
     */
    FILE_PATH: location.href.split("/html/")[0] + "/files/htmlfiles.json",
    /**
     * The path to the html directory containing all the html files.
     */
    HTML_FILE_PATH: location.href.split("/html/")[0] + "/html",
    /**
     * The number of characters to display with the searched value, when highlight previewing is enabled.
     */
    PREVIEW_LENGTH: 35,
    /**
     * The maximum number of returned preview lines containing the searched value per a website.
     * @deprecated For now only returning one preview.
     */
    PREVIEW_COUNT: 3,
    /**
     * The current language of the website.
     */
    CURRENT_LANG: location.href.includes("/en/") ? "en" : "sk",
    /**
     * Check if the current url scheme can be used with the `fetch API`.
     */
    CURRENT_URL_SCHEME_CORRECT: CURRENT_URL_SCHEME == "HTTP" || CURRENT_URL_SCHEME == "HTTPS",
    /**
     * The minimal search string length, before function `searchSites()` starts actual search.
     */
    MIN_SEARCH_LENGTH: 3,
}

/**
 * Object holding all the functions used by the searcher script.
 */
var F = {
    /**
     * Method used to check whether the text provided is empty.
     * @param {String} text The string to check.
     * @returns True if text is empty, otherwise, false.
     */
    isEmpty: (text) => text == null || text == undefined || text.length <= 0,
    /**
     * Method used to change the starting letter of the text provided to upper-case.
     * @param {String} text The text provided.
     * @returns {String} The text with an upper-cased first character.
     */
    toUpperCaseInvariant: (text) => text.substr(0, 1).toUpperCase() + text.substr(1),
    /**
     * Method used for counting the number of times the needle provided can be found in the text provided.
     * @param {String} text Text to be searched in.
     * @param {String} needle The value to be searched for inside of the text.
     * @returns {Number} The number of times the needle can be found inside of the text parameter provided.
     */
    countOccurrences: (text, needle) => text.split(needle).length - 1,
    /**
     * Method used for checking whether the needle provided can be found in the text provided. (Case-Sensitive)
     * @param {String} text Text to be searched.
     * @param {String} needle The search string.
     * @returns True if the needle is found in the text, otherwise, false.
     */
    contains: (text, needle) => text.includes(needle),
    /**
     * Method used for checking whether the needle provided can be found in the text provided. (Case-Insensitive)
     * @param {String} text 
     * @param {String} needle 
     * @returns True if the needle was found in the text, otherwise, false.
     */
    containsCI: (text, needle) => text.toLowerCase().includes(needle.toLowerCase()),
    /**
     * Method used for searching and finding the first occurence of the needle provided in the text provided and returning the zero-based index.
     * @param {String} text The text in which the needle is searched.
     * @param {String} needle The searched text.
     * @returns {Number} The zero-based index of the first occurence of the needle searched for in the text.
     */
    includes: (text, needle) => text.indexOf(needle),
    /**
     * Method used for `case-insensitive` searching and finding the first occurence of the needle provided in the text provided and returning the zero-based index.
     * @param {String} text The text in which the needle is searched.
     * @param {String} needle The searched text.
     * @param {Boolean} noTag Check text only; ignoring html tags. (false)
     * @returns {[Number,String]} The zero-based index of the first occurence of the needle searched for;in the text, and the text it searched. (when using `noTag=true` changes to the text string are made, thus return the text for preview purpose)
     */
    includesCI: (text, needle, noTag = false) => {
        if (!noTag) return [text.toLowerCase().indexOf(needle.toLowerCase()), text];
        text = text.replace(/\<!--[^]*?--\>|\<[^]*?>/gm, "").trim();
        return [text.toLowerCase().indexOf(needle.toLowerCase()), text];
    },
    /**
     * Method used for getting the content of the website.
     * @param {String} htmlText The html site in which to search for the content.
     * @param {String} contentSearchQuery The search query used in the `document.querySelectorAll()` method.
     * @param {Boolean} noTag Check text only; ignoring html tags. (false)
     * @return {String} The content of the website.
     */
    getSiteContent: (htmlText, contentSearchQuery, noTag = false) => {
        let doc = document.createElement("html");
        doc.innerHTML = htmlText;

        //Quick get round for image link error.
        let imgs = doc.getElementsByTagName("img");
        for (i in imgs) {
            let img = imgs[i];
            img.src = "";
        }

        let contEl = doc.querySelector(contentSearchQuery);
        if (!contEl) return "";
        if (noTag) {
            return contEl.innerText;
        }
        return contEl.innerHTML;
    },
    /**
     * Method used for getting predicted name from the url provided based on the root directory of the websites.
     * @param {String} url The url provided.
     * @param {String} rootDir The root directory of the website.
     * @returns {String} The predicted name of the site.
     */
    getPossibleSiteName: (url, rootDir) => {
        if (!rootDir.endsWith("/")) rootDir += "/";
        const extUrl = url.split(rootDir).pop().split(".")[0];
        let sUrl = extUrl.split("/");
        if (sUrl.length > 1) {
            let siteName = sUrl.pop();
            const siteLang = sUrl[0];
            if (siteName.toLowerCase() == "index") {
                let pDirName = sUrl.pop();
                let lMax = pDirName.length;
                while (sUrl.length > 0 && pDirName.length <= 3) {
                    const tmpDir = sUrl.pop();
                    if (tmpDir.length > lMax) {
                        lMax = tmpDir.length;
                        pDirName = tmpDir;
                    }
                }
                if (pDirName.length <= 3) return `Homepage (${pDirName})`;
                return F.getFormattedSiteName(pDirName) + (siteLang.length === 2 ? ` (${siteLang})` : "");
            }
            return F.getFormattedSiteName(siteName);
        }
        if (extUrl.toLowerCase() == "index") return "Homepage";
        return F.getFormattedSiteName(extUrl);
    },
    /**
     * Method used for separating the site names containing upper-cased letters, but are joined into one word, or are separated by a `_`.
     * @param {String} siteName The name of the site to be fixed.
     * @returns {String} Formatted site name based on the upper-cased characters preceded by a space.
     */
    getFormattedSiteName: (siteName) => {
        if (siteName.includes("_")) {
            return siteName.split("_").map((str, i, args) => F.toUpperCaseInvariant(str)).join(" ");
        }
        const reg = new RegExp(/\B[A-Z]/g);
        let fSiteName = siteName.match(reg);
        if (!fSiteName) return F.toUpperCaseInvariant(siteName);
        fSiteName = fSiteName.map((str, i, args) => " " + str);
        return F.toUpperCaseInvariant(siteName.split(reg).map((str, i, args) => str + (fSiteName.pop() || "")).join(""));
    },
    /**
     * Method used for returning the preview of the value searched in the text.
     * @param {String} text The text used to find the value.
     * @param {Number} index The zero-based index of the found value in the text.
     * @param {String} value The searched value.
     * @param {Number} maxLength The maximal length of the returning preview string. (C.PREVIEW_LENGTH)
     * @param {Boolean} highlight Highlight the searched value in the preview returned. (false)
     * @returns The preview string of the searched string in the text provided.
     */
    getPreview: (text, index, value, maxLength = C.PREVIEW_LENGTH, highlight = false) => {
        let prev = value;
        let a = maxLength - value.length;
        if (a > 0) {
            let div = Math.round(a / 2);
            let start = index - div;
            if (start < 0) {
                div += start;
                start = 0;
            }
            prev = text.substr(start, C.PREVIEW_LENGTH);
            if (highlight) prev = F.highlightSearchText(prev, value, "yellow", "black");
        }
        return prev;
    },
    /**
     * Method used for displaying the error message when the website was opened as a file.
     */
    urlSchemeErrorMsg: () => console.error("Searcher API will be disabled as the url scheme is not http or https."),
    /**
     * Method used for handling the current url scheme.
     * @param {Boolean} displayMessage If an error occurres display the error message in the console.
     * @returns True if the current url scheme is HTTP/S, otherwise, false.
     */
    urlSchemeCheck: (displayMessage = false) => {
        if (C.CURRENT_URL_SCHEME_CORRECT) return true;
        if (displayMessage) F.urlSchemeErrorMsg();
        return false;
    },
    /**
     * Alias function for the method `console.log(message, ...optionalParams)`.
     * @param {*} message The message to display.
     * @param  {...any} args Optional arguments to be displayed with the message.
     */
    print: (message, ...args) => args.length > 0 ? console.log(message, args) : console.log(message),
    /**
     * Method used for highlighting the search text found in the text provided.
     * @param {String} text The text provided.
     * @param {String} search The search text being searched for in the text.
     * @param {String} backgroundcolor The `background-color` to be applied to the highlighted search value.
     * @param {String} color The `color` to be used for the highlighted search value.
     * @returns The highlighted `innerHTML` text.
     */
    highlightSearchText: (text, search, backgroundcolor = "navy", color = "white") => {
        if (F.isEmpty(text) || F.isEmpty(search)) return "";
        let newText = "";
        for (let i = 0; i < text.length - search.length; i++) {

            //TODO: Maybe add a check whether the current location is inside of a <code>,<pre> tag...
            //
            //Example:
            //search = test
            //Code:
            //  <code>this is a simple > than test or < than test.</code>
            //
            //First test should be detected, not sure if the second test will be highlighted though.

            if (text[i] === "<") {
                const fCB = text.indexOf(">", i);
                newText += text.substr(i, fCB - i);
                i = fCB;
            }
            let sTxt = text.substr(i, search.length);
            if (sTxt.toLowerCase() === search.toLowerCase()) {
                newText += `<span style="background-color:${backgroundcolor};color:${color}" search-highlight>${sTxt}</span>`;
                i += search.length - 1;
            } else {
                newText += text[i];
            }
        }
        return newText;
    }
}

//Initial check whether the url scheme is correct; writes an error message into the browser console if error occures.
F.urlSchemeCheck(true);

/**
 * The available paths of the html files.
 */
var WEBSITE_PATHS = null;

/**
 * The available languages for the website.
 */
var WEBSITE_LANGUAGES = null;

//Private variables
//Used for controling whether to display the highlighted version of the current website or the original.
var currentWebsiteChanged = false;
//Used to retain the original content of the website; non-highlighted version
//only used when the variable currentWebsiteChanged is TRUE 
var currentWebsiteOriginalContent = "";

if (C.CURRENT_URL_SCHEME_CORRECT) loadWebsitePaths().then((val) => {
    if (val instanceof String || val instanceof Boolean) {
        //Error occured while fetching the json file containing the websites and languages available.
        console.log(val)
    } else {

        //Assign the available WEBSITES and LANGUAGES of the website.
        WEBSITE_PATHS = val[0];
        WEBSITE_LANGUAGES = val[1];

        //Debug only
        //searchSites("card", false, true, true, true);
    }
});

/**
 * Method used for searching the website/s for the `value` provided.
 * @param {String} value The search string.
 * @param {Boolean} onlySearchCurrentSite Search for the value only on the current website. (false)
 * @param {Boolean} onlySearchCurrentLang Search for the value only in the current language of the website. (false)
 * @param {Boolean} showPreview Get the preview of the searched value in the text provided. (false)
 * @param {Boolean} highlighedPreview If `showPreview = true`, then highlight the searched value in the preview text. (false)
 * @returns The list of file paths containing the value searched; preview text - if preview is enabled.
 * @example
 * //When searching in the current website.
 * //Call the next function on an input for example:
 * 
 * <input type="text" onkeyup="searchSites(this.value, true)" />
 * //This will allow for the highlighting of the current website when the this.value exceeds the length of C.MIN_SEARCH_LENGTH
 * 
 * 
 * //When searching all the available sites.
 * //This function can be called in another function that will organize the data returned into a list and display it on site.
 * let results: Promise<Object[][] | null> = searchSites("example", false, false, true, false)
 * if(!results) console.log("No results found.")
 * else{
 *  results.then((res) => {
 *      for(let i = 0; i < res.length; i++){
 *          const data = res[i]
 *          const siteHref = data[0]
 *          const sitePrev = data[1]
 *          console.log(`Site found: ${siteHref} | Preview line: ${sitePrev}`)
 *      }
 *  })
 * }
 */
async function searchSites(value, onlySearchCurrentSite = false, onlySearchCurrentLang = false, showPreview = false, highlighedPreview = false) {
    if (!C.CURRENT_URL_SCHEME_CORRECT || WEBSITE_PATHS == null) {
        console.log("Null value found.");
        return null;
    }

    if (F.isEmpty(value) || value.length < C.MIN_SEARCH_LENGTH) {

        //Check if only the search is for the current opened website and replace with original text when the length of the value is less than C.MIN_SEARCH_LENGTH or null.
        if (onlySearchCurrentSite && currentWebsiteChanged) {
            let contentElm = document.querySelectorAll("div.content")[0];
            contentElm.innerHTML = currentWebsiteOriginalContent;
            currentWebsiteChanged = false;
        }
        return null;
    }

    //If the searcher and highlighter is used on the current website only
    if (onlySearchCurrentSite) {
        let contentElm = document.querySelectorAll("div.content")[0];
        //Store the original innerHTML of the div.content element.
        if (!currentWebsiteChanged) {
            currentWebsiteOriginalContent = contentElm.innerHTML;
            currentWebsiteChanged = true;
        }
        if (F.containsCI(currentWebsiteOriginalContent, value)) {
            //Replace the current innerHTML of the div.content element with the temp highlighted content.
            contentElm.innerHTML = F.highlightSearchText(currentWebsiteOriginalContent, value);
        } else {
            contentElm.innerHTML = currentWebsiteOriginalContent;
        }
        return;
    }

    //Create the collection of the languages based on this methods language parameter.
    let langs = onlySearchCurrentLang ? [C.CURRENT_LANG] : WEBSITE_LANGUAGES;

    //The empty array that will be returned as the search result of the searched value.
    let sites = [];

    for (let j = 0; j < langs.length; j++) {
        for (let i = 0; i < WEBSITE_PATHS.length; i++) {

            const d = `${C.HTML_FILE_PATH}/${langs[j]}${WEBSITE_PATHS[i]}`;
            //let d = "../../html/" + langs[j] + WEBSITE_PATHS[i];

            await readFileText(d).then((text) => {
                if (!text) {
                    return;
                }
                let txt = F.getSiteContent(text, "div.content", true);
                let data = F.includesCI(txt, value);
                let c = data[0];
                txt = data[1];
                if (c >= 0) {
                    let prev = "";
                    if (showPreview) {
                        prev = F.getPreview(txt, c, value, C.PREVIEW_LENGTH, highlighedPreview);
                    }
                    sites.push([d, prev]);
                }
            }, (reason) => console.log(reason));
        }
    }
    //Debug
    //console.log("The sites array:", sites);
    return sites;
}

/**
 * Method used for searching the sites for the value provided.
 * @param {String} value The value provided by the input.
 * @param {String} resultBoxId The result `div` to be used for displaying the list.
 * @param {Boolean} onlyCurrentLanguage Search in the sites of the current language only. (false)
 * @param {Boolean} showPreviews Show the preview of the first occurence for each result. (false)
 */
function searchSitesWithResult(value, resultBoxId, onlyCurrentLanguage = false, showPreviews = false) {
    var resultBox = document.getElementById(resultBoxId);
    if (!resultBox) {
        console.error("The resultBoxId provided is incorrect.");
        return;
    }

    const results = searchSites(value, false, onlyCurrentLanguage, showPreviews, true);
    if (results) {

        let buildResultList = (list) => {
            let r = "<ul class=\"searcher-result-list\">";
            for (i in list) {
                r += list[i];
            }
            r += "</ul>";
            return r;
        };

        let buildResultItem = (args) => {
            const link = args[0];
            let linkName = F.getPossibleSiteName(link, "/html/");
            const preview = args[1];
            let lItem = "<li class=\"searcher-result-item\">";
            let lHref = `<a href="${link}" class="searcher-result-link">${linkName}`;
            let lPrev = preview || preview.length > 0 ? `<span class="searcher-result-preview">${preview}</span></a>` : "</a>";
            lItem += lHref + lPrev + "</li>";
            return lItem;
        };

        results.then((objs) => {
            if (!objs || objs.length <= 0) {
                resultBox.innerHTML = "No results.";
                resultBox.style.display = "none";
                return;
            }
            resultBox.style.display = "block";
            let rList = [];
            for (i in objs) {
                rList.push(buildResultItem(objs[i]));
            }
            if (!rList) return;
            resultBox.innerHTML = buildResultList(rList);
        });
        return;
    }
    resultBox.innerHTML = "No results.";
    resultBox.style.display = "none";
}

/**
 * Method used for searching for the value provided in-site.
 * @param {String} value 
 */
function searchInSite(value) {
    searchSites(value, true);
}

/**
 * Method used for loading the paths of the available html files to be searched through.
 * @returns JSON parsed object on success, otherwise null when the parsing of the response is incorrect, otherwise false if the `CURRENT_URL_SCHEME` is incorrect.
 */
async function loadWebsitePaths() {
    if (!C.CURRENT_URL_SCHEME_CORRECT) return false;
    return fetch(C.FILE_PATH).then(response => response.text()).then(text => {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.log(e);
        }
    });
}

/**
 * Method used for reading the content of the file provided by the path.
 * @param {String} path The path to the file to be read.
 * @returns The text from the file, otherwise, the reason the reading failed. Returns false in case the `CURRENT_URL_SCHEME` is incorrect.
 */
async function readFileText(path) {
    if (!C.CURRENT_URL_SCHEME_CORRECT) return false;
    return fetch(path).then(response => response.text());
}
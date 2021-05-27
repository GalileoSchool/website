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
    PREVIEW_LENGTH: 20,
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
     * Method used for counting the number of times the needle provided can be found in the text provided.
     * @param {String} text Text to be searched in.
     * @param {String} needle The value to be searched for inside of the text.
     * @returns The number of times the needle can be found inside of the text parameter provided.
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

//Initial check whether the url scheme is correct
F.urlSchemeCheck(true);

/**
 * The available paths of the html files.
 */
var WEBSITE_PATHS = null;
var WEBSITE_LANGUAGES = null;
var currentWebsiteChanged = false;
var currentWebsiteOriginalContent = "";

if (C.CURRENT_URL_SCHEME_CORRECT) loadWebsitePaths().then((val) => {
    if (val instanceof String || val instanceof Boolean) {
        console.log(val)
    } else {
        //console.log("Assigning the WEBSITE_PATHS variable...");
        WEBSITE_PATHS = val[0];
        WEBSITE_LANGUAGES = val[1];
        //console.log(WEBSITE_PATHS, WEBSITE_LANGUAGES);
        searchSites("home");
    }
});

/**
 * Method used for searching the website/s for the value provided.
 * @param {String} value The search string.
 * @param {Boolean} onlySearchCurrentSite Search for the value only on the current website. (false)
 * @param {Boolean} onlySearchCurrentLang Search for the value only in the current language of the website. (false)
 * @param {Boolean} returnHighlighedPreview Additionally to retuning the name of the website, return a preview for the searched value within the website. (false)
 * @returns The list of file paths containing the value searched; preview text - if preview is enabled.
 */
async function searchSites(value, onlySearchCurrentSite = false, onlySearchCurrentLang = false, returnHighlighedPreview = false) {
    if (!C.CURRENT_URL_SCHEME_CORRECT || WEBSITE_PATHS == null) {
        console.log("Null value found.")
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
        }
        return;
    }

    //Create the collection of the languages based on this methods language parameter.
    let langs = onlySearchCurrentLang ? [C.CURRENT_LANG] : WEBSITE_LANGUAGES;

    //The empty array that will be returned as the search result of the searched value.
    let sites = [];

    for (let j = 0; j < langs.length; j++) {
        for (let i = 0; i < WEBSITE_PATHS.length; i++) {

            let d = `${C.HTML_FILE_PATH}/${langs[j]}${WEBSITE_PATHS[i]}`;
            //let d = "../../html/" + langs[j] + WEBSITE_PATHS[i];
            console.log(d);
            await readFileText(d).then((text) => {
                if (!text) {
                    return;
                }
                let c = F.containsCI(text, value);
                if (c) {
                    sites.push(d);
                }
            }, (reason) => console.log(reason));
        }
    }
    console.log("The sites array:", sites);
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
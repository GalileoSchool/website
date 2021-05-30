//  MIT License
//
//  Copyright (c) 2021 Radovan Jakubčík
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//  
//
//  Searcher API
//
//  Author: Radovan Jakubcik
//
//  Summary:
//  Searcher API enables highlighting of the current website content, live search throughout the included websites of the project,
//  handling of GET request searching in the so called search website. (The website used for sole purpose of searching/displaying results of search)
//  Enables the users to search for content in real-time or after pressing the 'return' key. (Enter)
//  Quick and fluent searching of the content is done by loading the content of the website, afterwards inserting the content into the sessionStorage object
//  using the available languages as the keys in the sessionStorage object. The content is saved under the language and is an object with the following properties
//  path, content and because the sessionStorage only allows for the storage of strings. The object is afterwards converted into JSON format and stored.
//    
//
//  Requirements:
//  The script will only work if the url scheme used when loading the website is HTTP or HTTPS for CORS request, otherwise it will automatically be disabled.
//
//  Web browser (version) requirements for Session Storage object:
//  Chrome - 4.0
//  Microsoft Edge - 8.0
//  Firefox - 3.5
//  Safari - 4.0
//  Opera - 11.5
//  Safari (iOS) - 3.2
//  Android Browser - 90
//  Opera Mobile - 12
//  Chrome (Android) - 90
//  Firefox (Android) - 87
//  Samsung Internet - 4
//
//  Script uses the file provided in by the constant defined (is editable):
//  
//  C.FILE_PATH
//
//  This file has to be created before using this script.
//
//  Default file is called: htmlfiles.json
//  The structure of the file should be as follows (JSON format):
//  [[The list of websites],[The list of languages]]
//  [["/example/index.html","/index.html","/example2/example/index.html"],["en","sk"]]

const CURRENT_URL_SCHEME = location.protocol.split(":")[0].toUpperCase();

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
     * The maximum number of returned preview lines containing the searched value per website.
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
    /**
     * The search query for the element - from which the data is read. Set this value if the content is located other than `div.content`.
     */
    WEBSITE_CONTENT_ELEMENT_QUERY: "div.content",
    /**
     * The collection of sites that are excluded from searcher API.
     */
    EXCLUDED_SITES_FROM_SEARCH: ["search.html"],
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
     * @returns {[Number,String]} The zero-based index of the first occurence of the needle searched for in the text, and the text it searched. Returned value: `[index, test]` (when using `noTag=true` changes to the text string are made, thus return the text for preview purpose)
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
     * Method used for getting the string content of the provided string, based on the starting position and ending position.
     * @param {String} text The provided string.
     * @param {Number} start The zero-based index for the starting position in the text.
     * @param {Number} end The number representing the number of characters removed from the end of the text.
     * @returns {String} The content of the text.
     */
    getStringContent: (text, start, end = 0) => {
        let startString = text.substring(start);
        return startString.substr(0, startString.length - end);
    },
    /**
     * Method used for getting the search value from the search query in the url.
     * @param {String} stringQuery The string query flag to search for in order to get the search value.
     * @returns {String} The searched value.
     */
    getSiteGetRequestData: (stringQuery) => {
        const searchQuery = location.search;
        if (F.isEmpty(searchQuery)) return null;

        let rExp = new RegExp(`(\\?|\\&)(${stringQuery}).+?\\&{1,}.+?\\b\\=|(\\?|\\&)(${stringQuery}).+`, "gm");
        let splitSQ = searchQuery.match(rExp);
        if (splitSQ) {
            let fRes = splitSQ[0];
            rExp = /\&[\w]{1,}\=/;
            fRes = fRes.split(rExp)[0];
            return F.getRequestDataParser(F.getStringContent(fRes, stringQuery.length + 2, 0));
        }
        return "";
    },
    /**
     * Computes a new string in which certain characters have been replaced by a hexadecimal escape sequence.
     * @param {String} text Text to be escaped.
     * @returns {String} New string with replaced characters.
     */
    escapeRegex: (text) => {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/gm, "\\$1");
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
     * Method used to substitute the regex match provided in the content provided with empty string.
     * @param {String} content The content to be trimmed.
     * @param {RegExpMatchArray} regex The regular expression to match in the content.
     * @returns {String} The trimmed content string.
     * @example
     * var contentText = "---Some example ---text - with an ellipse."
     * 
     * //remove character '-' when there is 2 or more of it in a row.
     * contentText = F.trimContent(contentText, /[\-]{2,}/gm)
     * console.log(contentText)
     * 
     * //output: Some example text - with an ellipse.
     */
    trimContent(content, regex) {
        return content.replace(regex, "");
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
     * @param {Number} maxLength The maximal length of the returning preview string. `(C.PREVIEW_LENGTH)`
     * @param {Boolean} highlight Highlight the searched value in the preview returned. `(false)`
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
            prev = text.substr(start, maxLength);
            if (highlight) prev = F.highlightSearchText(prev, value, "yellow", "black");
        }
        return prev;
    },
    /**
     * Method used for returning all the zero-based indices of the occurences of the value provided in the text provided.
     * @param {String} text The text provided.
     * @param {String} value The searched value provided.
     * @param {Number} countOccurrences The maximum number of occurences to return.
     * @returns The list of zero-based indices of the occurences of the searched value in the text.
     */
    getOccurences: (text, value, countOccurrences = 1) => {
        var r = [];
        var curIndex = text.indexOf(value);
        while (r.length < countOccurrences && curIndex >= 0) {
            r.push(curIndex);
            curIndex = text.indexOf(value, curIndex + value.length);
        }
        return r;
    },
    /**
     * Method used for formating the data sent with the `
            GET ` request.
     * @param {String} value The data to be formatted.
     * @param {Boolean} trimSpaces Remove unnecessary whitespaces. 
     * @example
     * //For example `Example is bad.` (Remove the 3 space between `is` and `bad` and replace with a single `space`)
     * let exampleStr = "Example is   bad."
     * let noTrim = getRequestDataFormatter(exampleStr, false)
     * let trim = getRequestDataFormatter(exampleStr)
     * 
     * console.log("noTrim:",noTrim,"| Trim:",trim)
     * 
     * //':;:' - is the substitute for the 'space' character.
     * //output: noTrim: Example:;:is:;::;::;:bad. | Trim: Example:;:is:;:bad.
     * @returns {String} Formatted `GET` request data string.
     */
    getRequestDataFormatter: (value, trimSpaces = true) => {
        const regExp = new RegExp(trimSpaces ? /[ ]{2,}|[ ]/gm : /[ ]/gm);
        return value.replace(regExp, ":;:");

    },
    /**
     * Method used for parsing the formatted data used in the `GET` request.
     * @param {String} data The data to be parsed.
     * @returns {String} Parsed `GET` request data string.
     */
    getRequestDataParser: (data) => {
        let regExp = new RegExp(/:;:/gm);
        let r = data.replace(regExp, " ");
        regExp = new RegExp(/\B(\%27)/gm);
        r = r.replace(regExp, "'");
        //Add more character replacements when found.
        return r;
    },
    /**
     * Method used for constructing 
     * @param {[String]} list The list of constructed list item elements.
     * @returns The constructed list element string.
     */
    buildResultList: (list, orderedList = false) => {
        let listTag = orderedList ? "ol" : "ul";
        let r = `<${listTag} class=\"searcher-result-list\">`;
        for (i in list) {
            r += list[i];
        }
        r += `</${listTag}>`;
        return r;
    },
    /**
     * Method used for constructing the result item element.
     * @param {[String,[String]]} args The arguments provided for the construction of the list item element. `[href,[...previews]]`
     * @returns {String} The constucted HTML element containing the result.
     */
    buildResultItem: (args) => {
        const link = args[0];
        let linkName = F.getPossibleSiteName(link, "/html/");
        const previews = args[1]; //TODO: check if it gets the correct preview.
        let lItem = "<li class=\"searcher-result-item\">";
        let lHref = `<a href="${link}" class="searcher-result-link">${linkName}`;
        let lPrev = "";
        for (i in previews) {
            lPrev += `<span class="searcher-result-preview">${previews[i]}</span>`;
        }
        lItem += lHref + lPrev + "</a></li>";
        return lItem;
    },
    /**
     * Method used for constructing the whole result list using the result from the search method.
     * @param {[[String, [String]]]} objs The search results.
     * @returns {String} The constructed list.
     */
    buildResultListFull: (objs) => {
        let rList = [];
        for (i in objs) {
            rList.push(F.buildResultItem(objs[i]));
        }
        if (!rList) return "";
        return F.buildResultList(rList);
    },
    /**
     * Method used for displaying the error message when the website was opened as a file.
     */
    urlSchemeErrorMsg: () => console.error("Searcher API will be disabled, because the url scheme must be http or https for CORS request."),
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
            if (text[i] === "<") {
                const fCB = text.indexOf(">", i);
                newText += text.substr(i, fCB - i);
                i = fCB;
            }
            let sTxt = text.substr(i, search.length);
            if (sTxt.toLowerCase() === search.toLowerCase()) {
                newText += ` <span style="background-color:${backgroundcolor};color:${color}" search-highlight>${sTxt}</span>`;
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

/**
 * Check used for determining whether the search API is ready to be used.
 */
var __initDone = null;

if (C.CURRENT_URL_SCHEME_CORRECT) {
    __initDone = __initSearcher();
}

/**
 * Method used for searching the website/s for the `value` provided.
 * @param {String} value The search string.
 * @param {Boolean} onlySearchCurrentSite Search for the value only on the current website. (false)
 * @param {Boolean} onlySearchCurrentLang Search for the value only in the current language of the website. (false)
 * @param {Boolean} showPreview Get the preview of the searched value in the text provided. (false)
 * @param {Boolean} highlighedPreview If `showPreview = true`, then highlight the searched value in the preview text. (false)
 * @param {Number} previewLength The length of the preview text displayed after searching. (C.PREVIEW_LENGTH)
 * @param {Number} previewCount The maximum number of previews displayed. (C.PREVIEW_COUNT)
 * @returns The list of file paths containing the value searched; preview text - if previewing is enabled.
 * @example
 * //When searching in the current website.
 * //Call the next function on input for example:
 * 
 * <input type="text" onkeyup="searchSites(this.value, true)" />
 * //This will allow for the highlighting of the current website when the this.value exceeds the length of C.MIN_SEARCH_LENGTH
 * 
 * 
 * //When searching all the available sites.
 * //This function can be called in another function that will organize the data returned into a list and display it on site.
 * let results: Promise<[[string, [string]]] | null> = searchSites("example", false, false, true, false, 50, 3)
 * if(!results) console.log("No results found.")
 * else{
 *  results.then((res) => {
 *      for(let i = 0; i < res.length; i++){
 *          const data = res[i]
 *          const siteHref = data[0]
 *          const sitePrev = data[1]
 *          console.log(`Site found: ${siteHref} | Preview lines: ${sitePrev}`)
 *      }
 *  })
 * }
 */
async function searchSites(value, onlySearchCurrentSite = false, onlySearchCurrentLang = false, showPreview = false, highlighedPreview = false, previewLength = C.PREVIEW_LENGTH, previewCount = C.PREVIEW_COUNT) {
    let iniLoaded = await __initDone;
    if (!iniLoaded || !C.CURRENT_URL_SCHEME_CORRECT || !WEBSITE_PATHS) {
        return null;
    }

    if (F.isEmpty(value) || value.length < C.MIN_SEARCH_LENGTH) {

        //Check if only the search is for the current opened website and replace with original text when the length of the value is less than C.MIN_SEARCH_LENGTH or null.
        if (onlySearchCurrentSite && currentWebsiteChanged) {
            let contentElm = document.querySelectorAll(C.WEBSITE_CONTENT_ELEMENT_QUERY)[0];
            contentElm.innerHTML = currentWebsiteOriginalContent;
            currentWebsiteChanged = false;
        }
        return null;
    }

    //If the searcher and highlighter is used on the current website only
    if (onlySearchCurrentSite) {
        let contentElm = document.querySelectorAll(C.WEBSITE_CONTENT_ELEMENT_QUERY)[0];
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
        const sitesArr = JSON.parse(sessionStorage.getItem(langs[j]) || null);

        //In null skip this language.
        if (!sitesArr) continue;

        for (let i = 0; i < sitesArr.length; i++) {

            const siteObj = sitesArr[i]; //properties: path, content
            const siteUrl = siteObj.path;
            var txt = siteObj.content;
            const d = `${C.HTML_FILE_PATH}/${langs[j]}${siteUrl}`;
            //let d = "../../html/" + langs[j] + WEBSITE_PATHS[i];

            let data = F.getOccurences(txt, value, previewCount);
            if (data && data.length > 0) {
                let prev = [];
                for (let di = 0; di < data.length; di++) {
                    if (showPreview) {
                        prev.push(F.getPreview(txt, data[di], value, previewLength, highlighedPreview))
                    }
                }
                sites.push([d, prev]);
            }
        }
    }
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

    const results = searchSites(value, false, onlyCurrentLanguage, showPreviews, true, C.PREVIEW_LENGTH, 1);
    if (results) {

        results.then((objs) => {
            if (!objs || objs.length <= 0) {
                resultBox.innerHTML = "No results.";
                resultBox.style.display = "none";
                return;
            }
            resultBox.style.display = "block";
            let rList = F.buildResultListFull(objs);
            resultBox.innerHTML = rList;
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
 * Method used when the website is done loading and there is a pending `GET` request for the searcher API. String query, searcher API uses is `search`.
 * @param {String} resultBoxId The id of the element into which the results will be inserted.
 * @param {Boolean} onlyCurrentLanguage Search only in the current language directory. (false)
 * @param {Boolean} showPreviews Enable/Disable showing the preview of the occurences of the searched value on the site. (false)
 * @param {Number} showPreviewLength The length of the previewed text in which the searched value was found. (`C.PREVIEW_LENGTH`)
 * @param {Number} showPreviewsPerPage The number of previews displayed per a page. (`C.PREVIEW_COUNT`)
 */
async function getRequestSearch(resultBoxId, onlyCurrentLanguage = false, showPreviews = false, showPreviewLength = C.PREVIEW_LENGTH, showPreviewsPerPage = C.PREVIEW_COUNT) {
    var resultBox = document.getElementById(resultBoxId);
    if (!resultBox) {
        console.error("Wrong result box id provided, cannot find any element using the provided id: " + (resultBoxId || "null") + ".");
    }
    const searchValue = F.getSiteGetRequestData("search");
    const results = await searchSites(searchValue, false, onlyCurrentLanguage, showPreviews, true, showPreviewLength, showPreviewsPerPage);
    if (results) {
        resultBox.innerHTML = F.buildResultListFull(results);
    } else {
        resultBox.innerHTML = "No results.";
    }
}

/**
 * Debug function used for testing url search queries.
 */
function __testSQ() {
    const searchValue = F.getSiteGetRequestData("search");
    console.log(searchValue);
}

/**
 * Method used for searching the value provided externally using the `GET` method on the site provided.
 * @param {String} value The content to be searched for in the external site.
 * @param {String} site The path to the external site - after the language folder. Used for searching and displaying the results.
 */
function sendSearch(value, site, trimWhitespaces = true) {
    const formattedData = F.getRequestDataFormatter(value, trimWhitespaces);
    const formUrl = location.origin + location.pathname.split("/html/")[0] + `/html/${C.CURRENT_LANG}/${site}?search=${formattedData}`;
    location.href = formUrl;
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
            console.error(e);
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

/**
 * Private method used for initializing the searcher API.
 * @returns After awaiting `true` is returned when to loading was a success, otherwise, `false`.
 */
async function __initSearcher() {
    return loadWebsitePaths().then((val) => {
        if (!val || val instanceof String || val instanceof Boolean) {
            //Error occured while fetching the json file containing the websites and languages available.
            console.error("Searcher API cannot be loaded as an unexpected error occured while initializing.")
            return false;
        } else {

            //Assign the available WEBSITES and LANGUAGES of the website.
            WEBSITE_PATHS = val[0];
            WEBSITE_LANGUAGES = val[1];

            /**
             * Method used for checking if the key can be found in the sessionStorage object.
             * @param {String} key The key name in the sessionStorage object.
             * @returns {Boolean} True when the key is found in the sessionStorage object, otherwise, false.
             */
            var testSessionStorageForKey = (key) => sessionStorage.getItem(key) != null;

            /**
             * Method used for determining whether all the languages are in the sessionStorage object.
             * @returns The keys that are not contained in the sessionStorage object.
             */
            var getMissedKeys = () => {
                let temp = WEBSITE_LANGUAGES;
                return temp.filter((lang, i, args) => !testSessionStorageForKey(lang));
            };

            var loadDataToSessionStorage = async(langs, paths) => {
                for (let j = 0; j < langs.length; j++) {
                    const key = langs[j];
                    if (sessionStorage.getItem(key)) continue;
                    var data = [];
                    var arrSearchIndex = 0;
                    for (let i = 0; i < paths.length; i++) {
                        const path = paths[i];
                        if (C.EXCLUDED_SITES_FROM_SEARCH.includes(path.substr(1), arrSearchIndex)) {
                            arrSearchIndex += 1;
                            continue;
                        }
                        const d = `${C.HTML_FILE_PATH}/${langs[j]}${path}`;

                        await readFileText(d).then((text) => {
                            if (!text) {
                                return;
                            }
                            const txt = F.trimContent(F.getSiteContent(text, C.WEBSITE_CONTENT_ELEMENT_QUERY, true), /^\s*/gmu);
                            const value = { path: paths[i], content: txt };
                            data.push(value);

                        }, (reason) => console.error(reason));

                    }
                    sessionStorage.setItem(key, JSON.stringify(data));
                }
            }

            let missingKeys = getMissedKeys();

            if (missingKeys && missingKeys.length > 0) {

                loadDataToSessionStorage(missingKeys, WEBSITE_PATHS);
            }

            return true;
        }
    });
}
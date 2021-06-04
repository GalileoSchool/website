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
//  Author Notes:
//  !IMPORTANT: DO NOT TOUCH, CHANGE, EDIT, REMOVE OR IN ANY KIND MODIFY THE FUNCTION CALLED 'F.getSiteGetRequestData', WITHOUT HAVING ANY KNOWLEDGE ABOUT
//              GET REQUESTS, REGULAR EXPRESSIONS AND DEEP UNDERSTANDING OF THE SEARCHER API BACKGROUND FUNCTIONALITY. THE METHOD USED FOR READING THE GET REQUEST
//              STRING QUERY IS SPECIFIC AND UNIQUE TO SEARCHER API.
//
//  How to load the website with HTTP/S protocol:
//      1. Option is to load it while running a localhost server for example, XAMPP server will load Apache that is directly accessed using HTTP protocol in the browser
//          using the website http:// localhost, or when you have certificate using https:// localhost
//
//      2. Option is to load this website using GitHub Sites (which uses the HTTPS protocol)
//
//      Otherwise, the searcher API will be disabled.
//
//
//  Requirements:
//  The script will only work if the url scheme used when loading the website is HTTP or HTTPS for CORS request, otherwise it will be automatically disabled.
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
//  Default file is called: availablefiles.json
//
//  The structure of the file should be as follows (JSON format):
//  [[The list of websites],[The list of languages]]
//  [["/example/index.html","/index.html","/example2/example/index.html"],["en","sk"]]

/**
 * The current url scheme used when accessing the website. (Requires HTTP/S)
 */
const CURRENT_URL_SCHEME = location.protocol.split(":")[0].toUpperCase();

/**
 * Object holding the constants for the searcher script.
 */
const C = {
    /**
     * The path to the file containing all the available website files, including the languages available for the website.
     */
    // The website files are exactly the same for all the available languages, thus every new website file added can be found in every language folder.
    // Since this assumption is true, then only variable in finding all the files on the website is the languages available, therefore this json file contains
    // the websites and the languages at the same time as there is no need to separate them, since the number of websites and languages available is low.
    // Then fetching(reading) one file is less taxing and only one async function is used to load the whole script.
    FILE_PATH: location.href.split("/html/")[0] + "/files/availablefiles.json",
    /**
     * The zero-based index position of the collection of `website files paths` in the `C.FILE_PATH` file, after being converted into an array using `JSON.parse()`.
     */
    WEBSITES_INDEX: 0,
    /**
     * The zero-based index position of the collection of `languages` in the `C.FILE_PATH` file, after being converted into an array using `JSON.parse()`.
     */
    LANGUAGES_INDEX: 1,
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
        // Tag removing reges (tags and html comments)
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

        // Create pseudo html document in memory.
        let doc = document.createElement("html");

        doc.innerHTML = htmlText;

        // Quick get round for image link error.
        // Remove the link for loading the image for the image elements, because it throws errors when the content is being loaded.
        let imgs = doc.getElementsByTagName("img");
        for (i in imgs) {
            let img = imgs[i];
            img.src = "";
        }

        // Select the content using the search query provided.
        let contentElement = doc.querySelector(contentSearchQuery);
        if (!contentElement) return "";
        if (noTag) return contentElement.innerText;
        return contentElement.innerHTML;
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
     * @description Do not touch this method, because it handles the `GET` request data in the url link, any mistake in this function can cause the code to malfunction.
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
        // Get the extra Url string found after the root directory, can also be called the path to the website file.
        const extUrl = url.split(rootDir).pop().split(".")[0];
        // The split Url - the extra Url split into more string using the '/' character.
        let sUrl = extUrl.split("/");
        // If the link is located in a subfolder.
        if (sUrl.length > 1) {
            // Get the name of the displayed website, last string from the collection of strings in the split Url variable, because the name of the website file
            // is always at the end of the whole url string.
            let siteName = sUrl.pop();
            // This will return the current language of the displayed website.
            const siteLang = sUrl[0];
            // If the name of the website is index - this means that the website is the main page of the subfolder
            // but the name of the website is not index, because it is just the abbriviation used for the browser to display the file as the main website of the subfolder,
            // thus the real name of the website is the subfolder it represents.
            if (siteName.toLowerCase() == "index") {
                // The parent Directory Name of the subfolder the website is representing.
                let pDirName = sUrl.pop();
                // The last Maximum length of the parent Directory Name - this variable is afterwards used in searcher for the most probable name of the website.
                let lMax = pDirName.length;
                // The searching algorithm is based on the assumption that the real name of the website must have more than 3 letters in it's name
                // thus the searcher checks all the possible parent folders until it reaches the end and chooses the one with the highest probability of being
                // the real name of the website. The probability is basically searching the for longest name.
                while (sUrl.length > 0 && pDirName.length <= 3) {
                    // This represents a temporary Directory - this is used for getting the next directory name in the collection for checking whether the name
                    // is longer than the last directory provided.
                    const tmpDir = sUrl.pop();
                    // If the name of the temporary Directory is longer than the last Maximum length than change the last parent Directory Name and last Maximum length
                    // to the current temporary Directory
                    if (tmpDir.length > lMax) {
                        // Change last Maximum to the length of the name of the temporary Directory 
                        lMax = tmpDir.length;
                        // Change the parent Directory Name to the temporary Directory
                        pDirName = tmpDir;
                    }
                }
                // The the length of the parent Directory Name is less than 3 letters, that it is recorded as a label for the Homepage
                // Example: the parent Directory Name = en; than the value returned is Homepage (en)
                if (pDirName.length <= 3) return `Homepage (${pDirName})`;
                // Is the parent Directory Name is longer than 3 characters then return the name and if the language of the website is exactly 2 letters long than
                // add the language of the website. Example: ThisIsAnExample (en)
                return F.getFormattedSiteName(pDirName) + (siteLang.length === 2 ? ` (${siteLang})` : "");
            }
            // Get the website name based on the rules provided in the method 'getFormattedSiteName(string)'
            return F.getFormattedSiteName(siteName);
        }
        // The file located on top of the directories in the root folder and is the index website.
        if (extUrl.toLowerCase() == "index") return "Homepage";
        // Any other file located in the root directory, but are not the index pages.
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
     * // remove character '-' when there is 2 or more of it in a row.
     * contentText = F.trimContent(contentText, /[\-]{2,}/gm)
     * console.log(contentText)
     * 
     * // output: Some example text - with an ellipse.
     */
    trimContent(content, regex) {
        return content.replace(regex, "");
    },
    /**
     * Method used for separating the site names containing `upper-cased` letters, or are separated by a `_`, one at a time.
     * @param {String} siteName The name of the site to be fixed.
     * @returns {String} Formatted site name based on the upper-cased characters preceded by a space.
     * @example
     * // The variables are assigned the example strings
     * var contentText = "ThisIsAnExampleOfUpperCasedName";
     * var contentText2 = "this_is_an_example_of_underscores_name";
     * 
     * // The variables are formatted using the 'getFormattedSiteName(string)' function.
     * var formattedContentText = F.getFormattedSiteName(contentText);
     * var formattedContentText2 = F.getFormattedSiteName(contentText2);
     * 
     * // Print out the differences
     * console.log("contentText:",contentText,"| formattedContentText:", formattedContentText);
     * console.log("contentText2:",contentText2,"| formattedContentText2:",formattedContentText2);
     * 
     * // Outputs:
     * // contentText: ThisIsAnExampleOfUpperCasedName | formattedContentText: This Is An Example Of Upper Cased Name
     * // contentText2: this_is_an_example_of_underscores_name | formattedContentText2: This Is An Example Of Underscores Name
     */
    getFormattedSiteName: (siteName) => {
        // If siteName contains the underscore character ('_'), it will automatically get replaced with a space.
        if (siteName.includes("_")) {
            return siteName.split("_").map((str, i, args) => F.toUpperCaseInvariant(str)).join(" ");
        }
        // Check for upper cased letters in the string.
        const reg = new RegExp(/\B[A-Z]/g);
        // found Site Name is the collection of all the upper-cased letters in the site Name parameter.
        let fSiteName = siteName.match(reg);
        // If found Site Name is null; meaning no match have been found return the site Name parameter but capitalized.
        if (!fSiteName) return F.toUpperCaseInvariant(siteName);
        // Add a space before each match found by the regex expression.
        fSiteName = fSiteName.map((str, i, args) => " " + str);
        // Return the upper-cased variant of the site name after being joined together.
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
        // The preview variable is assigned the searched value, because if the length of the value is longer than the maximum length allowed for returning
        // then the preview returns the searched value without highlighting.
        let prev = value;
        let a = maxLength - value.length;
        // If there is unused capacity for the preview string to be constructed then get the surrounding letters as the preview.
        if (a > 0) {
            // Divide the left capacity from the maximum length allowed to get the amount of characters to get from before the searched value in the content.
            let div = Math.round(a / 2);
            // Get the starting position (zero-based index) in the text provided based on the index of the searched value and the left capacity of starting letters.
            let start = index - div;
            // If start is a negative number, then set the start = 0, thus shifting the starting position to the beginning of the text provided.
            if (start < 0) {
                start = 0;
            }
            // Get the preview substring from the starting position to the maxLength provided, if the length is larget than the length of the text variable,
            // then the substr is until the end of the text provided.
            prev = text.substr(start, maxLength);
            // If the preview is supposed to be highlighted, then highlight the preview text in yellow and black colors.
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
        // The return variable
        var r = [];
        // The last index of the searched value in the text provided.
        var curIndex = text.indexOf(value);
        // Until the length of r is less than the allowed number of occurrences to be found and the last index is larger or equal to zero
        // append the last index into the r variable to be returned.
        while (r.length < countOccurrences && curIndex >= 0) {
            // Append the last index into the r list.
            r.push(curIndex);
            // Change the last index to the next index of the searched value.
            curIndex = text.indexOf(value, curIndex + value.length);
        }
        return r;
    },
    /**
     * Method used for formating the data sent with the `GET` request.
     * @param {String} value The data to be formatted.
     * @param {Boolean} trimSpaces Remove unnecessary whitespaces. 
     * @example
     * // For example `Example is bad.` (Remove the 3 space between `is` and `bad` and replace with a single `space`)
     * let exampleStr = "Example is   bad."
     * let noTrim = getRequestDataFormatter(exampleStr, false)
     * let trim = getRequestDataFormatter(exampleStr)
     * 
     * console.log("noTrim:",noTrim,"| Trim:",trim)
     * 
     * // ':;:' - is the substitute for the 'space' character.
     * // output: noTrim: Example:;:is:;::;::;:bad. | Trim: Example:;:is:;:bad.
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

        // Add more character replacements here if needed.

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
        const previews = args[1];
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
     * @param {...any} args Optional arguments to be displayed with the message.
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
                // Get the first Closing Bracket after the opening bracket.
                const firstClosingBracket = text.indexOf(">", i);
                newText += text.substr(i, firstClosingBracket - i);
                i = firstClosingBracket;
            }
            // sub Text - the temporary text constructed from the substring of the original text starting on the position 'i' and ending at the length of
            // the searched text 'search'. This will select exactly the same number of characters from the 'i' position in the 'text' string and creates a temporary
            // string that is compared to the searched 'search' text.
            let subTxt = text.substr(i, search.length);
            // if the sub Text is the searched text then highlight it, otherwise, append the character to the end of the newText string.
            if (subTxt.toLowerCase() === search.toLowerCase()) {
                newText += ` <span style="background-color:${backgroundcolor};color:${color}" search-highlight>${subTxt}</span>`;
                i += search.length - 1;
            } else {
                newText += text[i];
            }
        }
        return newText;
    }
}

// Initial check whether the url scheme is correct; writes an error message into the browser console if error occures.
F.urlSchemeCheck(true);

/**
 * The available paths of the html files.
 */
var WEBSITE_PATHS = null;

/**
 * The available languages for the website.
 */
var WEBSITE_LANGUAGES = null;

// Private variables
// Used for controling whether to display the highlighted version of the current website or the original.
var currentWebsiteChanged = false;
// Used to retain the original content of the website; non-highlighted version
// only used when the variable currentWebsiteChanged is TRUE 
var currentWebsiteOriginalContent = "";

/**
 * Check used for determining whether the search API is ready to be used.
 */
var __initDone = null;

// If the current url scheme is correct (HTTP/S) then initialize the searcher API.
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
 * // When searching in the current website.
 * // Call the next function on input for example:
 * 
 * <input type="text" onkeyup="searchSites(this.value, true)" />
 * // This will allow for the highlighting of the current website when the this.value exceeds the length of C.MIN_SEARCH_LENGTH
 * 
 * 
 * // When searching all the available sites.
 * // This function can be called in another function that will organize the data returned into a list and display it on site.
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

        // Check if only the search is for the current opened website
        // Replace with original text when the length of the value is less than C.MIN_SEARCH_LENGTH or null.
        if (onlySearchCurrentSite && currentWebsiteChanged) {
            // The content Element from the HTML document.
            let contentElement = document.querySelectorAll(C.WEBSITE_CONTENT_ELEMENT_QUERY)[0];
            contentElement.innerHTML = currentWebsiteOriginalContent;
            // Displaying the original content of the website.
            currentWebsiteChanged = false;
        }
        // None found
        return null;
    }

    // If the searcher and highlighter is used on the current website only
    if (onlySearchCurrentSite) {
        let contentElement = document.querySelectorAll(C.WEBSITE_CONTENT_ELEMENT_QUERY)[0];
        // Store the original innerHTML of the div.content element.
        if (!currentWebsiteChanged) {
            currentWebsiteOriginalContent = contentElement.innerHTML;
            // Displaying the highlighted content of the website.
            currentWebsiteChanged = true;
        }
        if (F.containsCI(currentWebsiteOriginalContent, value)) {
            // Replace the current innerHTML of the div.content element with the temp highlighted content.
            contentElement.innerHTML = F.highlightSearchText(currentWebsiteOriginalContent, value);
        } else {
            contentElement.innerHTML = currentWebsiteOriginalContent;
        }
        return;
    }

    // Create the collection of the languages based on this methods language parameter.
    let langs = onlySearchCurrentLang ? [C.CURRENT_LANG] : WEBSITE_LANGUAGES;

    // The empty array that will be returned as the search result of the searched value.
    let sites = [];

    for (let j = 0; j < langs.length; j++) {
        // Getting the content from the sessionStorage under the key = langs[j] and parsing it into an array of the custom object {path, content}
        const sitesArr = JSON.parse(sessionStorage.getItem(langs[j]) || null);

        // In null skip this language.
        if (!sitesArr) continue;

        for (let i = 0; i < sitesArr.length; i++) {

            // properties: path, content
            const siteObj = sitesArr[i];
            // the path to the website files
            const siteUrl = siteObj.path;
            // the content of the website
            var txt = siteObj.content;

            // The direct path to the website file from the root directory.
            const directPath = `${C.HTML_FILE_PATH}/${langs[j]}${siteUrl}`;

            // Returns the list of all the zero-based indices of the searched value in the txt variable.
            let data = F.getOccurences(txt, value, previewCount);
            if (data && data.length > 0) {
                // The preview array
                let prev = [];
                for (let di = 0; di < data.length; di++) {
                    // If the search is supposed to show the preview in the website.
                    if (showPreview) {
                        // The preview/s of the searched value in the txt provided.
                        prev.push(F.getPreview(txt, data[di], value, previewLength, highlighedPreview))
                    }
                }
                // Append the current directPath and preview array into the sites to be returned array.
                sites.push([directPath, prev]);
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

    // Get the results of the searched value in the websites.
    const results = searchSites(value, false, onlyCurrentLanguage, showPreviews, true, C.PREVIEW_LENGTH, 1);

    // If there are results handle the results data. Otherwise, display 'No results.' (alternative when the element doesn't hide) and hide the 
    // element showing the results.
    if (results) {

        // Handling the Promise<any> object returned by the searchSites() function. This is an asynchronous object returned, thus it has to be awaited or
        // the function 'then(...args)' allows the website to run without freezing while awaiting the results, but the results will be displayed only after
        // they are ready to be displayed. This means that they will not show up immediately as in normal programming (synchronous), but once the object
        // is ready to be displayed, thus the programmer, nor user have any control over the time the results will be displayed.
        // The time it usually takes when searching for the value after the data is loaded in the sessionStorage object is in microseconds, but the displaying
        // part takes around 0.075s - 0.15s (quite slow, when compared to the results being found in the content, but for usual user it is imperceptible).
        results.then((objs) => {
            // If no results display 'No results' and hide the element.
            if (!objs || objs.length <= 0) {
                resultBox.innerHTML = "No results.";
                resultBox.style.display = "none";
                return;
            }
            // Show the element that will display the results.
            resultBox.style.display = "block";
            // The result List string that is constructed in the function F.buildResultListFull(results)
            // Constructs an unordered list with list items (results).
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
            // Error occured while fetching the json file containing the websites and languages available.
            console.error("Searcher API cannot be loaded as an unexpected error occured while initializing.")
            return false;
        } else {

            // Assign the available WEBSITES and LANGUAGES of the website.
            WEBSITE_PATHS = val[C.WEBSITES_INDEX];
            WEBSITE_LANGUAGES = val[C.LANGUAGES_INDEX];

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

            /**
             * Method used for loading the content of the websites provided into the `sessionStorage` object.
             * @param {[string]} langs The languages available on the website.
             * @param {[string]} paths The paths to the included files of the website.
             */
            var loadDataToSessionStorage = async(langs, paths) => {
                // Loop through all the available languages for the website.
                for (let j = 0; j < langs.length; j++) {
                    // Assign the key used in the sessionStorage - in this case the language of the website is the key.
                    const key = langs[j];
                    // If the sessionStorage already contains the key, then skip this language.
                    if (sessionStorage.getItem(key)) continue;
                    // The array into which the object {path, content} will be stored for the websites and afterwards this array will be stored as
                    // a stringified JSON into the sessionStorage object under the current key.
                    var data = [];
                    for (let i = 0; i < paths.length; i++) {
                        // The path to the website that will be loaded. Path cannot be changed, thus constant.
                        const path = paths[i];
                        // Check if the website is excluded from being searched by the search API in the C.EXCLUDED_SITES_FROM_SEARCH constant. If true skip.
                        if (C.EXCLUDED_SITES_FROM_SEARCH.includes(path.substr(1))) {
                            continue;
                        }

                        // The direct path to the website file. Cannot be changed otherwise an error occures, thus constant.
                        const directPath = `${C.HTML_FILE_PATH}/${langs[j]}${path}`;

                        // Fetch the file a handle the content search.
                        await readFileText(directPath).then((text) => {
                            // If the provided 'text' parameter is null/false, than return, because an error occured or there is no content.
                            if (!text) {
                                return;
                            }
                            // The text got from the website from the element provided by this constant 'C.WEBSITE_CONTENT_ELEMENT_QUERY'
                            // /^\s*/gmu - is the regex expression for removing all the empty lines and spaces before the text. The flags 'gmu'
                            // mean: g - global (throughout the text), m - multiline (search on all lines), u - unicode (match full unicode)
                            const txt = F.trimContent(F.getSiteContent(text, C.WEBSITE_CONTENT_ELEMENT_QUERY, true), /^\s*/gmu);
                            // create the object to be stored in the data array.
                            const value = { path: paths[i], content: txt };
                            // append the content into the data array - the data array is always new for each language.
                            data.push(value);

                        }, (reason) => {
                            // Report error when fetching the file.
                            console.error(reason);
                        });

                    }
                    // Add the current data array into the sessionStorage object under the language key.
                    // To get the data from sessionStorage object use the language key as follows: sessionStorage.get("yourkey") -> returns all the data
                    // under the key "yourkey". This data has to be parsed by JSON.parse(returnedData), in order to work with the data.
                    sessionStorage.setItem(key, JSON.stringify(data));
                }
            }

            // Get all the missing keys in the sessionStorage (all the missing languages)
            let missingKeys = getMissedKeys();

            // If there are found to be missing keys then load the content from the missing keys.
            if (missingKeys && missingKeys.length > 0) {

                loadDataToSessionStorage(missingKeys, WEBSITE_PATHS);
            }

            return true;
        }
    });
}
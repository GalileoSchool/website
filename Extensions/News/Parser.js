const fs = require('fs');
var path = require('path');
const jsdom = require("jsdom");
const { News } = require('./Compiler');
const temp_dir = "data\\";
const temp_file = temp_dir + 'news.txt';
const newsLimit = 3;

var _privatelog = console.log;
console.log = (message) => {
    _privatelog.apply(console, [`[${path.basename(__dirname)}] -> ${path.basename(__filename)}: ` + message]);
}

/**
 * 
 * @param {String} file 
 * @param {Function} data 
 */
async function readFile(file, data) {
    await fs.readFile(file, 'utf8', (err, Tdata) => {
        if (err) throw err;
        data(Tdata)
    });
}

/**
 * 
 * @param {String} data 
 * @returns {HTMLElement}
 */
function parseNewsFile(data) {
    let doc = new jsdom.JSDOM(data);

    if (doc) {
        let news = doc.window.document.getElementById("nw_newsUl");
        writeFile(temp_file, news.innerHTML);
        return news;

        /*doc = new jsdom.JSDOM(news.innerHTML);
        if (!doc) throw new Error("Unexpected error occured while parsing the data, nullptr");
        let hrefs = doc.window.document.links; // For debug*/
    }
    throw new Error(`Unexpected error occured while parsing the data. Data length: ${data ? "Null": data.length}`);
}

/**
 * 
 * @param {HTMLElement} newsHtml 
 * @param {Number} limit 
 * @param {*} callback
 */
function parseNewsIntoSections(newsHtml, limit, callback) {
    let sections = new Array();
    let i = 0;

    for (var section of newsHtml.children) {
        let title = section.getElementsByTagName("h1")[0].innerHTML;
        if (title.startsWith('<span class="gadgetTitle">Data')) continue
        if (i === limit) break;
        if (section)
            sections.push(section);
        else
            break;
        i++;
        //console.log(section.getElementsByClassName("gadgetTitle")[0].textContent);
    }

    if (!sections) throw new Error("Nullptr was found");
    callback(sections);
}

/**
 * 
 * @param {String} file 
 * @param {String} data 
 */
function writeFile(file, data) {
    fs.writeFile(file, data, (err) => { if (err) throw err; });
}

function _initialize() {
    let cards = new Array();

    return new Promise(result => {
        readFile(temp_file, async (data) => {
            if (!data) throw new Error("Reading data from file resulted in a nullptr");

            await parseNewsIntoSections(parseNewsFile(data), newsLimit, async (res) => {
                if (!res) throw new Error("Parsing data into sections resulted in a nullptr");

                for (let section of res)
                    cards.push(new News(section));
                
                result(cards);
            });
        });
    });
        
}

async function initialize() {
    let cards = await _initialize();

    console.log(cards.length);
}

try {
    initialize();
    
} catch (error) {
    throw error;
}


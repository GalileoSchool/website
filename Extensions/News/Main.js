const Net = require('./NetHandler');
const fs = require('fs');
var path = require('path');
const { F_OK } = require('constants');
const temp_dir = "data\\";
const temp_file = temp_dir + 'news.txt';
const school_url = 'https://galileoschool.edupage.org/news/';

var _privatelog = console.log;
console.log = (message) => {
    _privatelog.apply(console, [`[${path.basename(__dirname)}] -> ${path.basename(__filename)}: ` + message]);
}

async function DownloadNews()
{
    await checkDir();
    Net._getNews(school_url, async (response) => {
        // We check if our https request response is not empty
        if (response) {
            fs.writeFile(temp_file, response, (err) => { // We take our response and write it into a file
                if (err) throw new Error(err); // If an IO error occurs, we throw Exception with error message
            });
        }
         else
             throw new Error("[NetHandler][getNews]: The response of your GET request resulted in a nullptr"); // Throwing a reasonable error is good when debugging 
     });
}

function checkDir() {
    console.log("Checking Dir");
    fs.access(temp_dir, F_OK, (err) => {
        if(err) {
            console.log("Dir not found creating new");
            fs.mkdir(temp_dir, { recursive: true }, (err) => {
                if (err) throw new Error(err);
            });
            return;
        }
    });
}

async function executeJsFile(fileName) {
    var exec = require('child_process').exec,
    child;

    child = exec('node ' + fileName,
  async function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
            console.log(error);
        }
    });
}

try {
    DownloadNews();
    executeJsFile("Parser.js");
} catch (error) {
    console.log("Error: " + error);
    return;
}
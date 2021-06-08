//regex link for paragraph searching: https://regex101.com/r/UhgGAR/1
const { F_OK } = require('constants');
const fs = require('fs');
const Path = require('path');
const glob = require("glob");
const Mdir = __dirname; // The directory of where this current javascript is located
const readline = require("readline");


const C = {
    dPath: Mdir + '/../source/files/AboutUs', // Directory path of AboutUs files
    path: Mdir + '/../components/', // Components folder path
    separator: '[Section]', // Separator used in text files to separate each paragraph
    school: {
        kindergarten: 'kindergarten',
        primary: 'primaryschool',
        gym: 'highschool',
    },
};

var getFolders = source => fs.readdirSync(Path.join(source))
    .filter((file) => fs.statSync(Path.join(source, file)).isDirectory());

var getFiles = ((source, callback) => {
    glob(source + '/**/*', callback);
});


class Paragraph {
    /**
     * 
     * @param {Object} object 
     */
    constructor(object) {
        this.title = object.title;
        this.short = object.text.short;
        this.long = object.text.long;
        this.language = object.language;
        this.folder = object.folder;
        this.photo = object.photo ? object.photo : null;
    }

    getDefaultHtmlCode() {
            return `<div class="card about">
        <div class="card-img">
            ${this.photo ? `<img src="{fill_parents}${this.photo}" class="card-img-top" alt="Picture Not Available!">` : ''}
        </div>
        <div class="card-content">
            <div>
                <div class="card-title">
                    <h3>${this.title}</h3>
                </div>
                <div class="card-text short">
                    <p>${this.short}</p>
                </div>
            </div>
            <div class="card-body">
                <div class="card-text long">
                    <p>${this.long}</p>
                </div>
            </div>
            <div class="card-footer">
                <button class="toggle-btn">...see more</button>
            </div>
        </div>
    </div>`.trim();
    }
}

function Files(path = null, result) {
    path = path ? path : C.dPath;

    getFiles(Path.join(path), (err, res) => {
        if (err) throw new Error(err);
        result(res.filter((file) => !fs.statSync(Path.join(file)).isDirectory()));
    });
}

/**
 * 
 * @param {Array} files Array of files returned by function `Files(path, result)`
 */
async function createFilesArray(files) {
    let mappedFiles = [];
    files.map(file => {
        file = file.split('/');
        mappedFiles.push({ name: file[file.length - 1], path: Path.join(...file), language: file[file.length - 2], folder: file[file.length - 3] });
    });
    return mappedFiles;
}

/** Parses given string by separators and empty lines
 * 
 * @param {String} string text to be parsed
 * @param {Function} data
 * @returns {Array} 
 */
function parseString(string) {
    try {
        let sections = string.split(C.separator); // We split the string by our main separator into individual sections
        let parsedSections = [];

        sections.map(section => { // We iterate through every parsed section
            let para = section.split('\r\n').filter(sentence => sentence ? true : false); // Splitting sections into paragraphs by new line and removing empty lines
            parsedSections.push({ title: para[0], short: para[1], long: para[2] }); // Pushing a parsed section object into an array
        });

        return parsedSections; // return array of parsed sections as a callback
    } catch (error) {
        console.error(error);
    }
}

/**
 * 
 * @param {Array} array 
 */
function getStringFromArray(array) {
    let str_builder = '';

    for (var par of array)
        str_builder += par.getDefaultHtmlCode();
    
    return str_builder;
}

/**
 * @param {String} Fpath Path where to create the component
 * @param {String} name File name of the component
 * @param {String} string String that will be written inside the component
 * @param {String} language
 * @param {Boolean} append_file Whether to append or overwrite already existing file 
 */
async function createComponent(Fpath = null, name, string, language, append_file = true, fileName = 'school') {
    Fpath = Fpath ? Fpath : C.path;
    const component = `:^) ${name} :::`;
    let path = Path.join(Fpath, language, `${fileName}.html`);
    writeFile(path, `${component}\n${string}`, append_file);
}

/** Asynchronously writes a string to a file
 * 
 * @param {String} path 
 * @param {String} string 
 * @param {Boolean} appendFile 
 * @returns {void}
 */
function writeFile(path, string, appendFile) {
    try {
        switch (appendFile) {
            case true:
                fs.appendFile(path, string, { flag: 'a+', mode: 0666 }, (err) => {
                    if (err) throw new Error(err);
                });
                break;
            case false:
                fs.writeFile(path, string, { flag: 'w+', mode: 0666 }, (err) => {
                    if (err) throw new Error(err);
                });
                break;
            default:
                throw new Error('No valid action was chosen for writing a file!');
        }
    } catch (error) {
        console.error(error)
        return;
    }
}

Files(C.dPath, async res => {
    var arr = await createFilesArray(res);
    var folders = getFolders(C.dPath);
    var arr2 = [];
    var temp = [];

    arr.map(file => {
        for (var res of parseString(fs.readFileSync(file.path, 'utf8')))
            arr2.push(new Paragraph({title: res.title, text: { short: res.short, long: res.long }, language: file.language, folder: file.folder.toLowerCase()}));
    });

    folders.map(folder => {
        // getFolders(C.path).map(language => {
        //     // arr2.filter(para => folder.toLowerCase() === para.folder)
        //     temp.push({ folder: folder.toLowerCase(), content: {language: language.toLowerCase(), data: arr2.filter(para => folder.toLowerCase() === para.folder && language.toLowerCase() === para.language.toLowerCase())}});
        // });
        let temp2 = [];
        getFolders(C.path).map(language => {
            temp2.push({ language: language.toLowerCase(), data: arr2.filter(para => folder.toLowerCase() === para.folder && language.toLowerCase() === para.language.toLowerCase()) });
        });

        temp.push({folder: folder.toLowerCase(), content: temp2})
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Would you like to create a JSON file for the AboutUs? Yes/No\n", (ans) => {
        switch (ans.toLowerCase()) {
            case "no":
                temp.map((section, sectionIndex) => {
                    section.content.map(content => {
                        let string = getStringFromArray(content.data);
                        if(sectionIndex == 0)
                            createComponent(C.path, section.folder, string, content.language, false, 'about');
                        else
                            createComponent(C.path, section.folder, string, content.language, true, 'about');
                    });
                });
                console.log("Successfully created component");
            case "yes":
                //
            default:
                rl.close();
        }
    });

});
// A quick dev tool originally created by Ado or Vilko (not sure which one of them) to make life much easier with parsing documents into sections or boxes
// This is not run often and it is dangerous as it may override other changes
// Parsable documents can be parsed into individual sections/boxes automatically with the html code being the output
// Input is a parsable document like those of About Us section, parses them and formats them into an html code
// Automatically creates components with the output html code, therefore after running a document through this parser immediately usable component is created
// All documents that you'd like to parse should be located in "source > files > [component folder] > [language] > [your files]" eg. "source\files\pearson\en\en.txt"
// note that running this file is NOT a part of the automated build script. To run it, you need to uncomment the relevant line in the build script.

//regex link for paragraph searching: https://regex101.com/r/UhgGAR/1
const fs = require('fs');
const Path = require('path');
const glob = require('glob');
const ScriptDir = __dirname; // The directory of where this current javascript is located
const readlineSync = require('readline-sync');

// here are some globals that can be interactively input
// the naming is a bit confusing, despite being called "C", these values are mutated
const C = {
    ModulePath: ScriptDir + '/../source/files/AboutUs/', // Directory path of AboutUs files
    ComponentsPath: ScriptDir + '/../components/', // Components folder path
    separator: '[Section]', // Separator used in text files to separate each paragraph
    jsonFile: 'AboutUs.json',
    componentName: 'about',
};

var getFolders = source => fs.readdirSync(Path.join(source))
    .filter((file) => fs.statSync(Path.join(source, file)).isDirectory());

var getFiles = ((source, callback) => {
    glob(source + '/**/*', callback);
});


class Paragraph {
    /**
     * @param {Object} object An object holding necessary data 
     */
    constructor(object) {
        this.title = object.title;
        this.short = object.text ? object.text.short : object.short;
        this.long = object.text ? object.text.long : object.long;
        this.language = object.language;
        this.folder = object.folder;
        this.photo = object.photo ? object.photo : null;
    }

    /**
     * Because as things might get added, the html code we would like the parser to produce may change from thing to thing... 
     * so that everyone can add html output of their own to fit their needs, 
     * but this one I have added is the default one to be used if you would like to produce html just like that one on AboutUs page.
     */
    getDefaultHtmlCode() {
        return `<div class="card about">
        <div class="card-img">
            ${this.photo ? `<img src="{cloudinary}galileo_web/c_scale,w_1024/${Path.parse(C.ModulePath).base.toLowerCase()}/${this.photo}" class="card-img-top" alt="Picture Not Available!">` : ''}
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
                ${this.long.map(par => `<p>${par}</p>`).join('<br>')}
                </div>
            </div>
            <div class="card-footer">
                <button class="toggle-btn">...see more</button>
            </div>
        </div>
    </div>`.trim();
    }
}

/** Returns parsable files from the specific module directory
 * 
 * @param {String} path Path to the module folder holding files to be parsed
 * @param {Function} result callback holding the resulting array of files
 */
function Files(path = null, result) {
    path = path ? path : C.ModulePath;

    getFiles(Path.join(path), (err, res) => {
        if (err) throw new Error(err);
        result(res.filter((file) => !fs.statSync(Path.join(file)).isDirectory()));
    });
}

/** Returns an array of mapped file objects
 * 
 * @param {Array} files Array of files returned by function `Files(path, result)`
 * @returns {Array} array of mapped file objects
 */
async function createFilesArray(files) {
    let mappedFiles = [];
    files.map(file => {
        file = file.split('/');
        mappedFiles.push({ name: file[file.length - 1], path: Path.join(...file), language: file[file.length - 2], folder: file[file.length - 3] });
    });
    return mappedFiles;
}

/** Parses given string by separators and empty lines into an array of parsed sections
 * 
 * @param {String} string text to be parsed
 * @param {Function} data callback function holding data
 * @returns {Array} 
 */
function parseString(string) {
    let sections = string.split(C.separator); // We split the string by our main separator into individual sections
    let parsedSections = [];

    sections.map(section => { // We iterate through every parsed section
        let paragraph = section.split('\r\n').filter(sentence => sentence.trim() ? true : false); // Splitting sections into paragraphs by new line and removing empty lines
        parsedSections.push({ title: paragraph[0], short: paragraph[1], long: paragraph.slice(2, paragraph.length) }); // Pushing a parsed section object into an array
    });

    return parsedSections; // return array of parsed sections as a callback
}

/** Formats and appends HTML code from an Array of objects
 * 
 * @param {Array} array Array of objects that can be mapped into `new Paragraph()` 
 * @returns {String} Formatted html string
 */
function getStringFromArray(array) {
    let str_builder = '';
    for (var par of array)
        str_builder += new Paragraph(par).getDefaultHtmlCode();

    return str_builder;
}

/** Creates a new component for handlebars in the given directory with the given content
 * 
 * @param {String} Finalpath Path to directory where to create the component
 * @param {String} name File name of the component
 * @param {String} content String that will be written inside the component
 * @param {String} language 
 * @param {Boolean} append_file Whether to append or overwrite already existing file 
 * @param {Boolean} nestedComponent Whether the component is nested or not
 * @param {String} fileName Name of the component file to be created
 */
function createComponent(Finalpath = null, name, content, language, append_file = true, nestedComponent = true, fileName = null) {
    fileName = fileName ? fileName : C.componentName;
    Finalpath = Finalpath ? Finalpath : C.ComponentsPath;

    const component = nestedComponent ? `:^) ${name} :::\r\n` : '';
    let path = Path.join(Finalpath, language, `${fileName}.html`);

    writeFile(path, `${component}${content}`, append_file);
    console.log(`Successfully created component ${component},\r\nAppend File Mode: ${append_file}`);
}

/** Make a timestamped backup of the file if it exists
 *  Backup goes to the same directory as <file>.backup.<timestamp>
 * @param {string} filePath 
 */
function backupFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return; // No file to back up

        const dir = Path.dirname(filePath);
        const base = Path.basename(filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = Path.join(dir, `${base}.backup.${timestamp}`);

        fs.copyFileSync(filePath, backupPath);
        console.log(`Backup created at ${backupPath}`);
    } catch (error) {
        console.error(`Failed to create backup for ${filePath}: ${error}`);

    }
}

/** Synchronously writes a string into a file or appends it
 * 
 * @param {String} path Path of the file
 * @param {String} string String to write into the file
 * @param {Boolean} appendFile 
 * @returns {void}
 */
function writeFile(path, string, appendFile) {
    backupFile(path); // Try to back up existing file if it exists (Safety first!)

    switch (appendFile) {
        case true:
            fs.appendFileSync(path, `${string}\r\n`, { flag: 'a+', mode: 0o666 });
            break;
        case false:
            fs.writeFileSync(path, `${string}\r\n`, { flag: 'w+', mode: 0o666 });
            break;
        default:
            throw new Error('No valid action was chosen for writing a file!');
    }
}

/** Creates a Json file with our data stringified as Json
 * 
 * @param {Object} object object to be stringified and saved as a json file
 */
function saveAsJson(object) {
    let file = Path.join(C.ModulePath, C.jsonFile); // Path to our json file
    backupFile(file); // Try to back up existing json file if it exists (Safety first!)

    return fs.writeFileSync(file,
        JSON.stringify(object, null, 4), { flag: 'w+', mode: 0o666 });
}

/** Loads a Json file and returns its content parsed
 * 
 * @param {String} file Path to the Json file 
 * @returns {String} parsed Json file content
 */
function loadFromJsonFile(file) {
    return JSON.parse(fs.readFileSync(file, { mode: 0o666 }));
}

/** Creates component files from objects array
 * 
 * @param {Array} array Array of objects to be created as component
 */
function transpileArrayIntoComponents(array) {
    var nested = array.length > 1;
    array.map((section, sectionIndex) => {
        section.content.map(content => {
            let string = getStringFromArray(content.data);
            if (sectionIndex == 0)
                createComponent(C.ComponentsPath, section.folder, string, content.language, false, nested);
            else
                createComponent(C.ComponentsPath, section.folder, string, content.language, true, nested);
        });
    });
}

/** Counts the number of subdirectories in a directory
 * 
 * @param {String} dir Path to your directory where you'd like to count subdirectories
 * @returns {Number} count of subdirectories
 */
function countSubDirs(dir) {
    dir = Path.normalize(dir);
    var parse = dir.split('\\'),
        index = parse.indexOf(Path.parse(dir).base);
    return Math.floor(parse.length - index);
}

function AboutUs() {
    // Main loop starts here, actual script execution starts here

    // First we ask the user whether the user would like to try and parse a custom file
    if (readlineSync.keyInYN("Would you like to try and parse custom files? ")) {
        // If yes we let the user choose from folders we found in /files/ directory which one
        let folders = getFolders(Path.normalize(`${C.ModulePath}../`)),
            index = readlineSync.keyInSelect(folders, "Please pick a directory holding your custom file/s..."),
            path = Path.normalize(`${C.ModulePath}../${folders[index]}`);

        // We confirm the path to the module that the user picked is correct and then continue if not, we break the script
        console.log(`\r\nYou picked '${folders[index]}'`);
        if (readlineSync.keyInYN(`Is "${path}" the correct path?`))
            C.ModulePath = path;
        else
            throw new Error("Fatal error, couldn't get the right path for custom parsing");

        // We ask the user to input the name of the component to create from the module
        C.componentName = readlineSync.question("\r\nWhat would you like your component to be named?\r\n").trim();
        C.componentName = C.componentName.includes('.') ? C.componentName.split('.')[0] : C.componentName;

        // We ask whether the user would like to create/use a Json file for his module
        if (readlineSync.keyInYN('Would you like to create/use a Json file for your parsed objects?')) {
            // If yes we ask the user to input the name of the Json file
            C.jsonFile = readlineSync.question("\r\nWhat would you like your json file to be named?\r\n").trim();
            C.jsonFile = C.jsonFile.includes('.') ? (`${C.jsonFile.split('.')[0]}.json`) : `${C.jsonFile}.json`;
        } else {
            C.jsonFile = null;
        }
    }

    // We get all the readable files from our module's directory
    Files(C.ModulePath, async res => {
        var arr = await createFilesArray(res);
        // Here we check whether it's a nested module or not, and declare necessary variables
        var folders = countSubDirs(C.ModulePath) > 1 ? getFolders(C.ModulePath) : [Path.parse(Path.normalize(C.ModulePath)).base],
            arr2 = [],
            temp = [],
            skip = false,
            found = false;

        // If Json File is set we try to search for it and print our result to the user
        if (C.jsonFile) {
            console.log(`Searching for Json file ${C.jsonFile} at [${Path.join(C.ModulePath, C.jsonFile ? C.jsonFile : '')}]\n`);
            found = fs.existsSync(Path.join(C.ModulePath, C.jsonFile)) ? true : false;
            console.log(`Found: ${found}\n`);
        }

        // If we found the Json file we ask the user whether he wants to use the data inside the file
        if (found) {
            if (readlineSync.question(`\nWould you like to fetch the AboutUs data from ${C.jsonFile}? Yes/No\n`).toLowerCase() === 'yes') {
                temp = loadFromJsonFile(Path.join(C.ModulePath, C.jsonFile));
                skip = true;
            }
        }

        // If the user decides not to use the data from the Json file, we have to parse the files that we retrieved earlier on
        if (!skip) {
            // We iterate each file and parse its content which is then pushed into an array
            arr.map(file => {
                for (var res of parseString(fs.readFileSync(file.path, 'utf8')))
                    arr2.push(new Paragraph({ title: res.title, text: { short: res.short, long: res.long }, language: file.language, folder: file.folder.toLowerCase() }));
            });

            // For each nested component and language inside our module we sort the above parsed objects, organization 
            folders.map(folder => {
                let temp2 = [];
                getFolders(C.ComponentsPath).map(language => {
                    temp2.push({ language: language.toLowerCase(), data: arr2.filter(paragraph => folder.toLowerCase() === paragraph.folder && language.toLowerCase() === paragraph.language.toLowerCase()) });
                });
                temp.push({ folder: folder.toLowerCase(), content: temp2 })
            });
        }

        // Last debug message and check of our array of Objects before they are converted into a component
        console.log(temp);
        if (!temp) throw new Error('Object reference not set to an instance of an object');

        // If we used the data from our Json file there is no reason to ask the user whether he wants to create a new Json file so it's skipped
        if (!skip) {
            // This is self-explanatory
            switch (readlineSync.question("\nWould you like to create a new JSON file for the AboutUs? Yes/No\n").toLowerCase()) {
                case "yes":
                    saveAsJson(temp); // Creating json file
                    break;
            }
        }

        transpileArrayIntoComponents(temp); // Creating components files
    });
}

module.exports = {
    AboutUs: AboutUs
}

AboutUs();
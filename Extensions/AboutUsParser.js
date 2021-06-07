

//regex link for paragraph searching: https://regex101.com/r/UhgGAR/1
const fs = require('fs');
const Path = require('path');

const C = {
    dPath: '../source/files/AboutUs', // Directory path of AboutUs files
    path: '../components/', // Components folder path
    separator: '[Section]', // Separator used in text files to separate each paragraph
};

const getLanguages = source => fs.readdirSync(source)
    .filter((file) => fs.statSync(source + '/' + file).isDirectory());

class Paragraph {
    constructor(title, short_desc, long_desc, language, photo) {
        this.title = title;
        this.short = short_desc;
        this.long = long_desc;
        this.language = language;
        this.photo = photo;
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
    </div>`;
    }
}

/**
 * @param {String} Fpath Path where to create the component
 * @param {String} name File name of the component
 * @param {String} string String that will be written inside the component
 * @param {String} language
 * @param {Boolean} append_file Whether to append or overwrite already existing file 
 */
function createComponent(Fpath, name, string, language, append_file = true) {
    const CC = { separator: `:^) ${name} :::` };
    let path = Path.join(Fpath, language, name + '.html');
}

/** Prints a message to the console
 * 
 * @param {String} message - The message to be printed into the console
 */
function print(message) {
    console.log(message);
}

// print(createComponent('aboutuscards', null, getLanguages(C.path)[0]));
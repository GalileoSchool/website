class News {
    
    /**
     * 
     * @param {HTMLElement} section 
     */
    constructor(section) {
        this.section = section;
        this.heading = null;
        this.body = null;

        this._parseHeading(this.section, (heading) => {
            if (!heading) throw new Error("Nullptr found at [this._parseHeading] in class.News ctor<...>");
            this.heading = heading;

            this._parseBody(this.section, (body) => {
                if (!body) throw new Error("Nullptr found at [this._parseHeading][this._parseBody] in class.News ctor<...>");
                this.body = body;
                delete this.section;
            });
        });

        if (!this._initiated) throw new Error("There was an error while initializing class.News ctor<...>");
    }

    /**
     * 
     * @param {HTMLElement} section 
     * @param {Function} result 
     */
    _parseHeading(section, callback) {
        callback(section.getElementsByClassName("gadgetTitle")[0].textContent);
    }

    /**
     * 
     * @param {HTMLElement} section 
     * @param {Function} result 
     */
    _parseBody(section, callback) {
        callback(section.getElementsByClassName("plainText")[0].textContent);
    }

    /**
     * 
     * @returns {boolean}
     */
    _initiated() {
        return (this.heading && this.body && (this.section == undefined)) ? true : false;
    }
}

module.exports = {
    News: News
}
/** News object which was intended to parse each section from earlier downloaded Edupage News into usable texts
 * @deprecated
 */
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
            // Nullptr means Null Pointer; In simple words the object reference was not set to an instance of an object.
            // ctor<...> stands for constructor()
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

    /** Checks whether object was initialized successfully
     * 
     * @returns {boolean} returns true if News object was successfully initialized else returns false 
     */
    _initiated() {
        return !!(this.heading && this.body && (this.section == undefined));
    }
}

module.exports = { News: News }
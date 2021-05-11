class ModalContainer {
    /**
     * 
     * @param {HTMLElement} textContainer 
     */
    constructor(textContainer) {
        if (!textContainer) throw new Error("[ModalContainer] >>> {../ctor} >>> Object reference resulted in a nullptr");
        else this.container = textContainer;

        this.HtmlText = this._getHtmlText();
        this.rawText = this._getRawText();

        if (!this.HtmlText || !this.rawText) throw new Error("[ModalContainer] >>> {../ctor} >>> Object reference resulted in a nullptr");
    }

    /**
     * 
     * @param {HTMLElement} textContainer 
     * @returns {string} HTML Text
     */
    _getHtmlText() {
        return (this.container.innerHTML) ? this.container.innerHTML : false;
    }

    /**
     * 
     * @param {HTMLElement} textContainer 
     * @returns {string} Raw Text
     */
     _getRawText() {
        return (this.container.innerText) ? this.container.innerText : false;
    }
}

class ModalHandler {
    /**
     * 
     * @param {ModalContainer} modalContainer 
     * @param {ModalViewer} modalViewer 
     */
    constructor(modalContainer, modalViewer, bckg_scrolling = false, sliding = true) {
        if (!modalContainer || !modalViewer)
            throw new Error("[ModalHandler] >>> {../ctor} >>> Object reference resulted in a nullptr");
        else {
            this.container = modalContainer;
            this.view = modalViewer;
        }

        this.bckg_scrolling = bckg_scrolling;
        this.sliding = sliding;
        this._initializeModal();
    }

    /**
     * 
     * @param {ModalContainer} modalContainer 
     */
    _loadNewContainer(modalContainer) {
        if (modalContainer)
            this.container = modalContainer;
        else throw new Error("[ModalHandler] >>> _loadNewContainer() >>> Object reference resulted in a nullptr");

        this._resetModal();
        this._initializeModal();
    }

    /**
     * 
     * @param {ModalViewer} modalViewer 
     */
    _loadNewViewer(modalViewer) {
        if (modalViewer)
            this.view = modalViewer;
        else throw new Error("[ModalHandler] >>> _loadNewViewer() >>> Object reference resulted in a nullptr");

        this._resetModal();
        this._initializeModal();
    }

    _initializeModal() {
        if (this.container && this.view) {
            if (this.view.txtBoxes.length < 1)
                this.view._addTextWrapper("first-text-wrapper").innerHTML += this.container.HtmlText;
            else
                this.view.txtBoxes[0].innerHTML += this.container.HtmlText;
        } else throw new Error("[ModalHandler] >>> _initializeModal() >>> Object reference resulted in a nullptr");
    }

    _resetModal() {
        if (this.container && this.view) {
            if (this.view.txtBoxes.length < 1)
                this.view._addTextWrapper("first-text-wrapper").innerHTML = "";
            else {
                for (let txtbox of this.view.txtBoxes)
                    txtbox.innerHTML = "";
            }
                
        } else throw new Error("[ModalHandler] >>> _initializeModal() >>> Object reference resulted in a nullptr");
    }

    show() {
        // $(this.view.container.parentElement).removeClass("no-display");
        if(this.sliding)
            $(this.view.container.parentElement).slideDown(400);
        else
            $(this.view.container.parentElement).fadeIn(400);
        if (this.view.background && this.view.closeBtn) {
            $(this.view.background).removeClass("no-display");
            $(this.view.closeBtn).removeClass("no-display");
        }
        if (!this.bckg_scrolling)
            $("body").addClass("no-overflow");
    }

    hide() {
        // $(this.view.container.parentElement).addClass("no-display");
        $(this.view.container.parentElement).slideUp(400);
        $("body").removeClass("no-overflow");
        if (this.view.background && this.view.closeBtn) {
            $(this.view.background).addClass("no-display");
            $(this.view.closeBtn).addClass("no-display");
        }
    }

    toggle() {
        // $(this.view.container.parentElement).toggleClass("no-display");
        if(this.sliding)
            $(this.view.container.parentElement).slideToggle(400);
        else
            $(this.view.container.parentElement).toggle();
        if (this.view.background && this.view.closeBtn) {
            $(this.view.background).toggleClass("no-display");
            $(this.view.closeBtn).toggleClass("no-display");
        }
        if (!this.bckg_scrolling)
            $("body").toggleClass("no-overflow");
    }

    // Function that's responsible for scrolling to the top of the given element
    scrollToTop() {
        try{
            this.view.container.parentElement.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
        }
        catch(err){
            this.view.container.parentElement.scrollTop = 0;
        }
    }
}

class ModalViewer {
    /**
     * 
     * @param {HTMLElement} modalBox 
     */
    constructor(modalBox, modalBckg = null, modalClose = null) {
        if (!modalBox)
            throw new Error("[ModalViewer] >>> {../ctor} >>> Object reference resulted in a nullptr");
        else this.container = modalBox;

        if (modalBckg && modalClose) {
            this.background = modalBckg;
            this.closeBtn = modalClose;
        }

        this.container = this._addInnerWrapper();
        this.txtBoxes = new Array();
        this.Buttons = new Array();
    }

    /**
     * 
     * @returns {HTMLElement}
     */
    _addInnerWrapper() {
        this.container.innerHTML += `<div class="modal-inner-wrapper"></div>`;
        return this.container.firstElementChild;
    }

    /**
     * 
     * @param {String} id 
     * @returns {HTMLElement}
     */
    _addTextWrapper(id) {
        this.container.innerHTML += `<div id="${id}" class="modal-text-wrapper"></div>`;
        let wrapper = this.container.querySelector("#" + id + ".modal-text-wrapper");
        this.txtBoxes.push(wrapper);
        return wrapper;
    }

    /**
     * 
     * @param {String} id 
     * @param {String} text 
     * @param {Function} clickCallback 
     * @returns {HTMLElement}
     * @deprecated Not working yet as it should
     */
    _addButton(id, text) {
        this.container.innerHTML += `<button type="button" id="${id}" class="btn btn-primary">${text}</button>`;
        var btn = this.container.querySelector("#" + id + ".btn");
        if (!btn)
            throw new Error("[ModalViewer] >>> _addButton() >>> Object reference resulted in a nullptr");
        this.Buttons.push(btn);
        return btn;
    }
}

//export { ModalHandler, ModalViewer, ModalContainer };
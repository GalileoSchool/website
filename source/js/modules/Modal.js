class ModalContainer {
    /**
     * 
     * @param {HTMLElement} textContainer 
     */
    constructor(textContainer) {
        if (!textContainer) throw new Error("[ModalContainer] >>> {../ctor} >>> Object reference resulted in a nullptr");
        else this.container = textContainer;
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
    constructor(modalContainer, modalViewer) {
        if (!modalContainer || !modalViewer)
            throw new Error("[ModalHandler] >>> {../ctor} >>> Object reference resulted in a nullptr");
        else {
            this.container = modalContainer;
            this.view = modalViewer;
        }


    }

    /**
     * 
     * @param {ModalContainer} modalContainer 
     */
    _loadNewContainer(modalContainer) {
        if (modalContainer)
            this.container = modalContainer;
        else throw new Error("[ModalHandler] >>> _loadNewContainer() >>> Object reference resulted in a nullptr");
    }

    /**
     * 
     * @param {ModalViewer} modalViewer 
     */
    _loadNewViewer(modalViewer) {
        if (modalViewer)
            this.view = modalViewer;
        else throw new Error("[ModalHandler] >>> _loadNewViewer() >>> Object reference resulted in a nullptr");
    }

    _updateModal() {
        //Add updating method
    }
}

class ModalViewer {
    /**
     * 
     * @param {HTMLElement} modalBox 
     */
    constructor(modalBox) {
        if (!modalBox)
            throw new Error("[ModalViewer] >>> {../ctor} >>> Object reference resulted in a nullptr");
        else this.container = modalBox;
        this.container = this._addInnerWrapper();

        this.txtBoxes = new HTMLCollection();
        this.Buttons = new HTMLCollection();
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
        let wrapper = this.container.querySelector("#" + id);
        this.txtBoxes.push(wrapper);
        return wrapper;
    }

    /**
     * 
     * @param {String} id 
     * @param {String} text 
     * @param {Function} clickCallback 
     * @returns {HTMLElement}
     */
    _addButton(id, text, clickCallback) {
        this.container.innerHTML += `<button type="button" id="${id}" class="btn btn-primary">${text}</button>`;
        var btn = this.container.querySelector("#" + id + ".btn");
        if (!btn)
            throw new Error("[ModalViewer] >>> _addButton() >>> Object reference resulted in a nullptr");
        btn.addEventListener('click', clickCallback(e));
        this.Buttons.push(btn);
        return btn;
    }
}

export { ModalHandler, ModalViewer, ModalContainer };
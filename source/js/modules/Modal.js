/* eslint-disable max-classes-per-file */

/** ModalContainer holds and controls all the text necessary for the modal-box.
 *
 * Object responsible for holding and parsing text from the given html text-containing element.
 */
class ModalContainer {
  /**
     *
     * @param {HTMLElement} textContainer - The html element that contains the text that we would like to parse into our modal-box
     */
  constructor(textContainer) {
    // ctor is a shorthand for constructor
    // Nullptr means null pointer; The object reference that you made was not set to an instance of an object and thus resulted in a null object
    if (!textContainer) throw new Error('[ModalContainer] >>> ModalContainer.constructor() >>> Object reference resulted in a nullptr');
    else this.container = textContainer;

    this.HtmlText = this._getHtmlText();
    this.rawText = this._getRawText();
    
    if (!this.HtmlText && !this.rawText) throw new Error('[ModalContainer] >>> ModalContainer.constructor() >>> Object reference resulted in a nullptr');
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

/** ModalHandler holds, connects, and controls ModalContainer and ModalViewer
 *
 * It is an object responsible for connecting ModalContainer and its texts
 * with ModalViewer holding modal-box necessary elements, to create an easy
 * to control Modal-Box object with just a few lines of code.
 */
class ModalHandler {
  /**
     *
     * @param {ModalContainer} modalContainer
     * @param {ModalViewer} modalViewer
     */
  constructor(modalContainer, modalViewer, bckg_scrolling = false, sliding = true) {
    // ctor is a shorthand for constructor
    // Nullptr means null pointer; The object reference that you made was not set to an instance of an object and thus resulted in a null object
    if (!modalContainer || !modalViewer) throw new Error('[ModalHandler] >>> ModalHandler.constructor() >>> Object reference resulted in a nullptr');
    else {
      this.container = modalContainer;
      this.view = modalViewer;
    }

    this.bckg_scrolling = bckg_scrolling;
    this.sliding = sliding;
    this._initializeModal();
  }

  /** Loads a new `ModalContainer` object and updates the `ModalHandler`
     *
     * @param {ModalContainer} modalContainer
     */
  loadNewContainer(modalContainer) {
    if (modalContainer) this.container = modalContainer;
    else throw new Error('[ModalHandler] >>> loadNewContainer() >>> Object reference resulted in a nullptr');

    this._resetModal();
    this._initializeModal();
  }

  /** Loads a new `ModalViewer` object and updates the `ModalHandler`
     *
     * @param {ModalViewer} modalViewer
     */
  loadNewViewer(modalViewer) {
    if (modalViewer) this.view = modalViewer;
    else throw new Error('[ModalHandler] >>> loadNewViewer() >>> Object reference resulted in a nullptr');

    this._resetModal();
    this._initializeModal();
  }

  _initializeModal() {
    if (this.container && this.view) {
      if (this.view.txtBoxes.length < 1) this.view._addTextWrapper('first-text-wrapper').innerHTML += this.container.HtmlText;
      else this.view.txtBoxes[0].innerHTML += this.container.HtmlText;
    } else throw new Error('[ModalHandler] >>> _initializeModal() >>> Object reference resulted in a nullptr');
  }

  _resetModal() {
    if (this.container && this.view) {
      if (this.view.txtBoxes.length < 1) this.view._addTextWrapper('first-text-wrapper').innerHTML = '';
      else {
        for (const txtbox of this.view.txtBoxes) txtbox.innerHTML = '';
      }
    } else throw new Error('[ModalHandler] >>> _initializeModal() >>> Object reference resulted in a nullptr');
  }

  /**
     * `Show the modal-box`
     */
  show() {
    if (this.sliding) $(this.view.container.parentElement).slideDown(400);
    else $(this.view.container.parentElement).fadeIn(400);
    if (this.view.background && this.view.closeBtn) {
      $(this.view.background).removeClass('no-display');
      $(this.view.closeBtn).removeClass('no-display');
    }
    if (!this.bckg_scrolling) $('body').addClass('no-overflow');
  }

  /**
     * `Hide the modal-box`
     */
  hide() {
    $(this.view.container.parentElement).slideUp(400);
    $('body').removeClass('no-overflow');
    if (this.view.background && this.view.closeBtn) {
      $(this.view.background).addClass('no-display');
      $(this.view.closeBtn).addClass('no-display');
    }
  }

  /**
     * `Toggles the visibility of the modal-box`
     */
  toggle() {
    if (this.sliding) $(this.view.container.parentElement).slideToggle(400);
    else $(this.view.container.parentElement).toggle();
    if (this.view.background && this.view.closeBtn) {
      $(this.view.background).toggleClass('no-display');
      $(this.view.closeBtn).toggleClass('no-display');
    }
    if (!this.bckg_scrolling) $('body').toggleClass('no-overflow');
  }

  /**
   *  Function that's responsible for scrolling to the top of the given element
   */
  scrollToTop() {
    try {
      this.view.container.parentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      this.view.container.parentElement.scrollTop = 0;
    }
  }
}

/** ModalViewer holds and controls all the html elements necessary for the modal-box.
 *
 * It is an object responsible for holding and modifying our modal-box html element.
 *
 * It is also responsible to synchronize modal-background and modal-close-button with the modal-box.
 */
class ModalViewer {
  /**
     *
     * @param {HTMLElement} modalBox
     * @param {HTMLElement} modalBckg
     * @param {HTMLElement} modalClose
     */
  constructor(modalBox, modalBckg = null, modalClose = null) {
    // ctor is a shorthand for constructor
    // Nullptr means null pointer; The object reference that you made was not set to an instance of an object and thus resulted in a null object
    if (!modalBox) throw new Error('[ModalViewer] >>> ModalViewer.constructor() >>> Object reference resulted in a nullptr');
    else this.container = modalBox;

    if (modalBckg && modalClose) {
      this.background = modalBckg;
      this.closeBtn = modalClose;
    }

    this.container = this._addInnerWrapper();
    this.txtBoxes = [];
    this.Buttons = [];
  }

  /** Adds a new `Content` wrapping element into the modal-box
     *
     * @returns {HTMLElement}
     */
  _addInnerWrapper() {
    this.container.innerHTML += '<div class="modal-inner-wrapper"></div>';
    return this.container.firstElementChild;
  }

  /** Adds a new `Text` wrapping element into the modal-box
     *
     * @param {String} id
     * @returns {HTMLElement}
     */
  _addTextWrapper(id) {
    this.container.innerHTML += `<div id="${id}" class="modal-text-wrapper"></div>`;
    const wrapper = this.container.querySelector(`#${id}.modal-text-wrapper`);
    this.txtBoxes.push(wrapper);
    return wrapper;
  }

  /** Adds a new `Button` element into the modal-box
     * with the given `id=id` and `value=text`
     *
     * @param {String} id
     * @param {String} text
     * @param {Function} clickCallback
     * @returns {HTMLElement}
     * @deprecated Not working yet as it should
     */
  _addButton(id, text) {
    this.container.innerHTML += `<button type="button" id="${id}" class="btn btn-primary">${text}</button>`;
    const btn = this.container.querySelector(`#${id}.btn`);
    if (!btn) throw new Error('[ModalViewer] >>> _addButton() >>> Object reference resulted in a nullptr');
    this.Buttons.push(btn);
    return btn;
  }
}

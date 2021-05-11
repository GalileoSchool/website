//import { ModalHandler, ModalViewer, ModalContainer } from './modules/Modal.js';

const modalBox = document.getElementById("modal-box");
const modalCloseBtn = document.getElementById("modal-close");
const modalBckg = document.getElementById("modal-background");

var Handler;
var Viewer = new ModalViewer(modalBox, modalBckg, modalCloseBtn);
var Container;


$(modalCloseBtn).click((e) => {
    if (!Handler) {
        e.preventDefault();
        throw new Error("Handler was not set before calling modalCloseBtn clickEvent");
    }
    Handler.hide();
});

// var btn = Viewer._addButton("modal-inner-close", "Back"); - Fix event listener getting ducked up when shown

/** Click Handler of Admissions
 * 
 * @param {HTMLElement} target 
 */
function Click(target) {
    let textContainer = target.querySelector("div.admiss-text");
    Container = new ModalContainer(textContainer);
    if (!Handler)
        Handler = new ModalHandler(Container, Viewer, false, false);
    else
        Handler._loadNewContainer(Container);
    
    Handler.show();
    Handler.scrollToTop();
}

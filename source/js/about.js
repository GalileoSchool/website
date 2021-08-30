// Script that holds a function for expanding box texts
$(document).ready(function () {

    $('.toggle-btn').click(toggleShowLongText); // Adding button event listener

    /**
     * Function responsible for hiding and showing long texts on expandable boxes
     * @param {HTMLElement} caller - Html element that invoked the function
     */
    function toggleShowLongText(caller = null) {
        caller = isHtmlElement(caller) ? caller : this.parentElement.parentElement;// Caller is the base elment the card element from which the function was called
                                                            // As we know buttons in cards are wrapped in multiple wrappers so we have to reach the base element
        let img = caller.parentElement.children[0].children[0]; // We select image element
        let skip_img_styling;
        if (img) { // If the text block contains an image we check whether it needs a css fixing or no
            skip_img_styling = img.getAttribute('style') ? false : true;
            if (skip_img_styling)
                img.style = 'height:auto;';
        }


        let textContainer = caller.children[1].children[0]; // We select textContainer element
        textContainer.id = textContainer.getAttribute('id') ? textContainer.id : 'this'; // If the text contianer doesn't have id 
                                                                                        // for easier manipulation we set it a temporary one

        let descriptionContainer = caller.children[0].children[1].children[0]; // We select longTextContainer element
        descriptionContainer.classList = descriptionContainer.getAttribute('class') ? '' : 'full';

        $("#" + textContainer.id).slideToggle(250, () => {
            if (img && !skip_img_styling)
                img.style = img.getAttribute('style') ? img.removeAttribute('style') : 'height:auto;';
        });

        this.innerText = this.innerText.indexOf('more') > 0 ? '..show less' : '...see more'; // A tricky way how to make a toggle changing text of an elment
        // Adding and removing style of the card box depending on our needs
        this.style = this.getAttribute('style') ? this.removeAttribute('style') : 'background-color: #dddddd; color: black; border-color: white; font-weight: bold;';

        // Removing the temporary id that we've set earlier
        textContainer.removeAttribute('id');
    }

    function isHtmlElement(object) {
        try {
            return object instanceof HTMLElement;
        } catch (error) {
            return false;
        }
    }
});
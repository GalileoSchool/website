$(document).ready(function() {

    $('.toggle-btn').click(toggleShowLongText);

    /**
     * Function responsible for hiding and showing long texts on expandable boxes
     */
    function toggleShowLongText() {
        let caller = this.parentElement.parentElement;

        let img = caller.parentElement.children[0].children[0];
        let skip_img_styling;
        if (img) {
            skip_img_styling = img.getAttribute('style') ? false : true;
            if (skip_img_styling)
                img.style = 'height:auto;';
        }


        let textContainer = caller.children[1].children[0];
        textContainer.id = textContainer.getAttribute('id') ? textContainer.id : 'this';

        let descripContainer = caller.children[0].children[1].children[0];
        descripContainer.classList = descripContainer.getAttribute('class') ? '' : 'full';

        $("#" + textContainer.id).slideToggle(250, () => {
            if (img && !skip_img_styling)
                img.style = img.getAttribute('style') ? img.removeAttribute('style') : 'height:auto;';
        });

        this.innerText = this.innerText.indexOf('more') > 0 ? '..show less' : '...see more';
        this.style = this.getAttribute('style') ? this.removeAttribute('style') : 'background-color: #dddddd; color: black; border-color: white; font-weight: bold;';

        textContainer.removeAttribute('id');
    }
});
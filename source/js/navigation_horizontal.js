$(document).ready(function () {
    const navbar = "#nav-desk";
    const navigation = "#navigation";
    const navBtn = "#nav-btn";
    const navBtnImgSrc = $("#menu-img").attr('src');
    const navBtnExitImgSrc = getCloseImgUrl(navBtnImgSrc, 'close');
    const langBtn = "#menu-btn-img";
    const langDropdown = ".language-dropdown-content";

    var isSearching = false;
    var isMenuOpen = false;
    var screen = new Viewport($(window).innerWidth(),$(window).innerHeight());
    var isDesktop = screen.isDesktop;
    var menuType;

    if(isDesktop)
        menuType = 1;
    else
        menuType = 0;

    $(window).resize(function () { 
        // Since Javascript has an automatic garbage collection we don't have to worry about disposing the old object first
        screen = new Viewport($(window).innerWidth(),$(window).innerHeight());
        isDesktop = screen.isDesktop;

        if(isDesktop && isMenuOpen && menuType == 0) {
            //reset to desktop menu
        }
        else if(!isDesktop && isMenuOpen && menuType == 1) {
            //reset to phone menu
        }

    });



    function toggleDeskMenu() {
        // TODO: toggle classes
        toggleMenuBtnImg();
        isMenuOpen != isMenuOpen;
    }

    function togglePhoneMenu() {
        // TODO: toggle neccessary classes

        isMenuOpen != isMenuOpen;
    }

    function toggleSearch() {
        // TODO: deal with this

        isSearching != isSearching;
    }

    function toggleLanguage() {
        // TODO: Add appropriate classes
    }

    function toggleMenuBtnImg() {
        if(isMenuOpen)
            $('#menu-img').attr('src', navBtnExitImgSrc);
        else
            $('#menu-img').attr('src', navBtnImgSrc);

    }

    function getCloseImgUrl(url_of_img, name_of_file_no_extension) {
        var image_name = url_of_img.split('/').pop();
        return (url_of_img.replace(image_name, name_of_file_no_extension + '.png'));
    }


});

class Viewport {

    /** Screen class constructor
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(width,height) {
        if(width >= 670 )
            this._isDesktop = true;
        else
            this._isDesktop = false;

        this.Width = width;
        this.Height = height;
    }

    get isDesktop() {
        return this._isDesktop;
    }

    get width() {
        return this.Width;
    }

    get height() {
        return this.Height;
    }

}
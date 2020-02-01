$(document).ready(function () {
    const navbar = $("#nav-desk");
    const navigation = $("#navigation");
    const navBtn = $("#nav-btn");
    const navBtnImgSrc = $("#menu-img").attr('src');
    const navBtnExitImgSrc = getCloseImgUrl(navBtnImgSrc, 'close');
    const langBtn = $("#menu-btn-img");
    const langDropdown = $(".language-dropdown-content");

    var isSearching = false;
    var isMenuOpen;
    var screen = new Viewport($(window).innerWidth(),$(window).innerHeight());
    var isDesktop = screen.isDesktop;
    var menuType;

    if(isDesktop) {
        menuType = 1;
        isMenuOpen = true;
        toggleMenuBtnImg();
    }
    else {
        menuType = 0;
        isMenuOpen = false;
        navigation.addClass('hideMenu');
    }

    $(window).resize(function () { 
        // Since Javascript has an automatic garbage collection we don't have to worry about disposing the old object
        screen = new Viewport($(window).innerWidth(),$(window).innerHeight());
        isDesktop = screen.isDesktop;

        if(isDesktop && isMenuOpen && menuType == 0) {
            resetToDesktop();

            menuType = 1;
        }
        else if(!isDesktop && isMenuOpen && menuType == 1) {
            resetToPhoneMenu();
            menuType = 0;
        }

        if(isDesktop && navigation.attr('style'))
            navigation.removeAttr('style');

    });

    /*  Events Section  */

    navBtn.click(function (e) { 
        if(isDesktop)
            toggleDeskMenu();
        else
            togglePhoneMenu();
    });


    /*  Functions Section   */

    function toggleDeskMenu() {
        isMenuOpen = !isMenuOpen;
        navigation.toggleClass('hideMenu');
        toggleMenuBtnImg();
        
    }

    function togglePhoneMenu() {
        isMenuOpen = !isMenuOpen;
        navigation.slideToggle("slow");
        $('.left').toggleClass("red-wine");
        $('.search-drop').toggleClass("no-display");
        $('.language-dropdown').toggleClass("no-display");
        $('#title').toggleClass("title-open-nav");
        $('#logo').toggleClass("logo-img-open-nav");
        $('.logo').toggleClass("logo-open-nav");
        $('.title').toggleClass("title-cont-open-nav");
        $('header').toggleClass("scroll-menu");
        navigation.toggleClass('hideMenu');
        toggleMenuBtnImg();
    }

    function toggleSearch() {
        // TODO: deal with this

        isSearching = !isSearching;
    }

    function toggleLanguage() {
        // TODO: Add appropriate classes
    }

    function resetToPhoneMenu() {
        const left = document.querySelector(".left");
        const language_drop = document.querySelector(".language-dropdown");
        const search = document.querySelector(".search-drop");
        const title_cont = document.querySelector(".title");
        const logo_cont = document.querySelector(".logo");
        const logo = document.getElementById("logo");
        const title = document.getElementById("title");
        const header = document.querySelector("header");

        left.classList.add("red-wine");
        search.classList.add("no-display");
        language_drop.classList.add("no-display");
        title.classList.add("title-open-nav");
        logo.classList.add("logo-img-open-nav");
        logo_cont.classList.add("logo-open-nav");
        title_cont.classList.add("title-cont-open-nav");
        header.classList.add("scroll-menu");
        navigation.attr('style', 'display: block;');
    }

    function resetToDesktop() {
        const left = document.querySelector(".left");
        const language_drop = document.querySelector(".language-dropdown");
        const search = document.querySelector(".search-drop");
        const title_cont = document.querySelector(".title");
        const logo_cont = document.querySelector(".logo");
        const logo = document.getElementById("logo");
        const title = document.getElementById("title");
        const header = document.querySelector("header");

        left.classList.remove("red-wine");
        search.classList.remove("no-display");
        language_drop.classList.remove("no-display");
        title.classList.remove("title-open-nav");
        logo.classList.remove("logo-img-open-nav");
        logo_cont.classList.remove("logo-open-nav");
        title_cont.classList.remove("title-cont-open-nav");
        header.classList.remove("scroll-menu");
        navigation.removeAttr('style');
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
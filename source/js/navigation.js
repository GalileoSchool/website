$(document).ready(function () {
    const navbar = $("#nav-desk");
    const primary_navigation = $("#main-nav");
    const secondary_navigation = $("#sub-nav");
    const phonebar = $('#nav-phone');
    const phone_nav = $("#nav-phone-list");
    const navBtn = $("#nav-btn");
    const navBtnImgSrc = $("#menu-img").attr('src');
    const navBtnExitImgSrc = getCloseImgUrl(navBtnImgSrc, 'close');
    const searchBtnImgSrc = $("#search-img").attr('src');
    const searchBtnExitImgSrc = getCloseImgUrl(searchBtnImgSrc, 'close_black');
    const searchBtn = $("#search");
    const langBtn = $("#langBtn");

    var isSearching = false;
    var viewport = new Viewport($(window).innerWidth(),$(window).innerHeight());
    var isDesktop = viewport.isDesktop;
    var isSubMenuOpen = false;
    var isPhoneMenuOpen = false;

    if(!isDesktop) {
        navbar.addClass('no-display');
    }

    /*  Events Section  */

    $(window).resize(function () { 
        // Since Javascript has an automatic garbage collection we don't have to worry about disposing the old object
        viewport = new Viewport($(window).innerWidth() + 17,$(window).innerHeight());
        isDesktop = viewport.isDesktop;
        if(isDesktop) {
            resetToDesktop();
        }
        else {
            resetToPhoneMenu();
        }
    });

    navBtn.click(function (e) { 
        if(isDesktop)
            toggleDesktopMenu();
        else
            togglePhoneMenu();
    });

    searchBtn.click(function(e){
        toggleSearch();
    });


    /*  Functions Section   */

    function toggleDesktopMenu() {
        isSubMenuOpen = !isSubMenuOpen;
        if($('html').scrollTop() != 0)
            $("html, body").animate({ scrollTop: 0 }, "slow");
        secondary_navigation.slideToggle();
        toggleMenuBtnImg();
        $('.content').toggleClass('blur');
        $('#menu-overlay').toggleClass('no-display');
    }

    function togglePhoneMenu(toggle = true) {
        isPhoneMenuOpen = !isPhoneMenuOpen;
        if(isSearching)
            toggleSearch();
        $('.left').toggleClass("red-wine");
        $('#search').toggleClass("no-display");
        langBtn.toggleClass("no-display");
        $('.language-dropdown').toggleClass("no-display");
        $('#title').toggleClass("title-open-nav");
        $('#logo').toggleClass("logo-img-open-nav");
        $('.logo').toggleClass("logo-open-nav");
        $('.title').toggleClass("title-cont-open-nav");
        $('nav').toggleClass("scroll-menu");
        toggleMenuBtnImg();
        phone_nav.slideToggle("fast");
    }

    function toggleSearch() {
        $('li.logo').toggleClass('searching');
        $('li.title').toggleClass('searching');
        $('.search-container').toggleClass('close');
        isSearching = !isSearching;
        toggleSearchBtnImg();
    }

    function resetToPhoneMenu() {
        navbar.addClass('no-display');
        if(isSubMenuOpen) {
            secondary_navigation.slideUp();
            isSubMenuOpen = !isSubMenuOpen;
            toggleMenuBtnImg();
        }
    }

    function resetToDesktop() {
        navbar.removeClass('no-display');
        if(isPhoneMenuOpen) {
            phone_nav.slideUp();
            $('.left').removeClass("red-wine");
            $('#search').removeClass("no-display");
            langBtn.removeClass("no-display");
            $('.language-dropdown').removeClass("no-display");
            $('#title').removeClass("title-open-nav");
            $('#logo').removeClass("logo-img-open-nav");
            $('.logo').removeClass("logo-open-nav");
            $('.title').removeClass("title-cont-open-nav");
            $('nav').removeClass("scroll-menu");
            isPhoneMenuOpen = !isPhoneMenuOpen;
            toggleMenuBtnImg();
        }
    }

    function toggleMenuBtnImg() {
        if(isSubMenuOpen || isPhoneMenuOpen)
            $('#menu-img').attr('src', navBtnExitImgSrc);
        else
            $('#menu-img').attr('src', navBtnImgSrc);

    }

    function toggleSearchBtnImg() {
        if(isSearching)
            $("#search-img").attr('src', searchBtnExitImgSrc);
        else
            $("#search-img").attr('src', searchBtnImgSrc);
    }

    function getCloseImgUrl(url_of_img, name_of_file_no_extension) {
        var image_name = url_of_img.split('/').pop();
        return (url_of_img.replace(image_name, name_of_file_no_extension + '.png'));
    }

});

class Viewport {

    /** Viewport class constructor
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
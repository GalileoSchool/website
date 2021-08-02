/* eslint-disable no-use-before-define */

$(document).ready(() => {
    const navbar = $('#nav-desk');
    const secondary_navigation = $('#sub-nav');
    const phone_nav = $('#nav-phone-list');
    const navBtn = $('#nav-btn');
    const navBtnImgSrc = $('#menu-img').attr('src');
    const navBtnExitImgSrc = getCloseImgUrl(navBtnImgSrc, 'close');
    const searchBtnImgSrc = $('#search-img').attr('src');
    const searchBtnExitImgSrc = getCloseImgUrl(searchBtnImgSrc, 'close_black');
    const searchBtn = $('#search');
    const langBtn = $('#langBtn');
    const dropdowns = document.querySelectorAll('li div.sub-menu-btn');

    let isSearching = false;
    let viewport = new Viewport($(window).innerWidth(), $(window).innerHeight());
    let { isDesktop } = viewport;
    let isSubMenuOpen = false;
    let isPhoneMenuOpen = false;

    if (!isDesktop) {
        navbar.addClass('no-display');
    }

    // We check here whether the url contains /school/ or /summer/ section
    if (urlContains('/school/') && !urlContains('/summer/')) {
        // If it does we get in what type of school we are atm
        const arr = document.location.pathname.split('/');
        // And then we set one of the coresponding tabs in the dropdown menu of 'About Us' to active
        document.getElementById(arr[arr.indexOf('school') + 1].toLowerCase().replace('%20', ' ')).classList.add('active');
    }


    /*  Events Section  */

    $(window).resize(() => {
        // Since Javascript has an automatic garbage collection we don't have to worry
        // about disposing the old object
        viewport = new Viewport($(window).innerWidth(), $(window).innerHeight());
        isDesktop = viewport.isDesktop;
        if (isDesktop) {
            resetToDesktop();
        } else {
            resetToPhoneMenu();
        }
    });

    navBtn.click(() => {
        if (isDesktop) { toggleDesktopMenu(); } else { togglePhoneMenu(); }
    });

    searchBtn.click(() => {
        toggleSearch();
    });


    for (const btn of dropdowns) {
        // btn is shorthand for button
        $(btn.parentElement).click((e) => {
            if (e.target.childElementCount == 0) { e.target = e.target.parentElement; }
            if (e.target.tagName.toLowerCase() != 'li') { return; }

            $(e.target.children[1]).slideToggle('normal');
            $(e.target.children[0]).toggleClass('closed opened');
            $(e.target).toggleClass('closed opened');
        });
    }


    /*  Functions Section   */

    function toggleDesktopMenu() {
        isSubMenuOpen = !isSubMenuOpen;
        if ($('html').scrollTop() != 0) { $('html, body').animate({ scrollTop: 0 }, 'slow'); }
        secondary_navigation.slideToggle();
        toggleMenuBtnImg();
        $('.content').toggleClass('blur');
        $('#menu-overlay').toggleClass('no-display');
    }

    function togglePhoneMenu() {
        isPhoneMenuOpen = !isPhoneMenuOpen;
        if (isSearching) { toggleSearch(); }
        $('.left').toggleClass('red-wine');
        $('#search').toggleClass('no-display');
        langBtn.toggleClass('no-display');
        $('.language-dropdown').toggleClass('no-display');
        $('#title').toggleClass('title-open-nav');
        $('#logo').toggleClass('logo-img-open-nav');
        $('.logo').toggleClass('logo-open-nav');
        $('.title').toggleClass('title-cont-open-nav');
        $('nav').toggleClass('scroll-menu');
        toggleMenuBtnImg();
        phone_nav.slideToggle('fast');
    }

    function toggleSearch() {
        $('li.logo').toggleClass('searching');
        $('li.title').toggleClass('searching');
        $('.search-container').toggleClass('close');
        isSearching = !isSearching;
        if (isSearching) $('input#search_box').focus();
        else {
            $('div#search_results').fadeOut('fast');
            $('input#search_box').blur();
        }
        toggleSearchBtnImg();
    }

    function resetToPhoneMenu() {
        navbar.addClass('no-display');
        if (isSubMenuOpen) {
            secondary_navigation.slideUp();
            isSubMenuOpen = !isSubMenuOpen;
            toggleMenuBtnImg();
        }
    }

    function resetToDesktop() {
        navbar.removeClass('no-display');
        if (isPhoneMenuOpen) {
            phone_nav.slideUp();
            $('.left').removeClass('red-wine');
            $('#search').removeClass('no-display');
            langBtn.removeClass('no-display');
            $('.language-dropdown').removeClass('no-display');
            $('#title').removeClass('title-open-nav');
            $('#logo').removeClass('logo-img-open-nav');
            $('.logo').removeClass('logo-open-nav');
            $('.title').removeClass('title-cont-open-nav');
            $('nav').removeClass('scroll-menu');
            isPhoneMenuOpen = !isPhoneMenuOpen;
            toggleMenuBtnImg();
        }
    }

    function toggleMenuBtnImg() {
        if (isSubMenuOpen || isPhoneMenuOpen) { $('#menu-img').attr('src', navBtnExitImgSrc); } else { $('#menu-img').attr('src', navBtnImgSrc); }
    }

    function toggleSearchBtnImg() {
        if (isSearching) { $('#search-img').attr('src', searchBtnExitImgSrc); } else { $('#search-img').attr('src', searchBtnImgSrc); }
    }

    function getCloseImgUrl(url_of_img, name_of_file_no_extension) {
        const image_name = url_of_img.split('/').pop();
        return (url_of_img.replace(image_name, `${name_of_file_no_extension}.png`));
    }

    function urlContains(string) {
        return (document.location.pathname.indexOf(string) > -1);
    }
});

class Viewport {
    /** Viewport class constructor
     *
     * @param {Number} width
     * @param {Number} height
     */
  constructor(width, height) {
    if (width >= 670) { this._isDesktop = true; } else { this._isDesktop = false; }

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

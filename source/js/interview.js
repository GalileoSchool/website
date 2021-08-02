/* eslint-disable no-use-before-define */
$(document).ready(function () {
  // Variables
  const cards = document.getElementsByClassName('card');
  let isCardOpen = false;
  let isCardOpenPhone = false;
  let currentCard; let
    currentCardPhone;

  // Constants
  const menu = $('#modal-navigation');
  const modal_background = $('#modal-background');
  const closeBtn = $('#modal-close');
  const modal_box = $('#modal-box');

  // Adding a click event listener for every button in our interview navigation
  for (const tab of menu.children().children()) {
    tab.addEventListener('click', function (e) {
      if (!isCardAlreadyOpened(this.id)) { updateModalBox(this); } else { e.preventDefault(); }
    });
  }

  // Browser resize handler, executes the following function
  $(window).resize(function () {
    if (!isDesktop()) {
      modal_box.addClass('no-display');
      modal_background.addClass('no-display');
      closeBtn.addClass('no-display');
      menu.addClass('no-display');
      if (isCardOpen) { $('body').toggleClass('no-overflow'); }
      isCardOpen = false;
      currentCard = null;
      modifyUrl(null);
    } else if (isCardOpenPhone) {
      cardTogglePhone(currentCardPhone);
      modifyUrl(null);
    }
  });

  // Adding a click event listener for every student card on our interview page
  for (const card of cards) {
    if (card.id != 'modal-box') {
      card.addEventListener('click', function (e) {
        modifyUrl(hashCode(this.id));
        if (isDesktop()) {
          openCardDesktop(this);
        } else if (!isCardOpenPhone) { openCardPhone(this); }
      });
    }
  }

  // Adding a click event listener to the button that's responsible for closing the modal box
  closeBtn.click(function (e) {
    modifyUrl(null);
    if (isCardOpen && isDesktop()) {
      openCardDesktop(e);
    } else if (isCardOpenPhone && !isDesktop()) {
      cardTogglePhone(currentCardPhone);
    } else { e.preventDefault(); }
  });

  // Adding a click event listener for the browser's back button
  window.onpopstate = function (e) {
    checkUrlForPotentialParameters();
  };

  // Checking whether the URL contains any arguments
  checkUrlForPotentialParameters();


  /* Local Functions Section */

  /** Changes the content inside our modal box when user clicks on a tab in our interview menu
  *
  * @param {HTMLElement} sender Html element that is considered to be the caller of the function
  */
  function updateModalBox(sender) {
    modifyUrl(hashCode(sender.id.replace('_menu', '')));
    modal_box.animate({ height: '0px' }, 200).delay(680).animate({ height: '100vh' }, 200);
    setTimeout(() => {
      updateModalContent(sender);
      setTimeout(() => {
        elementScrollToTop('modal-box');
      }, 900);
    }, 680);
  }

  // Function that's responsible for calling the cardTogglePhone function with the right parameters
  function openCardPhone(e) {
    if (!isCardOpen) { cardTogglePhone(e); } else { cardTogglePhone(null); }
  }

  // Function that's responsible for opening up the modal box and freezing the background
  function openCardDesktop(e) {
    // Check if card ain't already opened
    if (!isCardOpen) { cardToggleDesktop(e); } else { cardToggleDesktop(null); }
    // Freezing background
    $('body').toggleClass('no-overflow');
    menu.toggleClass('no-display');
    modal_background.toggleClass('no-display');
    closeBtn.toggleClass('no-display');
    modal_box.toggleClass('no-display');
    // Scrolling to the top of the modal box
    elementScrollToTop('modal-box');
    isCardOpen = !isCardOpen;
    // Last check whether our card opened correctly
    if (isCardOpen) { currentCard = e.id; } else { currentCard = null; }

    // Changing the active tab in the modal navigation to the current one
    if (currentCard && currentCard != null) { setActiveNavTab(currentCard); }
  }

  // Function that's responsible for scrolling to the top of the given element
  function elementScrollToTop(id) {
    try {
      document.getElementById(id).scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      document.getElementById(id).scrollTop = 0;
    }
  }

  // Function that's responsible for changing the active tab in our interview menu
  function setActiveNavTab(ID) {
    const children = menu.children().children();

    for (const child of children) {
      child.classList.remove('active');
    }

    menu.children().children(`#${ID.replace('_menu', '')}_menu`).addClass('active');
  }

  /** Function that's responsible for changing the modal box content for the one provided
  *  @param sender Since this function is used in an event of a html element, sender is the html element on which the event occured
  */
  function updateModalContent(sender) {
    try {
      let newContent;
      if (sender != null && sender != undefined) { newContent = document.getElementById(sender.id.replace('_menu', '')).innerHTML; } else { newContent = null; }

      if (newContent && newContent != null && newContent != undefined) { modal_box.html(newContent.replace(/no-display/g, '')); }
      setActiveNavTab(sender.id);
    } catch (err) {
      console.error(err);
      throw new Error(`[${updateModalContent.name}] > NullReferenceException: Object reference not set to an instance of an object`);
    }
  }

  // Checks whether the card provided is or isn't already loaded
  function isCardAlreadyOpened(ID) {
    return ($(`#${ID}`).hasClass('active'));
  }

  // Function that's responsible for calling the opening and closing function for the modal box with the right parameters
  function cardToggleDesktop(sender) {
    if (sender != null) { modal_box.html(sender.innerHTML.replace(/no-display/g, '')); } else { modal_box.html(sender); }
  }

  // Function that's responsible for opening and closing the student card on a mobile device
  function cardTogglePhone(sender) {
    if (sender == null) { throw new Error(`[${cardTogglePhone.name}] > NullReferenceException: Object reference not set to an instance of an object`); }

    $('body').toggleClass('no-overflow');
    $(`#${sender.id}`).toggleClass('opened');
    $(`#${sender.id} .card-body .card-text .card-long-desc`).toggleClass('no-display');
    $(`#${sender.id} .card-body h2`).toggleClass('no-display');
    $(`#${sender.id} .card-body .card-images`).toggleClass('no-display');
    closeBtn.toggleClass('no-display');
    currentCardPhone = sender;
    isCardOpenPhone = !isCardOpenPhone;
  }

  /**
  * @description Checks whether the current document dimensions fulfil the requirements to be considered a desktop viewport
  * @returns Boolean
  */
  function isDesktop() {
    if (window.innerWidth >= 670 && window.innerHeight >= 300) { return true; }
    return false;
  }

  // Function that's responsible for generating a hash from a string
  function hashCode(string) {
    let h = 0;
    for (let i = 0; i < string.length; i++) {
      h += Math.imul(31, h) + string.charCodeAt(i) | 0;
    }

    return h;
  }

  // Function that's responsible for checking the URL for any arguments/parameters and taking actions accordingly
  function checkUrlForPotentialParameters() {
    let loadcard = null;
    // Getting current URL
    const url = new URL(window.location.href);
    if (!url.search || url.search == null) { return; }
    // Trying to get parameter id from our URL, which could look like this (https://www.galileoschool.sk/interviews/index.html?id=518421)
    // evertyhing behind the "?" symbol is considered a parameter
    // Multiple parameters are divided with "&" symbol ex. (https:/www.galileoschool.sk/interviews/index.html?id=518421&showPhotos=false)
    // I decided to use id because each interview card has its own UID and it's easier to compare things if you know what you are comparing
    const id = url.searchParams.get('id');
    if (id) {
      for (const card of cards) {
        if (card.id == 'modal-box') break;
        else if (hashCode(card.id) == id) loadcard = card;
        else if (hashCode(card.id) == hashCode(id)) loadcard = card;
        else if (hashCode(card.id.toLowerCase()) == hashCode(id.toLowerCase())) loadcard = card;
      }

      if (loadcard === null) { console.error(`Provided ID [${id}] seems to be invalid!`); } else if (!isCardOpen) { document.getElementById(loadcard.id).click(); } else { updateModalBox(loadcard); }
    }
  }

  /**
   * Function that's responsible for modifying the URL without reloading the page
   * @param {String} id - hashed id of the card that is opened
   */
  function modifyUrl(id) {
    let build_url;
    if (window.location.href.indexOf('id=') !== -1) {
      build_url = window.location.href.replace(window.location.href.split('id=')[1], id);
    } else {
      build_url = (`${window.location.href}?id=${id}`);
    }

    if (id == null) { build_url = build_url.split('?')[0]; }

    // This simply changes the current URL without reloading the page, by creating and activating another history entry without firing the haschanged event for the browser.
    history.pushState({
      id: 'interview',
    }, 'GALILEO | INTERVIEWS', build_url);
  }
});

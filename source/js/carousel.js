/* eslint-disable no-use-before-define */

// get the carousel images
const images = Array.from(document.querySelectorAll('.carousel-item img'));
// get the source strings
const imageSources = images.map((image) => image.getAttribute('src'));
// get the alternate mobile source strings
const imageMobileSources = imageSources.map((source) => source.replace('.jpg', '_mobile.jpg'));

// check if needs to switch picture source
window.addEventListener('resize', check_resize, false);

// just to make sure that the correct picture is displayed
check_resize();

function check_resize() {
  // if in desktop viewport
  if (window.innerWidth >= 670 && window.innerWidth <= 1920) {
    images.forEach((image, i) => {
      // only change the image if needed
      if (image.getAttribute('src') != imageSources[i]) {
        image.setAttribute('src', imageSources[i]);
      }
    });
  // eslint-disable-next-line brace-style
  }
  // if in mobile viewport
  else if (window.innerWidth < 670 && window.innerWidth > 150) {
    images.forEach((image, i) => {
      // only change the image if needed
      if (image.getAttribute('src') != imageMobileSources[i]) {
        image.setAttribute('src', imageMobileSources[i]);
      }
    });
  }
}

$(document).ready(() => {
  // Declaring variables/constants which I will be using later in the code
  const carousel = $('#carousel');

  carousel.carousel();
  carousel.swipe({
    swipe(event, direction, distance, duration, fingerCount, fingerData) {
      if (direction == 'left') $(this).carousel('next');
      if (direction == 'right') $(this).carousel('prev');
    },
    allowPageScroll: 'vertical',
  });
});

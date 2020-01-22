// Debug message to notify that the script has loaded.
// To see it, find the console tab
console.log("Carousel JavaScript has loaded!");

// const images = document.querySelector('.carousel-item img');

// find all carousel items
const items = Array.from(document.getElementsByClassName("carousel-item"))

// TEST
var test = items[0].children
console.log(test.getElementsByTagName("IMG"))

// get the first image in each item
const images = items.map(item => item.children.getElementsByTagName("IMG")[0]) // DOES NOT WORK
// get the source strings
const imageSources = images.map(image => image.getAttribute("src"))
// get the alternate mobile source strings
const imageMobileSources = imageSources.map(source => source.replace(".png", "_mobile.png"))

window.addEventListener("resize", check_resize, false);

function check_resize() {
    // If in desktop viewport (width needs to be the same as in nav_style.css):
    if (window.innerWidth >= 670 && window.innerWidth < 1920) {
        images.forEach(image, i => {
            image.setAttribute("src", imageSources[i])
        });
    }
    else if (window.innerWidth < 670 && window.innerWidth > 150) {
        images.forEach(image, i => {
            image.setAttribute("src", imageMobileSources[i])
        });
    }
}
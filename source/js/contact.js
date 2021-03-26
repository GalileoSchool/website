$(document).ready(function () {
    const body = document.getElementById("main-body");
    var autoHeightApplied = false;
    var desktop = (document.getElementById("heading").scrollHeight != 0) ? true : false;

    checkAutoHeight();
    window.addEventListener("resize", checkAutoHeight);

    if (desktop) {
        let form_inputs = document.querySelectorAll("div.form-input-cont > input:not([type='submit']):not([readonly])");

        const submit = document.getElementById("submitBtn");

        for (let elem of form_inputs) {

            elem.addEventListener("focus", (e) => {
                e.target.parentElement.classList.add("focus");
            });

            elem.addEventListener('focusout', (e) => {
                e.target.parentElement.classList.remove("focus")

                if (e.target.value === "")
                    return;
                if (e.target.getAttribute("type") == "email")
                    validate(e.target.value, true) ? changeClass(e.target.parentElement, "invalid", "valid") : changeClass(e.target.parentElement, "valid", "invalid");
                else
                    validate(e.target.value) ? changeClass(e.target.parentElement, "invalid", "valid") : changeClass(e.target.parentElement, "valid", "invalid");
            });

            elem.addEventListener('input', (e) => {
                if (e.target.value === "")
                    e.target.parentElement.classList = "form-input-cont focus";
                else {
                    if (e.target.getAttribute("type") == "email")
                        validate(e.target.value, true) ? changeClass(e.target.parentElement, "invalid", "valid") : changeClass(e.target.parentElement, "valid", "invalid");
                    else
                        validate(e.target.value) ? changeClass(e.target.parentElement, "invalid", "valid") : changeClass(e.target.parentElement, "valid", "invalid");
                }
            });
        }

        submit.addEventListener('click', (elem) => {
            form_inputs.forEach(e => {
                if (e.getAttribute("type") == "email")
                {
                    if (!validate(e.value, true)) {
                        e.parentElement.classList.add('invalid');
                        elem.preventDefault();
                        return;
                    }
                }
                else {
                    if (!validate(e.value)) {
                        e.parentElement.classList.add('invalid');
                        elem.preventDefault();
                        return;
                    }
                }
            });

            if (!validate(document.getElementById("Message").value)) {
                elem.preventDefault();
                return;
            }
        });
    }

    /**
     * 
     * @param {HTMLElement} elem 
     * @param {String} class1 
     * @param {String} class2 
     */
    function changeClass(elem, class1, class2) {
        if (elem.classList.contains(class1)) {
            elem.classList.remove(class1);
            elem.classList.add(class2);
        }
        else if (elem.classList.contains(class2))
            return;
        else
            elem.classList.add(class2);
    }

    async function checkAutoHeight() {
        desktop = (document.getElementById("heading").scrollHeight != 0) ? true : false;
        if (autoHeightApplied) body.classList.remove("auto-height");

        await autoHeight(body, (e) => {
            if (!e) return;
            e.classList.add("auto-height");
            autoHeightApplied = true;
        });
    }
});

/**
 * 
 * @param {HTMLElement} body 
 * @param {Function} callback 
 */
function autoHeight(body, callback) {
    callback((body.scrollHeight < (window.innerHeight - (window.innerWidth / 10))) ? body : false);
}

/** Checks whether the given string is a valid input
 * 
 * @param {String} string 
 * @param {boolean} email 
 * @returns {boolean}
 */
function validate(string, email = false)
{
    if (!string || string == null || string == undefined) return false;

    string = string.trim();

    if (email) {
        if (string.length < 1) return false;
        string = escape(string);
        return (emailValidate(string) && string.length >= 4 && string.indexOf("@") > 0 && string.split("@")[1].indexOf(".") > 2 && (string.split(".")[1].length > 1)) ? true : false;
    }

    return (string.length >= 4) ? true : false;
        
}

/** Checks whether the given string is a valid email
 * 
 * @param {String} email 
 * @returns {boolean}
 */
function emailValidate(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}   
//The anonymouse function inside of the ready method will be executed when the current document element is ready to use.
$(document).ready(function () {
    const body = document.getElementById("main-body");
    var autoHeightApplied = false;
    var desktop = (document.getElementById("heading").scrollHeight != 0) ? true : false;

    checkAutoHeight();
    window.addEventListener("resize", checkAutoHeight);

    var desktop = true;

    if (desktop) {
        let form_inputs = document.querySelectorAll("div.form-input-cont > input:not([type='submit']):not([readonly])");

        const submit = document.getElementById("submitBtn");

        for (let elem of form_inputs) {

            elem.addEventListener("focus", (e) => {
                e.target.parentElement.classList.add("focus");
            });

            elem.addEventListener('focusout', (e) => {
                e.target.parentElement.classList.remove("focus")

                if (e.target.value === "") return;
                if (e.target.getAttribute("type") == "email")
                    validate(e.target, true) ? valid(e) : invalid(e);
                else
                    validate(e.target) ? valid(e) : invalid(e);
            });

            elem.addEventListener('input', (e) => {
                if (e.target.value === "") {
                    e.target.parentElement.classList = "form-input-cont focus";
                    hideErrorMsg(e.target);
                }
                    
                else {
                    if (e.target.getAttribute("type") == "email")
                        validate(e.target, true) ?  valid(e) : invalid(e);
                    else
                        validate(e.target) ? valid(e) : invalid(e);
                }
            });
        }

        submit.addEventListener('click', (elem) => {
            form_inputs.forEach(e => {
                if (e.getAttribute("type") == "email")
                {
                    if (!validate(e, true)) {
                        e.parentElement.classList.add('invalid');
                        showErrorMsg(e);
                        elem.preventDefault();
                        return;
                    }
                }
                else {
                    if (!validate(e)) {
                        e.parentElement.classList.add('invalid');
                        showErrorMsg(e);
                        elem.preventDefault();
                        return;
                    }
                }
            });

            if (!validate(document.getElementById("Message"))) {
                elem.preventDefault();
            }
        });
    }

    /**
     * 
     * @param {HTMLElement} elem 
     * @param {String} class1 - from class
     * @param {String} class2 - to class
     */
    function changeClass(elem, class1, class2) {
        if (!elem.classList.contains(class2)) {
            elem.classList.add(class2);
            if (elem.classList.contains(class1)) elem.classList.remove(class1);
        }
    }

    function valid(element) {
        //console.log("valid() called!");
        changeClass(element.target.parentElement, "invalid", "valid");
        hideErrorMsg(element.target);
    }

    function invalid(element) {
        //console.log("invalid() called!");
        changeClass(element.target.parentElement, "valid", "invalid");
        showErrorMsg(element.target);
    }

    /**
     * 
     * @param {HTMLElement} target 
     */
    function showErrorMsg(target) {
        var id = target.getAttribute("name");
        var span = document.querySelector(`span.error.msg[input="${id}"]`);

        $(span).show(100);
        //span.classList.add("display-block");
    }

    /**
     * 
     * @param {HTMLElement} target 
     */
    function hideErrorMsg(target) {
        var id = target.getAttribute("name");
        var span = document.querySelector(`span.error.msg[input="${id}"]`);

        $(span).hide(100);
        //span.classList.remove("display-block");
    }

    /**
     * Checks whether a quickfix of the background is necessary
     */
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
 * @param {HTMLElement} elem 
 * @param {boolean} email 
 * @returns {boolean}
 */
function validate(elem, email = false) {
    var string = elem.value;
    if (!string) return false;

    string = string.trim();

    if (email && string) {
        string = escape(string);
        
        //Removed from the return check, after changing the regex pattern for email validation to RFC 5322 compliant one.
        // && string.length >= 4 && string.indexOf("@") > 0 && string.split("@")[1].indexOf(".") > 2 && (string.split(".")[1].length > 1)
        return emailValidate(string);
    }

    return (string.length >= 4) ? true : false;
        
}

/** Checks whether the given string is a valid email
 * 
 * @param {String} email 
 * @returns {boolean}
 */
function emailValidate(email) {
    //RFC 5322 compliant regex for testing email addresses
    return /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);
    //Old
    //return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function sendMail() {
    try {
        let name = document.getElementById("Name").value;
        let email = document.getElementById("Email").value;
        let subject = document.getElementById("Subject").value;
        let message = document.getElementById("Message").value;
        let mail = document.getElementById("school-email").textContent;


        if (validate(name) && validate(email, true) && validate(subject) && validate(message) && validate(mail, true)) {
            let body = `Dear Galileo School,\r\n\n${message}\r\n\nSincerely,\r\n${name} → ${email}`;
            window.open(`mailto:${mail}?subject=${subject}&body=${encodeURIComponent(body)}`);
            window.location.reload();
        }
        else throw new Error("There was an error while trying to send mail!");
        
    } catch (error) {
        throw error;
    }
}

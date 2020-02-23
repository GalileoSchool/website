$(document).ready(function () {

    //Variables
    var cards = document.getElementsByClassName("card");
    var iscardOpen = false;
    var currentCard;

    // Constants
    const menu = $("#modal-navigation");
    const modal_bckg = $("#modal-background");
    const closeBtn = $("#modal-close");
    const modal_box = $("#modal-box");
    

    for (var tab of menu.children().children()) {
        tab.addEventListener("click", function (e) {
            if (!isCardAlreadyOpened(this.id))
                changeCard(this);
            else
                e.preventDefault();
        });
    }

    $(window).resize(function () { 
        if (!isDesktop()) {
            modal_box.addClass("no-display");
            modal_bckg.addClass("no-display");
            closeBtn.addClass("no-display");
            menu.addClass("no-display");
            $("#interviews-heading").addClass("no-display");
            if (iscardOpen)
                $("body").toggleClass("no-overflow");
            iscardOpen = false;
            currentCard = null;
        }
        else {
            if ($("#interviews-heading").hasClass("no-display"))
                $("#interviews-heading").removeClass("no-display");
        }
            
    });

    console.log(cards);
    for (var card of cards) {
        if (card.id != "modal-box") {
            card.addEventListener("click", function (e) {
                if (isDesktop())
                    cardExpand(this);
                else
                    cardFill();
            });
        }
    };

    closeBtn.click(function (e) { 
        if(iscardOpen)
            cardExpand(e);
        else
            e.preventDefault();
    });

    function changeCard(sender) {
        modal_box.animate({ height: "0px"}, 200).delay(600).animate({ height: "100vh"}, 200);
        setTimeout(() => {
            changeCurrentCardContent(sender)
            setTimeout(() => {
                elementScrollToTop("modal-box");    
            }, 900);
        }, 600);
    }

    function cardFill(e) {
        if (!iscardOpen)
            cardOpen(e);
        else
            cardOpen(null);
    }

    function cardExpand(e) {
        if (!iscardOpen)
            cardOpen(e);
        else
            cardOpen(null);
        $("body").toggleClass("no-overflow");
        menu.toggleClass("no-display");
        modal_bckg.toggleClass("no-display");
        closeBtn.toggleClass("no-display");
        modal_box.toggleClass("no-display");
        elementScrollToTop("modal-box");
        iscardOpen = !iscardOpen;
        if (iscardOpen)
            currentCard = e.id;
        else
            currentCard = null;
        
        if(currentCard && currentCard != null)
            setActiveNavTab(currentCard);
    }

    function elementScrollToTop(id) {
        document.getElementById(id).scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
    }

    function setActiveNavTab(ID) {
        var children = menu.children().children();

        for (var child of children) {
            child.classList.remove("active");
        }

        ID = ID.replace("_menu", "");
        menu.children().children("#" + ID + "_menu").addClass("active");
    }

    function Print(message) {
        console.log(message);
    }

    function changeCurrentCardContent(sender) {
        try {
            var newContent;
            if (sender != null && sender != undefined)
                newContent = document.getElementById(sender.id.replace("_menu", "")).innerHTML;
            else
                newContent = null;
        
            if (newContent && newContent != null && newContent != undefined) 
                modal_box.html(newContent.replace(/no-display/g, ""));
            Print(sender.id);
            setActiveNavTab(sender.id);
        }
        catch(err) {
            console.error("[" + changeCurrentCardContent.name + "] > NullReferenceException: Object reference not set to an instance of an object");            
        }

    }

    function isCardAlreadyOpened(ID) {
        if ($("#" + ID).hasClass("active"))
            return true;
        else
            return false;
    }

    function cardOpen(sender) {
        if (sender != null)
            modal_box.html(sender.innerHTML.replace(/no-display/g, ""));
        else
            modal_box.html(sender);
    }

    /**
     * @description Checks whether the current document dimensions fulfil the requirements to be considered a desktop viewport
     * @returns Boolean
     */
    function isDesktop() {
        if (window.innerWidth >= 670 && window.innerHeight >= 400)
            return true;
        else
            return false;
    }

});
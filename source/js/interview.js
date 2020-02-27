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
                modifyUrl(hashCode(this.id));
                if (isDesktop())
                    cardExpand(this);
                else
                    cardFill();
            });
        }
    };

    closeBtn.click(function (e) { 
        modifyUrl(null);
        if(iscardOpen)
            cardExpand(e);
        else
            e.preventDefault();
    });

    window.onpopstate = function(e){
        checkUrlForRequest();
    };

    checkUrlForRequest();

    function changeCard(sender) {
        modifyUrl(hashCode(sender.id.replace("_menu", "")));
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
        try{
            document.getElementById(id).scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
        }
        catch(err){
            document.getElementById(id).scrollTop = 0;
        }
        
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
            //Print(sender.id);
            setActiveNavTab(sender.id);
        }
        catch(err) {
            console.error("[" + changeCurrentCardContent.name + "] > NullReferenceException: Object reference not set to an instance of an object");     
            console.error(err);       
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

    function hashCode(string) {
        for(var i = 0, h = 0; i < string.length; i++)
            h = Math.imul(31, h) + string.charCodeAt(i) | 0;
    
        return h;
    }

    function checkUrlForRequest() {
        var loadcard = null;
        var url = new URL(window.location.href);
        if(!url.search || url.search == null)
            return;
        var id = url.searchParams.get("id");
        if(id && id != null) {
            for(var card of cards) {
                if(card.id == "modal-box")
                    break;
                
                if(hashCode(card.id) == id)
                    loadcard = card;

                if(hashCode(card.id) == hashCode(id))
                    loadcard = card;

                if(hashCode(card.id.toLowerCase()) == hashCode(id))
                    loadcard = card;
            }

            if(loadcard === null)
                alert(`"${id}" is invalid!`);
            else {
                if(!iscardOpen)
                    document.getElementById(loadcard.id).click();
                else 
                    changeCard(loadcard);
            }
        }
        else
            return;
    }

    function modifyUrl(id) {
        if(window.location.href.indexOf("id=") !== -1)
            var build_url = window.location.href.replace(window.location.href.split("id=")[1], id);
        else
            var build_url = (window.location.href + "?id=" + id);
        
        if(id == null)
            build_url = build_url.split("?")[0];

        history.pushState({
            id: 'interview'
        }, 'GALILEO | INTERVIEWS', build_url);
    }
});
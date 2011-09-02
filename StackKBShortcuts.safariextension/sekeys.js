// ==UserScript==
// @name           SE-Keyboard-Shortcuts
// @namespace      Keyboard shortcuts for StackExchange 
// @description    Keyboard shortcuts
// @include        http://stackoverflow.com/*
// @include        http://*.stackoverflow.com/*
// @include        http://serverfault.com/*
// @include        http://superuser.com/*
// @include        http://meta.stackoverflow.com/*
// @include        http://meta.serverfault.com/*
// @include        http://meta.superuser.com/*
// @include        http://stackapps.com/*
// @include        http://*.stackexchange.com/*
// @include        http://askubuntu.com/*
// @include        http://meta.askubuntu.com/*
// @include        http://answers.onstartups.com/*
// @include        http://meta.answers.onstartups.com/*
// @include        http://mathoverflow.net/*
// @exclude        http://chat.*
// @exclude        http://blog.*
// @author         Benjamin Dumke / Stack Exchange
// ==/UserScript==

// Thanks to Shog9 for this idea for making the script work in both
// Chrome and Firefox: http://meta.stackoverflow.com/questions/46562 (now deleted)

function with_jquery(f) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = "(" + f.toString() + ")(jQuery)";
    document.body.appendChild(script);
};

with_jquery(function($) { $(function () {
    
    var updateMessage;

    if (!(window.StackExchange && StackExchange.helpers && StackExchange.helpers.DelayedReaction))
        return;
    
    // BEGIN of updateable-only code
    
/*    var lsAvailable = false;
    try {
        localStorage.getItem("idonotexist")
    } catch (e) {
        alert("The auto-updating version of the keyboard shortcuts script requires the HTML5 localStorage, which you don't have." +
              " Please activate it, or install the not-updating version instead.");
        return;
    }
    
    var version = 12,
        versionKey = "SEKeyboardShortcutsCurrentVersion",
        updaterKey = "SEKeyboardShortcutsUpdater",
        scriptUrl = "https://bitbucket.org/balpha/se-keyboard-shortcuts/raw/tip/sekeys.updating.user.js",
        updateInterval = 12 * 60 * 60 * 1000; // 12 hours
    if (window[versionKey]) {
        if (window[versionKey] < version) {
            window[updaterKey]();
        }
        return;        
    }

    var lastUpdateCheck = parseInt(setting("lastUpdateCheck")),
        now = new Date().getTime();
    if (!lastUpdateCheck || now - lastUpdateCheck > updateInterval) {
        setting("lastUpdateCheck", now);
        window[versionKey] = version;
        window[updaterKey] = function () {
            setting("updateIsAvailable", true);
            reinit();
            updateMessage = "A new version of the keyboard shortcuts script\nis available. <b><a href=\"" + scriptUrl + "\">Update now</a></b>."
            showConsole(updateMessage);
        }
        $("<script />").attr("src", scriptUrl).appendTo("head");
    }
    if (setting("updateIsAvailable")) {
        updateMessage = "A new version of the keyboard shortcuts script\nis available. <b><a href=\"" + scriptUrl + "\">Update now</a></b>."
    }*/
    
    // END of updateable-only code

    function setting(name, val) {
        var prefix = "se-keyboard-shortcuts.settings.";
        if (arguments.length < 2) {
            try {
                val = localStorage.getItem(prefix + name) ;
                return val === "true" ? true : val === "false" ? false : val;
            } catch (e) {
                return;
            }
        } else {
            try {
                return localStorage.setItem(prefix + name, val);
            } catch (e) {
                return;
            }
        }
    }
    
    var style = ".keyboard-console { background-color: black; background-color: rgba(0, 0, 0, .8); position: fixed; left: 100px; bottom: 100px;" +
                    "padding: 10px; text-align: left; border-radius: 6px; z-index: 1000 }" + // the global inbox has z-index 999
                ".keyboard-console pre { background-color: transparent; color: #ccc; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; line-height:1.5; }" +
                ".keyboard-console pre b, .keyboard-console pre a { color: white !important; }" +
                ".keyboard-console pre kbd { display: inline-block; font-family: monospace; }" +
                ".keyboard-selected { box-shadow: 15px 15px 50px rgba(0, 0, 0, .2) inset; }"
    $("<style type='text/css' />").text(style).appendTo("head");

    function showConsole(text) {
        var cons = $(".keyboard-console pre");
        if (!text.length) {
            cons.parent().hide();
            return;
        }
        
        if (!cons.length) {
            cons = $("<div class='keyboard-console'><pre /></div>").appendTo("body").find("pre");
        }
        text = text.replace(/^!(.*)$/mg, "<b>$1</b>");
        cons.html(text).parent().show();        
    }
    
    function Shortcuts() {
        this.order = []
        this.actions = {}
    }
    
    Shortcuts.prototype.add = function (key, name, action)  {
        if (this.actions[key])
            StackExchange.debug.log("duplicate shortcut " + key);
        this.order.push(key);
        this.actions[key] = action;
        action.name = $("<span />").text(name).html();
    }
    
    function truncate(s) {
        s = $.trim(s);
        if (s.length > 40)
            s = s.substr(0, 37) + "...";
        return s;
    }

    var popupMode = {
        name: "Popup...",
        isApplicable: function () { return $(".popup").length },
        getShortcuts: function () {
            var pane = $(".popup-active-pane"),
                result = new Shortcuts(),
                i = 1, j = 65,
                animated = [];
                
            if (!pane.length)
                pane = $(".popup");
            pane.find(".action-list > li input[type='radio']:visible").each(function () {
                var radio = $(this),
                    li = radio.closest("li"),
                    label = li.find("label span:not(action-desc):first"),
                    subform = li.find(".action-subform");
                    
                result.add("" + i, $.trim(label.text()) || "unknown action", { func: function () { radio.focus().click(); } });
                
                if (subform.length) {
                
                    subform.find("input[type='radio']:visible").each(function () {
                        var jThis = $(this),
                            sublabel = jThis.closest("li").find("label span:first");
                        result.add(String.fromCharCode(j), truncate(sublabel.text() || "other"), { func: function () { jThis.focus().click(); } });
                        j++;
                    });
                    animated.push(subform);                    
                }
                i++;
            });
            if (animated.length) {
                result.animated = $(animated);
            }
            return result;
        }
    }
    
    var inboxMode = {
        name: "Inbox item...",
        isApplicable: function () { return $("#seContainerInbox:visible").length; },
        getShortcuts: function () {
            var choices = $("#seContainerInbox > .itemBox > .siteInfo > p:first-child > a"),
                i, text, url, choice, result
                count = Math.min(choices.length, 9);
            result = new Shortcuts();
            for (i = 0; i < count; i++) {
                choice = choices.eq(i);
                text = truncate(choice.text());
                url = choice.attr("href");
                result.add("" + (i + 1), text, { url: url });
            }
            return result;
        }
    };
    
    var currentMode;
    function getCurrentMode() {
        if (!currentMode)
            return;
        if (!currentMode.isApplicable())
            return;
        return currentMode;
    }
    
    function init() {
    
        var selectable, selectableName,
            shortcuts = new Shortcuts(),
            currentLevel = shortcuts,
            info = {};
            
        selectable = $("#questions .question-summary, #question-mini-list .question-summary, #questions-table .question-summary");
        if (selectable.length)
            info.isQuestionListing = true;
        
        info.isQuestionPage = /^\/questions\/\d+/i.test(location.pathname);
        info.isProfilePage = /^\/users\/\d+/i.test(location.pathname);
        info.mainSiteLink = $("#hlinks-custom a:contains('main')").attr("href");
        info.metaSiteLink = $("#hlinks-custom a:contains('meta')").attr("href");
        
        if (info.isQuestionPage) {
            selectable = $("#question, .answer");
            selectableName = "post";
        } else if (info.isQuestionListing) {
            selectableName = "question";
        }
        
        function toggleAutoHelp() {
            var name = "disableAutoHelp",
                current = setting(name);
            setting(name, !current);
            current = setting(name);
            shortcuts.actions.H.name = (current ? "en" : "dis") + "able auto help";
            resetDelayed = StackExchange.helpers.DelayedReaction(reset, current ? 2000 : 5000, { sliding: true })
        }
        
        function buildShortcuts() {
            var G = new Shortcuts();
            
            shortcuts.add("G", "go to", { next: G });
            if (selectableName) {
                shortcuts.add("U", "select " + (info.isQuestionPage ? "question" : "first " + selectableName), {
                    func: function () { select(0, false, false, false, true); }                    
                });
                shortcuts.add("J", "select next " + selectableName, { func: function () { select(1, false); } });
                shortcuts.add("K", "select prev " + selectableName, { func: function () { select(-1, false); } });
            }
            
            if (info.isQuestionListing) {
                shortcuts.add("Enter", "go to selected question", { link: ".keyboard-selected.question-summary a.question-hyperlink" });
                G.add("S", "selected question", { link: ".keyboard-selected.question-summary a.question-hyperlink" });
            }

            G.add("H", "home page", { url: "/"});
            G.add("Q", "questions", { url: "/questions"});
            G.add("A", "ask question", { link: "#nav-askquestion[href]" }); // it's not a real link on the ask page itself, so don't offer the shortcut there
            G.add("P", "my profile", { link: ".profile-link" });
            if (info.mainSiteLink)
                G.add("M", "main site", { url: info.mainSiteLink });
            else if (info.metaSiteLink)
                G.add("M", "meta site", { url: info.metaSiteLink });
            G.add("C", "chat", { link: "#footer-menu a:contains('chat')" });

            
            if (info.isQuestionPage)
                buildQuestionPageShortcuts();
            else if (info.isProfilePage) {
                G.add("T", "tab", { next: getOrderShortcuts("#tabs") });
                if (info.isQuestionListing)
                    shortcuts.add("O", "order questions by", { next: getOrderShortcuts("#tabs-question-user") })
            }
            else if (info.isQuestionListing)
                shortcuts.add("O", "order questions by", { next: getOrderShortcuts("#tabs") });
                
            G.add("F", "faq", { url: "/faq" });

            shortcuts.add("I", "inbox", { func: beginInbox, noReset: true, initiatesMode: inboxMode });
            shortcuts.add("R", "recent activity popup", {
                onlyIf: "#hlinks-user > .profile-triangle",
                func: function () { $("#hlinks-user > .profile-triangle").click(); animateScrollTo(0); }
            });
            shortcuts.add("S", "search", { func: function () { $("#search input").focus(); } });    
            var P = new getPagerShortcuts(info.isQuestionPage ? ".pager-answers" : ".pager:first");
            shortcuts.add("P", "page", { next: P });
            shortcuts.add("?", "help", {
                func: function () {
                    if ($(".keyboard-console").is(":visible")) {
                        reset();
                        return;
                    }
                    var s = "Keyboard shortcuts:";
                    if (updateMessage)
                        s = updateMessage + "\n" + s;
                    showHelp(s);
                },
                noReset: true,
                unimportant: true
            });
            shortcuts.add("H", (setting("disableAutoHelp") ? "en" : "dis") + "able auto help", { func: toggleAutoHelp, unimportant: true } );
        }
        
        function getPagerShortcuts(pagerSelector) {
            var result = new Shortcuts();
            result.add("F", "first page", { clickOrLink: pagerSelector + " a[title='go to page 1']" });
            result.add("P", "previous page", { clickOrLink: pagerSelector + " a[rel='prev']" });
            result.add("N", "next page", { clickOrLink: pagerSelector + " a[rel='next']" });
            result.add("L", "last page", { clickOrLink: pagerSelector + " .current ~ a:not([rel='next']):last" });
            return result;
        }
    
        var sortOrderShortcuts = { featured: "B", bugs: "G" };
        function getOrderShortcuts(selector) {
            var result = new Shortcuts();
            $(selector + " > a").each(function (i, elem) {
                var text = $(elem).text().replace(/^\s*\d+/, ""),
                    s = sortOrderShortcuts[text]; // TODO: This check needs to be made earlier, before looping. Otherwise, you may get double entries.
                    
                if (!s) {
                    s = text.replace(/[^a-z]/ig, "").toUpperCase();
                    
                    while (s.length && result.actions[s.charAt(0)])
                        s = s.substr(1);
                    
                    if (!s.length) {
                        StackExchange.debug.log("no suitable shortcut for sort order " + text);
                        return;
                    }
                }
                result.add(s.charAt(0), text, { clickOrLink: elem });
            });
            return result;
    
        }
        
        function selectedPostId() {
            var post = $(".keyboard-selected");
            if (post.is("#question")) {
                return parseInt(location.pathname.replace(/^\/questions\/(\d+)\/.*$/, "$1"));
            } else if (post.is(".answer")) {
                return parseInt(post.attr("id").replace("answer-", ""));
            } else {
                return null;
            }
        }
        
        function beginInbox() {
            if (!$("#seWrapper").length) {
                if ($("#portalLink .unreadCount").length)
                    expectAjax(/\/inbox\/genuwine/, false).done(reset); // if there's a red number, the click goes directly to the inbox
                else
                    expectAjax(/stackexchange\.com\/genuwine/, true).done(assertInbox)
                
                $("#portalLink a.genu").click();
            } else {
                if (!$("#seWrapper").is(":visible"))
                    $("#portalLink a.genu").click();
                assertInbox();
            }
            animateScrollTo(0);
        }
        
        function assertInbox() {
            var def;
            if (!$("#seContainerInbox").length)
                def = expectAjax(/\/inbox\/genuwine/);
            else
                def = $.Deferred().resolve().promise();
            $("#seTabInbox").click(); // Make sure it's the active tab. This is a no-op if it already is.
            def.done(reset); // will detect inbox mode
        }
        
        function buildQuestionPageShortcuts() {
            var V = new Shortcuts();
            shortcuts.add("V", "vote", { next: V, autoSelect: true });
            V.add("U", "up", { click: ".keyboard-selected .vote-up-off" });
            V.add("D", "down", { click: ".keyboard-selected .vote-down-off" });
            shortcuts.add("A", "answer", {
                func: function () {
                    var input = $("#wmd-input:visible");
                    if (input.length)
                        input.focus();
                    else {
                        $("#show-editor-button input").click();
                        setTimeout(function () { $("#wmd-input:visible").focus(); }, 0); // if the user clicked "Ok" in the confirmation dialog, focus the input
                    }
                },
                onlyIf: "#wmd-input"
            });
            
            if ($(".edit-post").length) // inline editing
                shortcuts.add("E", "edit", { click: ".keyboard-selected .edit-post", autoSelect: true });
            else
                shortcuts.add("E", "edit", { link: ".keyboard-selected .post-menu a[href$='/edit']", autoSelect: true });
                
            if ($("#edit-tags").length) // inline retagging
                shortcuts.add("T", "retag", { click: "#edit-tags" });
            else
                shortcuts.add("T", "retag", { link: "#question .post-menu a[href$='?tagsonly=true']" });
                
            shortcuts.add("C", "add/show comments", { click: ".keyboard-selected .comments-link", autoSelect: true });
            var M = new Shortcuts();
            shortcuts.add("M", "moderate", { next: M, autoSelect: true });
            M.add("F", "flag", { click: ".keyboard-selected a[id^='flag-post-']", initiatesMode: popupMode });
            M.add("C", "close", { click: ".keyboard-selected a[id^='close-question-']", initiatesMode: popupMode });
            M.add("D", "delete", { click: ".keyboard-selected a[id^='delete-post-']" });
            M.add("E", "suggested edit", { click: ".keyboard-selected a[id^='edit-pending-']" });
            M.add("M", "moderation tools", { click: ".keyboard-selected a.post-moderator-link", initiatesMode: popupMode });
            shortcuts.actions.G.next.add("O", "post owner's profile", { link: ".keyboard-selected .post-signature:last .user-details a[href^='/users/']" });
            shortcuts.actions.G.next.add("R", "post revisions", {
                func: function () { location.href = "/posts/" + selectedPostId() + "/revisions"; },
                onlyIf: ".keyboard-selected"
            });
            shortcuts.add("O", "order answers by", { next: getOrderShortcuts("#tabs") });
        }
        
        function actionIsAvailable(action) {
    
            var onlyIf, o;
            
            if (action.hasOwnProperty("onlyIf")) {
                onlyIf = action.onlyIf;
            } else {
                if (action.autoSelect && !$(".keyboard-selected").length) {
                    select(1, false, true, true); //TODO: an options object may be in order...
                    setTimeout(function () { $(".keyboard-selected").removeClass("keyboard-selected"); }, 0);
                }
                if (action.clickOrLink)
                    onlyIf = function () { return $(action.clickOrLink).length; };
                else
                    onlyIf = action.link || action.click
            }
                
            if (onlyIf) {    
                o = onlyIf;
                if (typeof onlyIf === "string")
                    onlyIf = function () { return $(o).length };
                else if (typeof onlyIf !== "function")
                    onlyIf = function () { return o; };
            }
            
            if (onlyIf && !onlyIf())
                return false;
            
            if (action.next) {
                for (var i = 0; i < action.next.order.length; i++) {
                    if (actionIsAvailable(action.next.actions[action.next.order[i]])) {
                        return true;
                    }
                }
                return false;
            }
            
            return true;       
        }
        
        var scroller = {};

        var animateScrollTo = function (target) {
            var jWin = $(window);
            scroller.pos = jWin.scrollTop();
            $(scroller).stop().animate({pos: target}, {
                duration: 200,
                step: function () { jWin.scrollTop(this.pos) },
                complete: function () { jWin.scrollTop(target); }
            });
        }

        
        function select(delta, visibleOnly, onlyIfNothingYet, tempOnly, absolute) {
            if (!selectable || !selectable.length)
                return;
    
            var jWin = $(window),
                windowTop = jWin.scrollTop(),
                windowHeight = jWin.height(),
                windowBottom = windowTop + windowHeight,
                visibleChoices, choices,
                currentIndex, nextIndex,
                selected = $(".keyboard-selected"),
                newSelected,
                above, below, spaceFactor,
                cycling = visibleOnly,
                newTop, newHeight, newScroll;

            if (selected.length && onlyIfNothingYet)
                return;

            if (visibleOnly || (!selected.length && !absolute)) {
                visibleChoices = selectable.filter(function () {
                    var jThis = $(this),
                        thisTop = jThis.offset().top,
                        thisHeight = jThis.height(),
                        thisBottom = thisTop + thisHeight,
                        intersection = Math.max(0, Math.min(thisBottom, windowBottom) - Math.max(thisTop, windowTop));
                    
                    if (intersection >= 50)
                        return true;

                    if (intersection / thisHeight >= .5) // more than half of this is visible
                        return true;
                    
                    // Note that at this point, we've deemed the element invisble.
                    // Remember the closest selectable item above and below, in case we need them.
                    if (thisTop < windowTop)
                        above = jThis;
                    else if (thisBottom > windowBottom && !below)
                        below = jThis;
                    return false;
                });
            }

            choices = visibleOnly ? visibleChoices : selectable;
            if (absolute) {
                newSelected = choices.eq(delta);
            } else if (selected.length) {
                currentIndex = choices.index(selected);
                if (currentIndex === -1 && delta < 0)
                    currentIndex = 0;
                if (cycling)
                    nextIndex = (currentIndex + delta + choices.length) % choices.length;
                else
                    nextIndex = Math.max(0, Math.min(currentIndex + delta, choices.length - 1));
                newSelected = choices.eq(nextIndex);
            } else {
                if (visibleChoices.length)
                    newSelected = delta < 0 ? visibleChoices.last() : visibleChoices.first();
                else if (!visibleOnly) // forcibly pick one if we're not in visibleOnly mode
                    newSelected = delta < 0 ? above || below : below || above;
            }

            if (!(newSelected && newSelected.length))
                return;
            
            selected.removeClass("keyboard-selected");
            newSelected.addClass("keyboard-selected")
            
            // adjust scrolling position
            if (!tempOnly && !visibleOnly) {

                newTop = newSelected.offset().top;
                newHeight = newSelected.height();
                
                if (newTop >= windowTop && newTop + newHeight < windowBottom) // fully visible -- all is well
                    return;
                
                if (newHeight > windowHeight) { // too large to fit the screen -- show as much as possible
                    animateScrollTo(newTop);
                    return;
                }
                
                spaceFactor = Math.max(.9, newHeight / windowHeight);
                
                if (delta < 0) // going upwards; put the bottom at 10% from the window bottom
                    newScroll = newTop + newHeight - spaceFactor * windowHeight;
                else // going downwards; put the top at 15% from the window top
                    newScroll = newTop - (1 - spaceFactor) * windowHeight;
                
                animateScrollTo(newScroll);
            }
            
        }
        
        function showHelp(title) {
            var s = title + "\n",
                anyAutoSel = false,
                hasSel = $(".keyboard-selected").length,
                key, action;
            for (var i = 0; i < currentLevel.order.length; i++) {
                key = currentLevel.order[i];
                action = currentLevel.actions[key];
                if (!actionIsAvailable(action))
                    continue;
                
                s += (action.unimportant ? "" : "!") + "<kbd>" + key + "</kbd> " + action.name;
                
                if (!hasSel && action.autoSelect) {
                    s += "*";
                    anyAutoSel = true;
                }
                if (action.next)
                    s += "...";
                s += "\n";
            }
            if (!currentLevel.order.length)
                s += "(no shortcuts available)"
            if (anyAutoSel)
                s += "*auto-selects if nothing is selected"
            showConsole(s)
        }
        
        function checkAnimation(jElem) {
            jElem.each(function () {
                var jThis = $(this),
                    queue = jThis.queue("fx");
                if (queue && queue.length)
                jThis.queue("fx", function (next) {
                    setTimeout(reset, 0);
                    next();
                });
            });
        }
        
        function resetMode() {
            currentMode = null;
        }
        
        function resetModeIfNotApplicable() {
            if (currentMode && ! currentMode.isApplicable())
                resetMode();
        }
        
        function resetToDefault() {
            currentLevel = shortcuts;
            showConsole("");
            resetDelayed.cancel();
        }
        
        function reset() {
            var mode = getCurrentMode();
            if (!mode) {
                resetToDefault();
                return;
            }
            currentLevel = mode.getShortcuts();
            if (!setting("disableAutoHelp"))
                showHelp(mode.name);
            resetDelayed.cancel();
            if (currentLevel.animated)
                checkAnimation(currentLevel.animated);
        }
        
        var resetDelayed = StackExchange.helpers.DelayedReaction(reset, setting("disableAutoHelp") ? 2000 : 5000, { sliding: true });
    
        function keyDescription(code) {
            if (code === 13)
                return "Enter";
            
            return String.fromCharCode(code).toUpperCase();
        }
        
        var handleResults = {
            notHandled: 0,
            handled: 1,
            handledNoReset: 2,
            handledResetNow: 3
        }
        
        function goToPage(url, newTab) {
            if (newTab)
                window.open(url);
            else
                location.href = url;
        }
        
        function handleKey(evt) {
            if (evt.ctrlKey || evt.altKey || evt.metaKey)
                return handleResults.notHandled;
            
            if ($(evt.target).is("textarea, input[type='text']"))
                return handleResults.notHandled;
            
            var action = currentLevel.actions[keyDescription(evt.which)],
                onlyIf;
    
            if (!action) {
                return handleResults.notHandled;
            }
            
            var handled = action.noReset ? handleResults.handledNoReset :
                action.next ? handleResults.handled : handleResults.handledResetNow;
            
            if (action.autoSelect)
                select(1, true, true);
    
            if (!actionIsAvailable(action)) {
                return handleResults.notHandled;
            }
            
            if (action.initiatesMode) {
                currentMode = action.initiatesMode;
            }
            
            var link = action.url || $(action.link).attr("href");
            
            if (link) {
                goToPage(link, evt.shiftKey)
                return handled;
            }
            
            if (action.click) {
                $(action.click).click();
                return handled;
            }
            
            if (action.clickOrLink) {
                var jElem = $(action.clickOrLink),
                    evData = jElem.data("events"),
                    doClick = false;
                if (evData && evData.click && evData.click.length) // click handler bound?
                    doClick = true;
                else {
                    evData = $(document).data("events"); // live handler bound? (note that the generic delegate case is *not* checked)                
                    if (evData && evData.click) {
                        for (var i = 0; i < evData.click.length; i++) {
                            var sel = evData.click[i].selector;
                            if (sel && jElem.is(sel)) {
                                doClick = true;
                                break;
                            }
                        }
                    }
                }
                if (doClick)
                    jElem.click();
                else
                    goToPage(jElem.attr("href"), evt.shiftKey)
                return handled;
            }
            
            if (action.next) {
                var title = action.name + "...";
                currentLevel = action.next;
                if (!setting("disableAutoHelp"))
                    showHelp(title);
                
                return handled;
            }
            
            if (action.func) {
                action.func();
                return handled;
            }
            
            StackExchange.debug.log("action found, but nothing to do")
        }
        
        var keyHappening = false;
        
        var keydown = function () { keyHappening = true; };
        
        var keyup = function (e) {
            if (e.which === 27) {
                resetMode();
                resetToDefault();
            }
            else if (keyHappening) // didn't generate a keypress event
                reset();
            keyHappening = false;
        };
        
        var keypress = function (evt) {
            keyHappening = false;
            var result = handleKey(evt);
            switch(result) {
                case handleResults.notHandled:
                    resetModeIfNotApplicable();
                    reset();
                    return true;
                case handleResults.handled:
                    resetDelayed.trigger();
                    return false;
                case handleResults.handledResetNow:
                    reset();
                    return false;
                case handleResults.handledNoReset:
                    resetDelayed.cancel();
                    return false;
            }
        };

        var click = function (evt) {
            if (typeof evt.which === "undefined") // not a real click;
                return;
            resetMode();
            reset();
        }
        
        $(document).keydown(keydown);
        $(document).keyup(keyup);
        $(document).keypress(keypress);
        $(document).click(click);
        
        buildShortcuts();
    
        reset();
        
        return {
            cancel: function () {
                $(document).unbind("keydown", keydown);
                $(document).unbind("keyup", keyup)
                $(document).unbind("keypress", keypress)
                $(document).unbind("click", click)
            },
            reset: reset
        };
    }
    
    var expected = [];
    
    function expectAjax(urlRe, crossDomain) {
        var result = $.Deferred();
        var data = { re: urlRe, deferred: result, crossDomain: crossDomain };
        if (crossDomain) {
            // hack: jQuery doesn't fire ajaxComplete on crossdomain requests, so we gotta cheat
            var prevScripts = $("head > script");
            setTimeout(function () {
                var nowScripts = $("head > script");
                if (nowScripts.length !== prevScripts.length + 1) { // currently this is fine, since our only use case only loads one
                    StackExchange.debug.log("I'm confused: " + nowScripts.length + "!=" + prevScripts.length +"+1" );
                    return;
                }
                var script = nowScripts.eq(0); // jQuery uses insertBefore
                if (!urlRe.test(script.attr("src"))) {
                    StackExchange.debug.log("I'm even more confused");
                    return;
                }
                script.load(function () { result.resolve(); });
            },0)
        } else {
            expected.push(data);
        }
        return result.promise();
    }
    function checkExpected(url) {
        var newExpected = [],
            i, result = false;
        for (i = 0; i < expected.length; i++) {
            var exp = expected[i];
            if (exp.re.test(url)) {
                exp.deferred.resolve();
                result = true;
            } else {
                newExpected.push(exp);
            }
        }
        expected = newExpected;
        return result;
    }
    
    function ajaxNeedsReinit(url) {
        return /users\/stats\/(questions|answers)/.test(url);
    }
    function ajaxNeedsNoReset(url) {
        return /mini-profiler-results|users\/login\/global|\.js/.test(url)
    }

    var state = init();
    $(document).ajaxComplete(function (evt, xhr, settings) {
        if (!checkExpected(settings.url)) {
            if (ajaxNeedsReinit(settings.url))
                reinit();
            else if (!ajaxNeedsNoReset(settings.url))
                state.reset();
        }
    })
    
    function reinit() {
        state.cancel();
        state = init();
    }

}); });
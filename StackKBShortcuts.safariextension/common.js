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


var added = false;

function addJS(jsFile) {
	if ((jsFile == null)||(added==true)) {
		return;
	}
	added=true;
	var heads = document.getElementsByTagName("head");
	jsFile = safari.extension.baseURI + jsFile;
	var jsnode = document.createElement("script");
	jsnode.type = "text/javascript";
	jsnode.rel = 'script';
	jsnode.src = jsFile;
	heads[0].appendChild(jsnode);
	return;
}
var wL = window.location.href;
if ((added==false)&&(wL.match('http://chat.[^ ]*')== null)&&(wL.match('http://blog.[^ ]*') == null)) {
	addJS('sekeys.js');
} 

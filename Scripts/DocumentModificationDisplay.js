// ==UserScript==
// @name         Document Modification Display
// @namespace    http://tampermonkey.net/
// @version      0.4.1
// @updateURL    https://raw.githubusercontent.com/Airistotal/UserScripts/main/Scripts/DocumentModificationDisplay.js
// @downloadURL  https://raw.githubusercontent.com/Airistotal/UserScripts/main/Scripts/DocumentModificationDisplay.js
// @description  Shows when the document was last modified
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    buildAndAddModificationDisplay();
})();

function buildAndAddModificationDisplay() {
    var modification_display = createModificationContainer();

    addLastModified(modification_display);
    addSitemapXml(modification_display);

    var body = document.getElementsByTagName("BODY")[0];
    body.appendChild(modification_display);
}

function createModificationContainer() {
    var modification_display = document.createElement("div");
    modification_display.setAttribute("class", "modification-container");
    var css = "position: fixed;bottom: -3px;left: -3px;padding: 5px;border: solid grey;border-radius: 3px;background-color: lightgray;z-index:1001;color:grey!important;";
    modification_display.setAttribute("style", css);

    return modification_display;
}

function addLastModified(container) {
    var last_modified_container = document.createElement("div");
    var last_modfied_text = getLastModifiedText();
    var last_modified_content = document.createTextNode(last_modfied_text);
    last_modified_container.appendChild(last_modified_content);
    
    if (last_modfied_text.indexOf("Now") !== -1) {
        addHintToLastModified(last_modified_container);
    }

    container.appendChild(last_modified_container);
}

function getLastModifiedText() {
    var now = Date.now();
    var lastModifiedDate = Date.parse(document.lastModified);
    var secondsSinceModified = (now - lastModifiedDate) / 1000;
    var lastModifiedData = secondsSinceModified > 3 ? document.lastModified : "Now";

    return 'Last Modified: ' + lastModifiedData;
}

function addHintToLastModified(container) {
    var css_show = "display: block;background: #C8C8C8;margin-left: 28px;padding: 5px;position: fixed;z-index: 1000;width: 183px;left: 95px;bottom: 43px;border: darkgrey dotted;font-size:12px;text-align:center;";
    var css_hide = "display: none";

    var tooltip = document.createElement("div");
    tooltip.setAttribute("id", "now-hint-tooltip");
    tooltip.setAttribute("style", css_hide);
    tooltip.appendChild(document.createTextNode("This is likely a dynamic page."));

    var hintHoverable = document.createElement("sup");
    hintHoverable.setAttribute("style", "margin-left: 3px;cursor: help;");
    hintHoverable.appendChild(document.createTextNode("?"));
    hintHoverable.appendChild(tooltip);

    hintHoverable.addEventListener("mouseenter", function(event) {
        var tooltip = document.getElementById("now-hint-tooltip");
        tooltip.setAttribute("style", css_show);
    });

    hintHoverable.addEventListener("mouseleave", function(event) {
        var tooltip = document.getElementById("now-hint-tooltip");
        tooltip.setAttribute("style", css_hide);
    });

    container.appendChild(hintHoverable);
}

var sitemap_loaded = false;

function addSitemapXml(container) {
    var getUrl = window.location;
    var sitemapUrl = getUrl.protocol + "//" + getUrl.host + "/sitemap.xml";

    var sitemap_container = document.createElement("div");
    animateSitemapLoad(sitemap_container, 1, 0);
    container.append(sitemap_container);

    checkIfSitemapExists(
        sitemapUrl,
        function() {
            addSitemapXmlSuccess(sitemap_container, sitemapUrl);
        },
        function() {
            addSitemapXmlFailure(sitemap_container);
        });
}

function addSitemapXmlSuccess(container, url) {
    var sitemap_link = document.createElement("a");
    sitemap_link.setAttribute("href", url);
    sitemap_link.setAttribute("target", "_blank");
    sitemap_link.setAttribute("style", "color: green!important;text-decoration: underline;");

    var sitemap_text = document.createTextNode("Sitemap");
    sitemap_link.appendChild(sitemap_text);

    container.innerHTML = '';
    container.appendChild(sitemap_link);
}

function addSitemapXmlFailure(container) {
    var sitemap_link = document.createElement("a");
    sitemap_link.setAttribute("style", "color: red!important;text-decoration: underline;text-decoration-style: dotted;");

    var sitemap_text = document.createTextNode("Sitemap not found");
    sitemap_link.appendChild(sitemap_text);

    container.innerHTML = '';
    container.appendChild(sitemap_link);
}

function animateSitemapLoad(sitemap_container, direction, iteration) {
    sitemap_container.innerHTML = "";
    sitemap_container.appendChild(
        document.createTextNode(
            getLoadingMessageForFrame(iteration)));
    sitemap_container.setAttribute("style", "color: darkgrey!important;");

    iteration += direction;
    if (iteration === 3) {
        direction = -1;
    } else if (iteration === 0) {
        direction = 1;
    }

    setTimeout(function () {
        if (!sitemap_loaded) {
            animateSitemapLoad(sitemap_container, direction, iteration);
        }
    }, 250);
}

function getLoadingMessageForFrame(numDots) {
    var msg = "Loading";

    for (var i = 0; i < numDots; i++) {
        msg += ".";
    }

    return msg;
}

function checkIfSitemapExists(url, success, failure) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 302)) {
            sitemap_loaded = true;
            success();
        } else if (this.readyState == 4) {
            sitemap_loaded = true;
            failure();
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

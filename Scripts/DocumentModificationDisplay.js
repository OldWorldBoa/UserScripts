// ==UserScript==
// @name         Document Modification Display
// @namespace    http://tampermonkey.net/
// @version      0.3
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
    var css = "position: fixed;bottom: -3px;left: -3px;padding: 5px;border: solid grey;border-radius: 3px;background-color: lightgray;z-index:1001;";
    modification_display.setAttribute("style", css);

    return modification_display;
}

function addLastModified(container) {
    var last_modified_container = document.createElement("div");
    var last_modified_content = document.createTextNode(document.lastModified);
    last_modified_container.appendChild(last_modified_content);
    container.appendChild(last_modified_container);
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
            var sitemap_link = document.createElement("a");
            sitemap_link.setAttribute("href", sitemapUrl);
            sitemap_link.setAttribute("target", "_blank");
            sitemap_link.setAttribute("style", "color: green!important;text-decoration: underline;");

            var sitemap_text = document.createTextNode("Sitemap");
            sitemap_link.appendChild(sitemap_text);

            sitemap_container.innerHTML = '';
            sitemap_container.appendChild(sitemap_link);
        },
        function() {
            var sitemap_link = document.createElement("a");
            sitemap_link.setAttribute("style", "color: red!important;text-decoration: underline;text-decoration-style: dotted;");

            var sitemap_text = document.createTextNode("Sitemap not found");
            sitemap_link.appendChild(sitemap_text);

            sitemap_container.innerHTML = '';
            sitemap_container.appendChild(sitemap_link);
        });
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

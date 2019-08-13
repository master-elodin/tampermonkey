// ==UserScript==
// @name         Bitbucket Show All Branches
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Bitbucket should show all branches by default, rather than only "active" branches
// @author       Tim VanDoren
// @match        https://bitbucket.org/*/branches/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let currentUrl = window.location.href;
    if(currentUrl.indexOf('?status=all') < 0) {
        if(currentUrl.indexOf('?') === -1) {
            currentUrl += '?';
        }
        currentUrl += 'status=all';

        window.location.href = currentUrl;
    }
})();
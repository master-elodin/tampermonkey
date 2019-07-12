// ==UserScript==
// @name         Add PR Numbers
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Add numbers to the main Bitbucket page to show code review overviews
// @author       Tim VanDoren
// @match        https://bitbucket.org/taedge/sol/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const currentUser = JSON.parse(jQuery('meta[id="bb-bootstrap"]').attr('data-current-user'));

    class PullRequest {
        constructor(props) {
            Object.assign(this, props);

            this.isApproved = props.reviewers.filter(reviewer => reviewer.approved).length >= 2;
        }
    }

    const updateNumbers = () => {
        jQuery.ajax('https://bitbucket.org/!api/2.0/repositories/taedge/sol/pullrequests?pagelen=25&fields=%2Bvalues.participants&q=state%3D%22OPEN%22&page=1').then(data => {
            const allPrs = data.values.map(pr => new PullRequest({
                name: pr.title,
                source: pr.source.branch.name,
                dest: pr.destination.branch.name,
                creator: pr.author.display_name,
                reviewers: pr.participants
            }));
            console.log('all PRs', allPrs);

            const myCreatedPrs = allPrs.slice().filter(pr => pr.creator === currentUser.displayName);
            const myApprovedPrs = myCreatedPrs.slice().filter(pr => pr.isApproved);
            const myPrsToReview = allPrs.slice()
                .filter(pr => myCreatedPrs.indexOf(pr) < 0)
                .filter(pr => pr.reviewers
                    .filter(reviewer => !reviewer.approved && reviewer.user.display_name === currentUser.displayName).length
                );

            const createNumberEl = (reviews, title, color) => {
                if(reviews.length) {
                    return jQuery(`<div title="${title}">${reviews.length}</div>`)
                        .css('background-color', color)
                        .css('padding', '3px 7px')
                        .css('color', 'white')
                        .css('border-radius', '15px')
                        .css('font-weight', 'bold')
                        .css('margin-left', '2px')
                        .css('width', '10px')
                        .css('margin-left', '2px')
                        .css('text-align', 'center');
                } else {
                    return '';
                }
            };

            const prLinkAdditions = jQuery('<div id="pr-numbers" style="position: absolute; right: 5px; display: flex; font-family: monospace;"></div>');
            prLinkAdditions.append(createNumberEl(myPrsToReview, 'I need to review', 'red'));
            prLinkAdditions.append(createNumberEl(myApprovedPrs, 'I need to merge', 'green'));
            prLinkAdditions.append(createNumberEl(myCreatedPrs, 'My PRs for others to review', 'blue'));

            let prLocation = jQuery('a[href="/taedge/sol/pull-requests/"]');
            if(prLocation.length > 1) {
                prLocation = jQuery(prLocation.filter((i, loc) => jQuery(loc).attr('role') === 'button')[0]);
            }
            prLocation.remove('#pr-numbers');
            prLocation.append(prLinkAdditions);
        });
    }
    updateNumbers();
    jQuery('.approve-button').on('click', () => setTimeout(() => updateNumbers(), 1000));
})();

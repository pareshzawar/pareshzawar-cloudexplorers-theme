/* Cloud Explorers behaviour layer.
   Everything that can be rendered by the templates is; this file only handles what needs the browser:
   1. theme toggle, 2. collapsible side panel, 3. "copy link" button, 4. post table of contents.
   It is bundled into assets/built/source.js together with Source's own scripts. */
(function () {
    'use strict';

    /* localStorage can throw (private mode, blocked storage); these wrappers make that harmless. */
    function load(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function save(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* not saved; still works for this page view */ }
    }

    /* 1. Theme toggle: flips between the two palettes and remembers the visitor's choice.
       The initial palette is set by the inline script in default.hbs before the page paints. */
    function initThemeToggle() {
        var button = document.querySelector('.ce-theme-toggle');
        if (!button) return;
        var root = document.documentElement;
        button.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'terminal' : 'light';
            root.setAttribute('data-theme', next);
            // Source keys its own text colours off these two classes
            root.className = next === 'light' ? 'has-dark-text' : 'has-light-text';
            save('ce-theme', next);
        });
    }

    /* 2. Left side panel: the tab slides it out of the way; the state survives page loads. */
    function initSidePanel() {
        var panel = document.querySelector('.ce-side-panel');
        if (!panel) return;
        var tab = panel.querySelector('.ce-side-tab');

        function setCollapsed(collapsed) {
            panel.classList.toggle('is-collapsed', collapsed);
            tab.textContent = collapsed ? '›' : '‹';
            tab.setAttribute('aria-expanded', String(!collapsed));
            tab.setAttribute('aria-label', collapsed ? 'Show social links' : 'Hide social links');
        }

        setCollapsed(load('ce-panel') === 'out');
        tab.addEventListener('click', function () {
            var collapsed = !panel.classList.contains('is-collapsed');
            setCollapsed(collapsed);
            save('ce-panel', collapsed ? 'out' : 'in');
        });
    }

    /* 3. "Copy link" buttons in the share rows. Shows a short confirmation on the button itself. */
    function initCopyLinks() {
        document.querySelectorAll('.ce-copy-link').forEach(function (button) {
            button.addEventListener('click', function () {
                if (!navigator.clipboard) return; // only very old browsers lack this; other share buttons still work
                navigator.clipboard.writeText(button.dataset.url).then(function () {
                    button.classList.add('is-copied');
                    button.setAttribute('aria-label', 'Link copied');
                    setTimeout(function () {
                        button.classList.remove('is-copied');
                        button.setAttribute('aria-label', 'Copy link');
                    }, 2000);
                });
            });
        });
    }

    /* 4. Table of contents for posts: one link per h2/h3, highlighting the section being read.
       Ghost already gives every heading an id, so the links are ordinary #anchors (smooth scrolling
       comes from CSS scroll-behavior). Posts with fewer than two headings get no TOC. */
    function initToc() {
        var toc = document.querySelector('.ce-toc');
        var content = document.querySelector('.ce-post-layout .gh-content');
        if (!toc || !content) return;

        var headings = Array.prototype.filter.call(content.querySelectorAll('h2, h3'), function (h) {
            return h.id; // skip headings without an anchor (e.g. inside some embed cards)
        });
        if (headings.length < 2) return;

        var links = headings.map(function (heading) {
            var link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent.trim();
            if (heading.tagName === 'H3') link.className = 'is-sub';
            toc.appendChild(link);
            return link;
        });
        toc.hidden = false;

        // Mark the link for whichever heading most recently crossed the top part of the screen
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (link) {
                    link.classList.toggle('is-active', link.hash === '#' + entry.target.id);
                });
            });
        }, {rootMargin: '-80px 0px -55% 0px'});
        headings.forEach(function (heading) { observer.observe(heading); });
    }

    function init() {
        initThemeToggle();
        initSidePanel();
        initCopyLinks();
        initToc();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

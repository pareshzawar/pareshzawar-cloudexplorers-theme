/* Cloud Explorers ("Notebook" design) behaviour.
   Templates render everything they can; this file only adds what needs the browser:
   1. light/dark toggle          4. code blocks: header, line numbers, copy, string tint
   2. "On this page" contents    5. series list: mark the post being read
   3. reading progress bar       6. "/" opens search
   Bundled into assets/built/source.js together with Source's scripts. */
(function () {
    'use strict';

    /* localStorage can throw (private mode, blocked storage); these wrappers make that harmless */
    function save(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* not saved; still works on this page */ }
    }

    /* 1. Light/dark toggle. The first theme is set in default.hbs before the page paints. */
    function initThemeToggle() {
        var button = document.querySelector('.ce-theme-toggle');
        if (!button) return;
        var root = document.documentElement;
        button.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            root.className = next === 'dark' ? 'has-light-text' : 'has-dark-text'; // Source's own colour switch
            save('ce-theme', next);
        });
    }

    /* 2. "On this page": one link per h2 in the post, highlighting the section being read.
       Also numbers the h2s (01, 02 ...) unless the author already numbered them. */
    function initToc() {
        var box = document.querySelector('.ce-toc');
        var content = document.querySelector('.post-template .ce-content');
        if (!content) return;

        var headings = Array.prototype.filter.call(content.querySelectorAll(':scope > h2'), function (h) {
            return h.id; // Ghost gives headings an id; skip any without one
        });

        // Number sections only when none of the headings starts with a number already
        var alreadyNumbered = headings.some(function (h) { return /^\s*\d/.test(h.textContent); });
        if (!alreadyNumbered) content.classList.add('is-numbered');

        if (!box || headings.length < 2) return;
        var list = box.querySelector('.ce-toc-links');
        var links = headings.map(function (heading) {
            var link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent.trim();
            list.appendChild(link);
            return link;
        });
        box.hidden = false;

        // Highlight the link for the heading that most recently crossed the upper part of the screen
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (link) {
                    var active = link.hash === '#' + entry.target.id;
                    link.classList.toggle('is-active', active);
                    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
                });
            });
        }, {rootMargin: '-80px 0px -60% 0px'});
        headings.forEach(function (heading) { observer.observe(heading); });
    }

    /* 3. Reading progress: the thin bar under the header fills as you read the article */
    function initProgress() {
        var bar = document.querySelector('.ce-progress-bar');
        var article = document.querySelector('.ce-content');
        if (!bar || !article) return;
        var ticking = false;

        function update() {
            var rect = article.getBoundingClientRect();
            var total = rect.height - window.innerHeight;
            var done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
            bar.style.transform = 'scaleX(' + done + ')';
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        }, {passive: true});
        update();
    }

    /* 4. Code blocks: a header with the language and a Copy button, line numbers, and
       "double-quoted strings" in the second code tone. Built with DOM nodes (no innerHTML),
       so code text is never interpreted as HTML. */
    function initCode() {
        document.querySelectorAll('.ce-content pre').forEach(function (pre) {
            var code = pre.querySelector('code');
            if (!code || pre.closest('.ce-code')) return;

            var text = code.textContent.replace(/\n$/, '');
            var lang = (code.className.match(/language-([\w+-]+)/) || [])[1];

            // Rebuild the code as one element per line: <span class="ce-line">…</span>
            code.textContent = '';
            text.split('\n').forEach(function (line) {
                var row = document.createElement('span');
                row.className = 'ce-line';
                line.split(/("(?:[^"\\\n]|\\.)*")/).forEach(function (part, i) {
                    if (!part) return;
                    if (i % 2 === 1) { // odd parts are the quoted strings
                        var str = document.createElement('span');
                        str.className = 'ce-str';
                        str.textContent = part;
                        row.appendChild(str);
                    } else {
                        row.appendChild(document.createTextNode(part));
                    }
                });
                code.appendChild(row); // block-level lines: selecting and copying still gives one line each
            });

            // Wrapper with a header: language label on the left, Copy on the right
            var wrap = document.createElement('div');
            wrap.className = 'ce-code';
            var head = document.createElement('div');
            head.className = 'ce-code-head';
            var label = document.createElement('span');
            label.textContent = lang ? lang.toUpperCase() : 'CODE';
            var copy = document.createElement('button');
            copy.type = 'button';
            copy.className = 'ce-code-copy';
            copy.textContent = 'Copy';
            copy.addEventListener('click', function () {
                if (!navigator.clipboard) return;
                navigator.clipboard.writeText(text).then(function () {
                    copy.textContent = 'Copied';
                    setTimeout(function () { copy.textContent = 'Copy'; }, 2000);
                });
            });
            head.appendChild(label);
            head.appendChild(copy);
            pre.parentNode.insertBefore(wrap, pre);
            wrap.appendChild(head);
            wrap.appendChild(pre);
        });
    }

    /* 5. Series list: mark the post you're on */
    function initSeries() {
        document.querySelectorAll('.ce-series-posts a').forEach(function (link) {
            if (link.pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
        });
    }

    /* 6. "/" opens Ghost's search, unless you are typing in a field */
    function initSearchKey() {
        var button = document.querySelector('.ce-search');
        if (!button) return;
        document.addEventListener('keydown', function (event) {
            if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
            var el = document.activeElement;
            if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
            event.preventDefault();
            button.click();
        });
    }

    function init() {
        initThemeToggle();
        initToc();
        initProgress();
        initCode();
        initSeries();
        initSearchKey();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link" aria-label="' + escapeHtml(movie.title) + '">' +
            '<span class="poster"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="play-mark">▶</span></span>' +
            '<span class="movie-card-body">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<span class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
            '<span class="movie-desc">' + escapeHtml(movie.summary) + '</span>' +
            '<span class="tag-row">' + tags + '</span>' +
            '</span></a></article>';
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;
            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('hidden', slideIndex !== current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }
            function move(step) {
                show(current + step);
            }
            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    move(1);
                }, 5600);
            }
            if (prev) {
                prev.addEventListener('click', function () {
                    move(-1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    move(1);
                    restart();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
            });
            show(0);
            restart();
        }

        var filterInput = document.querySelector('[data-card-filter]');
        if (filterInput) {
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
            filterInput.addEventListener('input', function () {
                var keyword = normalize(filterInput.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
                });
            });
        }

        var searchResults = document.getElementById('search-results');
        var searchInput = document.querySelector('[data-search-input]');
        var searchTitle = document.querySelector('[data-search-title]');
        if (searchResults && window.SEARCH_INDEX) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (searchInput) {
                searchInput.value = initialQuery;
            }
            function execute(query) {
                var keyword = normalize(query);
                if (!keyword) {
                    if (searchTitle) {
                        searchTitle.textContent = '推荐内容';
                    }
                    return;
                }
                var parts = keyword.split(/\s+/).filter(Boolean);
                var matches = window.SEARCH_INDEX.filter(function (movie) {
                    var haystack = normalize([
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        (movie.tags || []).join(' '),
                        movie.summary
                    ].join(' '));
                    return parts.every(function (part) {
                        return haystack.indexOf(part) !== -1;
                    });
                }).slice(0, 120);
                searchResults.innerHTML = matches.map(renderCard).join('');
                if (searchTitle) {
                    searchTitle.textContent = '“' + query + '”相关影片';
                }
            }
            execute(initialQuery);
        }
    });
}());

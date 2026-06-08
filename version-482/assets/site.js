document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initCategoryFilters();
    initSearchPage();
    initPlayers();
});

function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
    });
}

function initCategoryFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
        var scope = panel.parentElement;
        var list = scope.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var input = panel.querySelector('.filter-search');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
        var count = panel.querySelector('[data-filter-count]');
        var empty = scope.querySelector('[data-empty-state]');

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var activeFilters = {};

            selects.forEach(function (select) {
                var key = select.getAttribute('data-filter-key');
                if (key && select.value) {
                    activeFilters[key] = select.value;
                }
            });

            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.region,
                    card.dataset.tags
                ].join(' ').toLowerCase();

                var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                var filterOk = Object.keys(activeFilters).every(function (key) {
                    return (card.dataset[key] || '') === activeFilters[key];
                });

                var show = keywordOk && filterOk;
                card.hidden = !show;
                if (show) {
                    visibleCount += 1;
                }
            });

            if (count) {
                count.textContent = visibleCount + ' 部影片';
            }

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
    });
}

function initPlayers() {
    var shells = document.querySelectorAll('[data-video-src]');

    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        var message = shell.querySelector('[data-player-message]');
        var source = shell.getAttribute('data-video-src');
        var hlsInstance = null;

        if (!video || !overlay || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function startPlayback() {
            overlay.setAttribute('hidden', 'hidden');
            setMessage('正在加载播放源...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().then(function () {
                    setMessage('');
                }).catch(function () {
                    setMessage('浏览器已拦截自动播放，请再次点击播放按钮。');
                    overlay.removeAttribute('hidden');
                });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }

                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().then(function () {
                        setMessage('');
                    }).catch(function () {
                        setMessage('浏览器已拦截自动播放，请使用播放器控制条播放。');
                    });
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放源加载异常，请刷新页面后重试。');
                        overlay.removeAttribute('hidden');
                    }
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {
                setMessage('当前浏览器不支持 HLS 播放，请更换支持 m3u8 的浏览器。');
                overlay.removeAttribute('hidden');
            });
        }

        overlay.addEventListener('click', startPlayback);
    });
}

function initSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    var category = document.getElementById('search-category');
    var type = document.getElementById('search-type');
    var summary = document.getElementById('search-summary');
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!results || !input || !summary || !index.length) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    var types = Array.from(new Set(index.map(function (item) {
        return item.type;
    }).filter(Boolean))).sort();

    types.forEach(function (itemType) {
        var option = document.createElement('option');
        option.value = itemType;
        option.textContent = itemType;
        type.appendChild(option);
    });

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderCard(item) {
        return [
            '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
            '    <span class="poster-frame">',
            '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">',
            '        <span class="poster-gradient"></span>',
            '        <span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
            '        <span class="category-badge">' + escapeHtml(item.category) + '</span>',
            '    </span>',
            '    <span class="movie-card-body">',
            '        <strong>' + escapeHtml(item.title) + '</strong>',
            '        <span class="movie-desc">' + escapeHtml(item.one_line) + '</span>',
            '        <span class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.region) + '</span>',
            '    </span>',
            '</a>'
        ].join('
');
    }

    function applySearch() {
        var keyword = input.value.trim().toLowerCase();
        var selectedCategory = category ? category.value : '';
        var selectedType = type ? type.value : '';

        var matches = index.filter(function (item) {
            var haystack = [
                item.title,
                item.one_line,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.category,
                item.tags
            ].join(' ').toLowerCase();

            var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
            var categoryOk = !selectedCategory || item.category === selectedCategory;
            var typeOk = !selectedType || item.type === selectedType;
            return keywordOk && categoryOk && typeOk;
        });

        results.innerHTML = matches.slice(0, 240).map(renderCard).join('
');

        if (matches.length === 0) {
            summary.textContent = '没有找到符合条件的影片。';
        } else if (matches.length > 240) {
            summary.textContent = '找到 ' + matches.length + ' 部影片，当前显示前 240 部，请继续输入更精确的关键词。';
        } else {
            summary.textContent = '找到 ' + matches.length + ' 部影片。';
        }
    }

    input.addEventListener('input', applySearch);
    if (category) {
        category.addEventListener('change', applySearch);
    }
    if (type) {
        type.addEventListener('change', applySearch);
    }

    applySearch();
}

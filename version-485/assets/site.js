function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function initMobileNav() {
    const button = document.querySelector('[data-menu-button]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const previous = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const setActive = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    };

    const start = () => {
        timer = window.setInterval(() => setActive(activeIndex + 1), 5200);
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        start();
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActive(index);
            restart();
        });
    });

    if (previous) {
        previous.addEventListener('click', () => {
            setActive(activeIndex - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            setActive(activeIndex + 1);
            restart();
        });
    }

    setActive(0);
    start();
}

function getQueryValue(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function initFilters() {
    const scope = document.querySelector('[data-filter-scope]');

    if (!scope) {
        return;
    }

    const input = scope.querySelector('[data-search-input]');
    const buttons = Array.from(scope.querySelectorAll('[data-filter-button]'));
    const cards = Array.from(scope.querySelectorAll('[data-search-card]'));
    const emptyState = scope.querySelector('[data-empty-state]');
    const initialQuery = getQueryValue('q');
    let activeType = 'all';
    let activeValue = 'all';

    if (input && initialQuery) {
        input.value = initialQuery;
    }

    const apply = () => {
        const query = normalizeText(input ? input.value : '');
        let visibleCount = 0;

        cards.forEach((card) => {
            const text = normalizeText(card.dataset.text);
            const matchesQuery = !query || text.includes(query);
            let matchesButton = true;

            if (activeType !== 'all') {
                const cardValue = normalizeText(card.dataset[activeType]);
                matchesButton = cardValue.includes(normalizeText(activeValue));
            }

            const visible = matchesQuery && matchesButton;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    };

    if (input) {
        input.addEventListener('input', apply);
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.remove('is-active'));
            button.classList.add('is-active');
            activeType = button.dataset.filterType || 'all';
            activeValue = button.dataset.filterValue || 'all';
            apply();
        });
    });

    apply();
}

function initMoviePlayer(options) {
    ready(() => {
        const video = document.getElementById(options.videoId);
        const button = document.getElementById(options.buttonId);
        const overlay = document.getElementById(options.overlayId);
        const url = options.url;
        let hls = null;
        let loaded = false;

        if (!video || !url) {
            return;
        }

        const load = () => {
            if (loaded) {
                return;
            }

            const HlsConstructor = window.Hls;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (HlsConstructor && HlsConstructor.isSupported()) {
                hls = new HlsConstructor({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }

            loaded = true;
        };

        const play = () => {
            load();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            const request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(() => {});
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', () => {
            if (!loaded || video.paused) {
                play();
            }
        });

        window.addEventListener('pagehide', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

window.initMoviePlayer = initMoviePlayer;

ready(() => {
    initMobileNav();
    initHeroCarousel();
    initFilters();
});

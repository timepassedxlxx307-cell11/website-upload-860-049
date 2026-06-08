const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function() {
        mobileNav.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    let current = 0;
    let timer = null;

    function setHero(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        thumbs.forEach(function(thumb, thumbIndex) {
            thumb.classList.toggle("is-active", thumbIndex === current);
        });
    }

    function startHero() {
        window.clearInterval(timer);
        timer = window.setInterval(function() {
            setHero(current + 1);
        }, 5600);
    }

    thumbs.forEach(function(thumb) {
        thumb.addEventListener("click", function() {
            const index = Number(thumb.getAttribute("data-hero-thumb"));
            setHero(index);
            startHero();
        });
    });

    if (slides.length > 1) {
        startHero();
    }
}

document.querySelectorAll("[data-filter-root]").forEach(function(panel) {
    const section = panel.closest("section") || document;
    const searchInput = panel.querySelector("[data-search-input]");
    const categorySelect = panel.querySelector("[data-filter-category]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const cards = Array.from(section.querySelectorAll("[data-movie-card]"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (query && searchInput) {
        searchInput.value = query;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const words = normalize(searchInput ? searchInput.value : "");
        const category = categorySelect ? categorySelect.value : "";
        const region = regionSelect ? regionSelect.value : "";
        const year = yearSelect ? yearSelect.value : "";

        cards.forEach(function(card) {
            const haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-category")
            ].join(" "));
            const matchWords = !words || haystack.includes(words);
            const matchCategory = !category || card.getAttribute("data-category") === category;
            const matchRegion = !region || String(card.getAttribute("data-region") || "").includes(region);
            const matchYear = !year || card.getAttribute("data-year") === year;
            card.classList.toggle("is-filter-hidden", !(matchWords && matchCategory && matchRegion && matchYear));
        });
    }

    [searchInput, categorySelect, regionSelect, yearSelect].forEach(function(control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });

    applyFilters();
});

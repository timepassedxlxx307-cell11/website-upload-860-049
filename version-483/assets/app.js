(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        document.querySelectorAll("img[data-cover]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            });
        });

        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var term = input ? input.value.trim() : "";
                if (!term) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                var action = form.getAttribute("action") || "search.html";
                window.location.href = action + "?q=" + encodeURIComponent(term);
            });
        });

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var next = carousel.querySelector("[data-hero-next]");
            var prev = carousel.querySelector("[data-hero-prev]");
            var index = 0;
            var timer = null;

            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("is-active", itemIndex === index);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("is-active", itemIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var section = input.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".js-filter-card"));
            input.addEventListener("input", function () {
                var term = normalize(input.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-filter-text") || card.textContent);
                    card.classList.toggle("is-hidden-by-filter", term && text.indexOf(term) === -1);
                });
            });
        });

        var searchInput = document.getElementById("searchInput");
        var searchButton = document.getElementById("searchButton");
        var searchResults = document.getElementById("searchResults");
        var searchItems = window.siteSearchItems || [];

        function cardTemplate(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\">" +
                "<span class=\"poster-frame\">" +
                "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" data-cover=\"true\">" +
                "<span class=\"poster-shade\"></span>" +
                "<span class=\"badge badge-category\">" + escapeHtml(item.category) + "</span>" +
                "<span class=\"poster-play\">▶</span>" +
                "</span>" +
                "<span class=\"movie-card-body\">" +
                "<strong>" + escapeHtml(item.title) + "</strong>" +
                "<em>" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</em>" +
                "<span class=\"card-desc\">" + escapeHtml(item.desc) + "</span>" +
                "<span class=\"tag-row\">" + tags + "</span>" +
                "</span>" +
                "</a>";
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>\"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function runSearch(value) {
            if (!searchResults || !searchItems.length) {
                return;
            }
            var term = normalize(value);
            var results = searchItems.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.category,
                    item.genre,
                    (item.tags || []).join(" "),
                    item.desc
                ].join(" "));
                return !term || text.indexOf(term) !== -1;
            }).slice(0, 60);
            searchResults.innerHTML = results.map(cardTemplate).join("");
            searchResults.querySelectorAll("img[data-cover]").forEach(function (image) {
                image.addEventListener("error", function () {
                    image.style.opacity = "0";
                });
            });
        }

        if (searchInput && searchResults) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;
            runSearch(initial);
            searchInput.addEventListener("input", function () {
                runSearch(searchInput.value);
            });
            if (searchButton) {
                searchButton.addEventListener("click", function () {
                    runSearch(searchInput.value);
                });
            }
            document.querySelectorAll("[data-search-chip]").forEach(function (chip) {
                chip.addEventListener("click", function () {
                    searchInput.value = chip.getAttribute("data-search-chip") || "";
                    runSearch(searchInput.value);
                });
            });
        }
    });
})();

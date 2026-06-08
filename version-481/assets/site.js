(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.getElementById("mobileMenu");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var filterGrid = document.querySelector("[data-filter-grid]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
        if (filterGrid && filterButtons.length) {
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
            filterButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-button");
                    filterButtons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var text = [
                            card.getAttribute("data-title") || "",
                            card.getAttribute("data-year") || "",
                            card.getAttribute("data-type") || "",
                            card.getAttribute("data-tags") || ""
                        ].join(" ");
                        card.style.display = value === "all" || text.indexOf(value) !== -1 ? "" : "none";
                    });
                });
            });
        }

        var searchGrid = document.querySelector("[data-search-grid]");
        if (searchGrid) {
            var params = new URLSearchParams(window.location.search);
            var query = (params.get("q") || "").trim();
            var form = document.querySelector("[data-search-form]");
            var input = form ? form.querySelector("input[name='q']") : null;
            var state = document.querySelector("[data-search-state]");
            var empty = document.querySelector("[data-empty-state]");
            var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));
            var runSearch = function (value) {
                var term = value.trim().toLowerCase();
                var visible = 0;
                searchCards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-tags") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var matched = !term || text.indexOf(term) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (state) {
                    state.textContent = term ? "已为你匹配相关内容。" : "输入关键词后，页面会自动匹配相关内容。";
                }
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            if (input) {
                input.value = query;
                input.addEventListener("input", function () {
                    runSearch(input.value);
                });
            }
            runSearch(query);
        }
    });
})();

function initializeMoviePlayer(source, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !source) {
        return;
    }
    var attached = false;
    var hlsInstance = null;
    var attachSource = function () {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    };
    var start = function () {
        attachSource();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var playAction = video.play();
        if (playAction && typeof playAction.catch === "function") {
            playAction.catch(function () {});
        }
    };
    if (cover) {
        cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("error", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
